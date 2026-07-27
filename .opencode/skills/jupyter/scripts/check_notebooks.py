#!/usr/bin/env python3
"""Validate and audit Jupyter notebooks for reproducible version control."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

import nbformat
from nbformat import reader as nb_reader

from notebook_utils import (
    NotebookContractError,
    count_cell_id_issues,
    ensure_unique_cell_ids,
    read_notebook,
    validate_notebook,
    write_json_atomic,
    write_notebook_atomic,
)


NOTEBOOK_INPUT_ERRORS = (
    NotebookContractError,
    nbformat.NBFormatError,
    nbformat.ValidationError,
    nb_reader.NotJSONError,
    OSError,
    UnicodeError,
)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Scan notebooks in deterministic order, validate structure, and enforce "
            "optional output policy."
        )
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["."],
        help="Notebook files or directories to scan. Defaults to current directory.",
    )
    parser.add_argument(
        "--glob",
        default="**/*.ipynb",
        help="Glob pattern used when scanning directories (default: **/*.ipynb).",
    )
    parser.add_argument(
        "--output-policy",
        choices=["preserve", "clear"],
        default="preserve",
        help=(
            "preserve: allow notebook outputs as-is. "
            "clear: require every code cell to have no outputs and null execution_count."
        ),
    )
    parser.add_argument(
        "--fix-cell-ids",
        action="store_true",
        help="Fix invalid, missing, or duplicate cell IDs in place before final validation.",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Stop after the first notebook with one or more issues.",
    )
    parser.add_argument(
        "--report-json",
        type=Path,
        default=None,
        help="Optional path to write JSON results.",
    )
    return parser.parse_args()


def _collect_notebooks(raw_paths: list[str], pattern: str) -> list[Path]:
    results: set[Path] = set()
    for raw in raw_paths:
        path = Path(raw)
        if not path.exists():
            raise FileNotFoundError(f"Input path not found: {path}")
        if path.is_file():
            if path.suffix.lower() != ".ipynb":
                raise NotebookContractError(f"Explicit input is not a .ipynb file: {path}")
            results.add(path)
            continue
        if path.is_dir():
            for candidate in path.glob(pattern):
                if candidate.is_file() and candidate.suffix.lower() == ".ipynb":
                    results.add(candidate)

    return sorted(results)


def _count_output_violations(nb: Any) -> tuple[int, int]:
    code_cells = 0
    violations = 0
    for cell in nb.cells:
        if cell.cell_type != "code":
            continue
        code_cells += 1
        if cell.outputs or cell.execution_count is not None:
            violations += 1
    return code_cells, violations


def _make_result(path: Path) -> dict[str, Any]:
    return {
        "path": str(path),
        "issues": [],
        "fixed_cell_ids": 0,
        "code_cells": 0,
        "output_violations": 0,
        "wrote_fixes": False,
    }


def _append_issue(result: dict[str, Any], message: str) -> None:
    result["issues"].append(message)


def _check_one(path: Path, args: argparse.Namespace) -> dict[str, Any]:
    result = _make_result(path)

    try:
        nb = read_notebook(path)
        missing, duplicates, invalid = count_cell_id_issues(nb)
    except NOTEBOOK_INPUT_ERRORS as exc:
        _append_issue(result, f"read failed: {exc}")
        return result

    if missing or duplicates or invalid:
        if args.fix_cell_ids:
            result["fixed_cell_ids"] = ensure_unique_cell_ids(nb)
            missing, duplicates, invalid = count_cell_id_issues(nb)
        if missing:
            _append_issue(result, f"missing cell ids: {missing}")
        if duplicates:
            _append_issue(result, f"duplicate cell ids: {duplicates}")
        if invalid:
            _append_issue(result, f"invalid cell ids (must match [A-Za-z0-9_-]{{1,64}}): {invalid}")

    schema_valid = not (missing or duplicates or invalid)
    if schema_valid:
        try:
            validate_notebook(nb)
        except (NotebookContractError, nbformat.ValidationError) as exc:
            _append_issue(result, f"nbformat.validate failed: {exc}")
            schema_valid = False

    if args.output_policy == "clear" and schema_valid:
        code_cells, violations = _count_output_violations(nb)
        result["code_cells"] = code_cells
        result["output_violations"] = violations
        if violations:
            _append_issue(
                result,
                f"output policy 'clear' violated in {violations}/{code_cells} code cell(s)",
            )

    if args.fix_cell_ids and result["fixed_cell_ids"] > 0 and not result["issues"]:
        try:
            write_notebook_atomic(nb, path)
            result["wrote_fixes"] = True
        except (NotebookContractError, nbformat.ValidationError, OSError) as exc:
            _append_issue(result, f"write failed: {exc}")
    elif args.fix_cell_ids and result["fixed_cell_ids"] > 0 and result["issues"]:
        _append_issue(
            result,
            "cell ids fixed in memory but file not written due to remaining issues",
        )

    return result


def _print_summary(results: list[dict[str, Any]], args: argparse.Namespace) -> None:
    total = len(results)
    failures = sum(1 for result in results if result["issues"])
    successes = total - failures
    wrote = sum(1 for result in results if result["wrote_fixes"])

    print(f"Checked {total} notebook(s): {successes} passed, {failures} failed")
    if args.fix_cell_ids:
        print(f"Wrote cell-id fixes to {wrote} notebook(s)")

    for result in results:
        if not result["issues"]:
            continue
        print(f"\n{result['path']}")
        for issue in result["issues"]:
            print(f"- {issue}")


def run(args: argparse.Namespace) -> int:
    notebooks = _collect_notebooks(args.paths, args.glob)
    if not notebooks:
        print("No notebooks found for the requested paths/pattern.", file=sys.stderr)
        return 1

    results: list[dict[str, Any]] = []
    for path in notebooks:
        result = _check_one(path, args)
        results.append(result)
        if args.fail_fast and result["issues"]:
            break

    _print_summary(results, args)

    if args.report_json:
        write_json_atomic({"results": results}, args.report_json)

    return 1 if any(result["issues"] for result in results) else 0


def main() -> None:
    args = _parse_args()
    try:
        raise SystemExit(run(args))
    except (NotebookContractError, FileNotFoundError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
