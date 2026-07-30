#!/usr/bin/env python3
"""Run a command repeatedly under a bounded, versioned benchmark protocol."""

from __future__ import annotations

import argparse
import math
import os
import re
import subprocess
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from time import perf_counter
from typing import IO

from _artifact_io import ArtifactError, sample_stats, write_json_atomic


class BenchCommandError(RuntimeError):
    """Raised when a warmup or measured command does not finish successfully."""


def _parse_pairs(items: list[str], label: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for item in items:
        if "=" not in item:
            raise ArtifactError(f"invalid {label} {item!r}; expected KEY=VALUE")
        key, value = item.split("=", 1)
        if not key or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key):
            raise ArtifactError(f"invalid {label} key: {key!r}")
        if key in result:
            raise ArtifactError(f"duplicate {label} key: {key}")
        if "\x00" in value:
            raise ArtifactError(f"{label} value contains a NUL byte: {key}")
        result[key] = value
    return result


def _terminate(process: subprocess.Popen[bytes]) -> None:
    if os.name == "nt":
        # Windows has no process groups here; kill the direct child only.
        process.kill()
        process.wait()
        return
    os.killpg(process.pid, 15)
    try:
        process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, 9)
        process.wait()


def _tail(stream: IO[bytes], limit: int = 4000) -> str:
    stream.seek(0, os.SEEK_END)
    size = stream.tell()
    stream.seek(max(0, size - limit))
    return stream.read().decode("utf-8", errors="replace").strip()


def _run_once(
    command: list[str],
    cwd: Path,
    environment: dict[str, str],
    quiet: bool,
    timeout_s: float,
    stage: str,
) -> float:
    with tempfile.TemporaryFile() as stdout, tempfile.TemporaryFile() as stderr:
        started = perf_counter()
        process = subprocess.Popen(
            command,
            cwd=cwd,
            env=environment,
            stdout=stdout if quiet else None,
            stderr=stderr if quiet else None,
            start_new_session=True,
        )
        try:
            returncode = process.wait(timeout=timeout_s)
        except subprocess.TimeoutExpired as exc:
            _terminate(process)
            raise BenchCommandError(f"{stage} exceeded {timeout_s:g} seconds") from exc
        elapsed = perf_counter() - started
        if returncode != 0:
            detail = _tail(stderr) if quiet else "see command output above"
            raise BenchCommandError(f"{stage} exited {returncode}: {detail}")
        return elapsed


def _validate_protocol(args: argparse.Namespace) -> None:
    if not 0 <= args.warmup <= 1000:
        raise ArtifactError("--warmup must be between 0 and 1000")
    if not 1 <= args.runs <= 10000:
        raise ArtifactError("--runs must be between 1 and 10000")
    if not math.isfinite(args.timeout_s) or not 0 < args.timeout_s <= 86400:
        raise ArtifactError("--timeout-s must be finite and in (0, 86400]")
    if not args.cwd.is_dir():
        raise ArtifactError(f"--cwd is not a directory: {args.cwd}")


def _portable_cwd(path: Path) -> tuple[Path, str]:
    invocation_root = Path.cwd().resolve()
    resolved = path.expanduser().resolve()
    try:
        relative = resolved.relative_to(invocation_root)
    except ValueError as exc:
        raise ArtifactError(
            "--cwd must stay within the invocation directory so the artifact "
            "does not expose an absolute machine path"
        ) from exc
    recorded = "." if relative == Path(".") else relative.as_posix()
    return resolved, recorded


def _command_from_args(args: argparse.Namespace) -> list[str]:
    command = list(args.command)
    if command and command[0] == "--":
        command = command[1:]
    if not command:
        raise ArtifactError("command required; use: run_bench.py [options] -- <command>")
    return command


def run_benchmark(args: argparse.Namespace) -> dict[str, object]:
    _validate_protocol(args)
    cwd, recorded_cwd = _portable_cwd(args.cwd)
    command = _command_from_args(args)
    environment = os.environ.copy()
    overrides = _parse_pairs(args.env, "environment override")
    secret_overrides = _parse_pairs(args.secret_env, "secret environment override")
    overlap = sorted(set(overrides) & set(secret_overrides))
    if overlap:
        raise ArtifactError(f"environment keys declared twice: {', '.join(overlap)}")
    environment.update(overrides)
    environment.update(secret_overrides)
    metadata = _parse_pairs(args.metadata, "metadata")
    for index in range(args.warmup):
        _run_once(
            command, cwd, environment, args.quiet, args.timeout_s,
            f"warmup {index + 1}",
        )
    samples = [
        _run_once(
            command, cwd, environment, args.quiet, args.timeout_s,
            f"measured run {index + 1}",
        )
        for index in range(args.runs)
    ]
    return {
        "schema": "performance-bench-v4",
        "timestamp": datetime.now(UTC).isoformat(),
        "label": args.label,
        "command": command,
        "cwd": recorded_cwd,
        "warmup": args.warmup,
        "runs": args.runs,
        "timeout_s": args.timeout_s,
        "environment": {
            "env_overrides": overrides,
            "secret_env_keys": sorted(secret_overrides),
        },
        "metadata": metadata,
        "durations_s": samples,
        "stats": sample_stats(samples),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--label", required=True, help="Stable benchmark label")
    parser.add_argument("--warmup", type=int, default=1)
    parser.add_argument("--runs", type=int, default=5)
    parser.add_argument("--timeout-s", type=float, default=300.0)
    parser.add_argument("--out", type=Path, default=Path("bench.json"))
    parser.add_argument("--cwd", type=Path, default=Path("."))
    parser.add_argument("--env", action="append", default=[], help="Recorded KEY=VALUE")
    parser.add_argument("--secret-env", action="append", default=[], help="Redacted KEY=VALUE")
    parser.add_argument("--metadata", action="append", default=[], help="KEY=VALUE")
    parser.add_argument("--quiet", action="store_true", help="Capture command output")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        payload = run_benchmark(args)
        write_json_atomic(payload, args.out, [], args.overwrite)
    except (ArtifactError, BenchCommandError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(f"Wrote {args.runs} samples to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
