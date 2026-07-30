#!/usr/bin/env python3
"""Scan a Git working tree for narrow, technical release blockers."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path


MAX_TEXT_BYTES = 2_000_000
LARGE_FILE_BYTES = 20_000_000
BLOCKED_SUFFIXES = {
    ".keychain",
    ".mobileprovision",
    ".p12",
    ".pfx",
    ".provisionprofile",
}
ACCIDENTAL_NAMES = {
    ".DS_Store",
    "debug.log",
    "npm-debug.log",
    "yarn-error.log",
}
ACCIDENTAL_SUFFIXES = {".pyc", ".pyo", ".swp", ".tmp"}


@dataclass(frozen=True)
class Finding:
    severity: str
    category: str
    path: str
    line: int
    message: str


@dataclass
class Coverage:
    enumerated: int = 0
    scanned_text: int = 0
    skipped_binary: int = 0
    skipped_large: int = 0


@dataclass(frozen=True)
class Rule:
    category: str
    regex: re.Pattern[str]
    message: str


SECRET_RULES = (
    Rule(
        "private-key",
        re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA |)?PRIVATE KEY-----"),
        "Private key material is present.",
    ),
    Rule(
        "github-token",
        re.compile(r"\b(?:github_pat|gh[opusr])_[A-Za-z0-9_]{20,}\b"),
        "GitHub token-like value is present.",
    ),
    Rule(
        "openai-key",
        re.compile(r"\bsk-(?!ant-)(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b"),
        "OpenAI API key-like value is present.",
    ),
    Rule(
        "anthropic-key",
        re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b"),
        "Anthropic API key-like value is present.",
    ),
    Rule(
        "aws-access-key",
        re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"),
        "AWS access key ID-like value is present.",
    ),
    Rule(
        "slack-token",
        re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
        "Slack token-like value is present.",
    ),
    Rule(
        "stripe-live-key",
        re.compile(r"\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b"),
        "Stripe live key-like value is present.",
    ),
    Rule(
        "npm-token",
        re.compile(r"\bnpm_[A-Za-z0-9]{20,}\b"),
        "npm token-like value is present.",
    ),
    Rule(
        "huggingface-token",
        re.compile(r"\bhf_[A-Za-z0-9]{20,}\b"),
        "Hugging Face token-like value is present.",
    ),
)
CONFLICT_START = re.compile(r"^<<<<<<< ")
CONFLICT_CONTINUATION = re.compile(r"^(?:=======\s*$|>>>>>>> )")


def run_git(root: Path, args: list[str]) -> bytes:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), *args],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=15,
        )
    except subprocess.TimeoutExpired as exc:
        raise SystemExit("Git repository inspection timed out") from exc
    if result.returncode:
        detail = result.stderr.decode("utf-8", errors="replace").strip()[-2000:]
        raise SystemExit(f"Git repository inspection failed: {detail}")
    return result.stdout


def require_repo_root(root: Path) -> None:
    if not root.is_dir():
        raise SystemExit(f"Repository root is not a directory: {root}")
    declared = Path(
        os.fsdecode(run_git(root, ["rev-parse", "--show-toplevel"])).strip()
    ).resolve()
    if declared != root:
        raise SystemExit(f"Path must be the Git repository root: {declared}")


def repo_files(root: Path) -> list[Path]:
    raw = run_git(root, ["ls-files", "-co", "--exclude-standard", "-z"])
    paths: list[Path] = []
    for encoded in raw.split(b"\0"):
        if not encoded:
            continue
        relative = Path(os.fsdecode(encoded))
        if relative.is_absolute() or ".." in relative.parts:
            raise SystemExit(f"Git returned an unsafe path: {relative}")
        path = root / relative
        if path.exists() or path.is_symlink():
            paths.append(path)
    return paths


def relative(path: Path, root: Path) -> str:
    return str(path.relative_to(root))


def finding(
    severity: str,
    category: str,
    path: Path,
    root: Path,
    message: str,
    line: int = 0,
) -> Finding:
    return Finding(severity, category, relative(path, root), line, message)


def scan_path(path: Path, root: Path, findings: list[Finding], coverage: Coverage) -> None:
    coverage.enumerated += 1
    lower_name = path.name.lower()

    if path.is_symlink():
        try:
            path.resolve(strict=True).relative_to(root)
        except (FileNotFoundError, ValueError):
            findings.append(
                finding(
                    "BLOCKER",
                    "unsafe-symlink",
                    path,
                    root,
                    "Symlink is broken or resolves outside the repository.",
                )
            )
        return

    if not path.is_file():
        return
    if (
        path.name in ACCIDENTAL_NAMES
        or path.suffix.lower() in ACCIDENTAL_SUFFIXES
        or "__pycache__" in path.parts
    ):
        findings.append(
            finding(
                "BLOCKER",
                "generated-file",
                path,
                root,
                "Generated or scratch file is included in the publish set.",
            )
        )
    if lower_name == ".env" or (
        lower_name.startswith(".env.")
        and not lower_name.endswith((".example", ".sample", ".template"))
    ):
        findings.append(
            finding(
                "BLOCKER",
                "environment-file",
                path,
                root,
                "Environment file is included in the publish set.",
            )
        )
    if path.suffix.lower() in BLOCKED_SUFFIXES:
        findings.append(
            finding(
                "BLOCKER",
                "credential-container",
                path,
                root,
                "Credential or signing container is included in the publish set.",
            )
        )

    try:
        size = path.stat().st_size
        with path.open("rb") as stream:
            prefix = stream.read(4096)
            if b"\0" in prefix:
                coverage.skipped_binary += 1
                return
            if size > LARGE_FILE_BYTES:
                coverage.skipped_large += 1
                findings.append(
                    finding(
                        "WARN",
                        "large-file",
                        path,
                        root,
                        (
                            f"Text-like file is larger than {LARGE_FILE_BYTES} "
                            "bytes and was not scanned."
                        ),
                    )
                )
                return
            if size > MAX_TEXT_BYTES:
                coverage.skipped_large += 1
                findings.append(
                    finding(
                        "WARN",
                        "oversized-text",
                        path,
                        root,
                        (
                            f"Text-like file is larger than {MAX_TEXT_BYTES} "
                            "bytes and was not scanned."
                        ),
                    )
                )
                return
            data = prefix + stream.read()
    except OSError as exc:
        findings.append(
            finding(
                "BLOCKER",
                "unreadable-file",
                path,
                root,
                f"File could not be read: {type(exc).__name__}.",
            )
        )
        return

    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        coverage.skipped_binary += 1
        return

    coverage.scanned_text += 1
    in_conflict = False
    for line_number, line in enumerate(text.splitlines(), start=1):
        for rule in SECRET_RULES:
            if rule.regex.search(line):
                findings.append(
                    finding(
                        "BLOCKER",
                        rule.category,
                        path,
                        root,
                        rule.message,
                        line_number,
                    )
                )
        # A lone ======= also underlines a markdown setext heading; flag the
        # divider and closer only inside an open conflict block.
        if CONFLICT_START.match(line) or (
            in_conflict and CONFLICT_CONTINUATION.match(line)
        ):
            findings.append(
                finding(
                    "BLOCKER",
                    "merge-marker",
                    path,
                    root,
                    "Unresolved merge marker is present.",
                    line_number,
                )
            )
            in_conflict = not line.startswith(">>>>>>> ")


def scan(root: Path) -> tuple[list[Finding], Coverage]:
    require_repo_root(root)
    findings: list[Finding] = []
    coverage = Coverage()
    for path in repo_files(root):
        scan_path(path, root, findings, coverage)
    findings.sort(key=lambda item: (item.path, item.line, item.category))
    return findings, coverage


def parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scan Git files for narrow release blockers."
    )
    parser.add_argument("path", nargs="?", default=".", help="Git repository root")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    parser.add_argument(
        "--strict", action="store_true", help="Exit non-zero on warnings too"
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    root = Path(args.path).expanduser().resolve()
    findings, coverage = scan(root)
    blockers = sum(item.severity == "BLOCKER" for item in findings)
    warnings = sum(item.severity == "WARN" for item in findings)
    if args.json:
        print(
            json.dumps(
                {
                    "schema_version": "publish-safety-scan.v3",
                    "root": ".",
                    "blockers": blockers,
                    "warnings": warnings,
                    "coverage": asdict(coverage),
                    "findings": [asdict(item) for item in findings],
                },
                indent=2,
                sort_keys=True,
            )
        )
    else:
        print(f"Release scan: {blockers} blockers, {warnings} warnings")
        print(
            "Coverage: "
            f"{coverage.scanned_text}/{coverage.enumerated} text files scanned; "
            f"{coverage.skipped_binary} binary, {coverage.skipped_large} oversized"
        )
        for item in findings:
            print(
                f"{item.severity} {item.path}:{item.line} "
                f"{item.category}: {item.message}"
            )
    return 2 if blockers or (args.strict and warnings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
