#!/usr/bin/env python3
"""Scan Python code for common defensive-bloat patterns.

This script is intentionally heuristic. It is designed to quickly surface
high-signal issues for review, not to replace code review.
"""

from __future__ import annotations

import argparse
import ast
import io
import json
import re
import tokenize
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, Sequence


DEFAULT_EXCLUDED_DIRS = {
    ".git",
    ".venv",
    "venv",
    "env",
    "node_modules",
    "dist",
    "build",
    "__pycache__",
    ".mypy_cache",
    ".ruff_cache",
    ".pytest_cache",
}
PYTHON_EXTS = {".py", ".pyi"}

TYPE_IGNORE_RE = re.compile(r"#\s*type:\s*ignore(?:\[[^]]+\])?")
PYRIGHT_IGNORE_RE = re.compile(r"#\s*pyright:\s*ignore(?:\[[^]]+\])?")
MYPY_IGNORE_ERRORS_RE = re.compile(r"#\s*mypy:\s*ignore-errors")
@dataclass
class Finding:
    path: str
    line: int
    severity: str
    kind: str
    message: str
    snippet: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "paths",
        nargs="*",
        default=["."],
        help="Files or directories to scan (default: current directory).",
    )
    parser.add_argument(
        "--exclude-dir",
        action="append",
        default=[],
        help="Directory name to exclude (can be used multiple times).",
    )
    parser.add_argument(
        "--fail-on",
        choices=("none", "error", "warning"),
        default="error",
        help="Exit non-zero when findings match this severity threshold.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit findings as JSON.",
    )
    return parser.parse_args()


def iter_python_files(paths: Sequence[str], excluded_dirs: set[str]) -> Iterable[Path]:
    seen: set[Path] = set()
    for raw in paths:
        root = Path(raw)
        if not root.exists():
            continue
        if root.is_file() and root.suffix in PYTHON_EXTS:
            resolved = root.resolve()
            if resolved not in seen:
                seen.add(resolved)
                yield resolved
            continue
        if not root.is_dir():
            continue
        for path in root.rglob("*"):
            if any(part in excluded_dirs for part in path.parts):
                continue
            if path.is_file() and path.suffix in PYTHON_EXTS:
                resolved = path.resolve()
                if resolved not in seen:
                    seen.add(resolved)
                    yield resolved


def scan_text(path: Path, source: str) -> list[Finding]:
    findings: list[Finding] = []
    rel = str(path)
    lines = source.splitlines()
    try:
        tokens = tokenize.generate_tokens(io.StringIO(source).readline)
    except tokenize.TokenError:
        tokens = []

    for tok in tokens:
        if tok.type != tokenize.COMMENT:
            continue
        idx = tok.start[0]
        comment = tok.string
        snippet = lines[idx - 1].rstrip() if 0 < idx <= len(lines) else comment
        if TYPE_IGNORE_RE.search(comment):
            findings.append(
                Finding(
                    path=rel,
                    line=idx,
                    severity="error",
                    kind="type-ignore",
                    message="Avoid '# type: ignore'; fix the type contract instead.",
                    snippet=snippet,
                )
            )
        if PYRIGHT_IGNORE_RE.search(comment):
            findings.append(
                Finding(
                    path=rel,
                    line=idx,
                    severity="error",
                    kind="pyright-ignore",
                    message="Avoid '# pyright: ignore'; fix the type contract instead.",
                    snippet=snippet,
                )
            )
        if MYPY_IGNORE_ERRORS_RE.search(comment):
            findings.append(
                Finding(
                    path=rel,
                    line=idx,
                    severity="error",
                    kind="mypy-ignore-errors",
                    message=(
                        "Avoid '# mypy: ignore-errors'; resolve specific typing issues."
                    ),
                    snippet=snippet,
                )
            )
    return findings


def _is_broad_exception(node: ast.expr) -> bool:
    if isinstance(node, ast.Name):
        return node.id in {"Exception", "BaseException"}
    if isinstance(node, ast.Attribute):
        return node.attr in {"Exception", "BaseException"}
    if isinstance(node, ast.Tuple):
        return any(_is_broad_exception(item) for item in node.elts)
    return False


def scan_ast(path: Path, source: str) -> list[Finding]:
    findings: list[Finding] = []
    rel = str(path)
    lines = source.splitlines()
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return findings

    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "cast" and node.args:
                first_arg = node.args[0]
                if (
                    isinstance(first_arg, ast.Name)
                    and first_arg.id == "Any"
                    or isinstance(first_arg, ast.Attribute)
                    and first_arg.attr == "Any"
                ):
                    line = getattr(node, "lineno", 1)
                    snippet = (
                        lines[line - 1].rstrip() if 0 < line <= len(lines) else "cast(Any, ...)"
                    )
                    findings.append(
                        Finding(
                            path=rel,
                            line=line,
                            severity="warning",
                            kind="cast-any",
                            message=(
                                "Review cast(Any, ...); this may be masking a typing issue."
                            ),
                            snippet=snippet,
                        )
                    )

        if not isinstance(node, ast.Try):
            continue
        for handler in node.handlers:
            line = getattr(handler, "lineno", 1)
            snippet = lines[line - 1].rstrip() if 0 < line <= len(lines) else "except:"
            if handler.type is None:
                findings.append(
                    Finding(
                        path=rel,
                        line=line,
                        severity="error",
                        kind="bare-except",
                        message="Bare 'except:' is disallowed; catch a specific exception.",
                        snippet=snippet,
                    )
                )
            elif _is_broad_exception(handler.type):
                findings.append(
                    Finding(
                        path=rel,
                        line=line,
                        severity="error",
                        kind="except-exception",
                        message=(
                            "Broad 'except Exception' or 'except BaseException' "
                            "is disallowed in core logic."
                        ),
                        snippet=snippet,
                    )
                )

    return findings


def should_fail(findings: list[Finding], fail_on: str) -> bool:
    if fail_on == "none":
        return False
    if fail_on == "warning":
        return bool(findings)
    return any(f.severity == "error" for f in findings)


def print_text(findings: list[Finding]) -> None:
    if not findings:
        print("No bloat-pattern findings.")
        return
    for finding in findings:
        print(
            f"{finding.path}:{finding.line}: {finding.severity} "
            f"[{finding.kind}] {finding.message}"
        )
        print(f"  {finding.snippet}")
    total_errors = sum(1 for f in findings if f.severity == "error")
    total_warnings = sum(1 for f in findings if f.severity == "warning")
    print(
        f"\nFindings: {len(findings)} total "
        f"({total_errors} errors, {total_warnings} warnings)."
    )


def main() -> int:
    args = parse_args()
    excluded_dirs = set(DEFAULT_EXCLUDED_DIRS)
    excluded_dirs.update(args.exclude_dir)

    findings: list[Finding] = []
    for path in iter_python_files(args.paths, excluded_dirs):
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            source = path.read_text(errors="ignore")
        findings.extend(scan_text(path, source))
        findings.extend(scan_ast(path, source))

    findings.sort(key=lambda f: (f.path, f.line, f.severity, f.kind))

    if args.json:
        print(json.dumps([asdict(f) for f in findings], indent=2))
    else:
        print_text(findings)

    return 1 if should_fail(findings, args.fail_on) else 0


if __name__ == "__main__":
    raise SystemExit(main())
