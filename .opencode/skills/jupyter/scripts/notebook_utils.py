#!/usr/bin/env python3
"""Shared fail-closed notebook I/O and cell-ID helpers."""

from __future__ import annotations

import hashlib
import json
import os
import re
import stat
import tempfile
from copy import deepcopy
from pathlib import Path
from typing import Any

import nbformat
from nbformat import NotebookNode
from nbformat import reader as nb_reader


CELL_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


class NotebookContractError(ValueError):
    """Raised when a notebook violates this skill's explicit contract."""


def require_notebook_path(path: Path, *, must_exist: bool) -> None:
    if path.suffix.lower() != ".ipynb":
        raise NotebookContractError(f"Notebook path must end in .ipynb: {path}")
    if path.is_symlink():
        raise NotebookContractError(
            f"Refusing notebook symlink path; resolve the intended target explicitly: {path}"
        )
    if must_exist and not path.is_file():
        raise NotebookContractError(f"Notebook file not found: {path}")
    if not must_exist and path.exists() and not path.is_file():
        raise NotebookContractError(f"Notebook output is not a regular file: {path}")


def read_notebook(path: Path) -> NotebookNode:
    """Read without nbformat's validation-time ID repair."""
    require_notebook_path(path, must_exist=True)
    text = path.read_text(encoding="utf-8")
    try:
        return nb_reader.reads(text)
    except AttributeError as exc:
        raise NotebookContractError(f"Notebook root must be a JSON object: {path}") from exc


def require_v4(nb: NotebookNode) -> None:
    if getattr(nb, "nbformat", None) != 4:
        version = getattr(nb, "nbformat", "unknown")
        raise NotebookContractError(
            f"Notebook format v{version} is unsupported here; standardize it to v4 first."
        )
    if not isinstance(getattr(nb, "cells", None), list):
        raise NotebookContractError("Notebook cells must be a list.")


def _is_valid_cell_id(cell_id: Any) -> bool:
    return isinstance(cell_id, str) and bool(CELL_ID_RE.fullmatch(cell_id))


def cell_ids_required(nb: NotebookNode) -> bool:
    return nb.nbformat == 4 and getattr(nb, "nbformat_minor", 0) >= 5


def count_cell_id_issues(nb: NotebookNode) -> tuple[int, int, int]:
    require_v4(nb)
    seen: set[str] = set()
    missing = duplicates = invalid = 0
    for cell in nb.cells:
        cell_id = getattr(cell, "id", None)
        if not isinstance(cell_id, str) or not cell_id:
            missing += int(cell_ids_required(nb))
        elif not _is_valid_cell_id(cell_id):
            invalid += 1
        elif cell_id in seen:
            duplicates += 1
        else:
            seen.add(cell_id)
    return missing, duplicates, invalid


def _generated_cell_id(cell: NotebookNode, index: int, unavailable: set[str]) -> str:
    cell_type = getattr(cell, "cell_type", None)
    source_value = getattr(cell, "source", None)
    if not isinstance(cell_type, str) or not isinstance(source_value, (str, list)):
        raise NotebookContractError(
            f"Cannot generate an ID for malformed cell at index {index}."
        )
    source = source_value if isinstance(source_value, str) else "".join(source_value)
    nonce = 0
    while True:
        material = f"{index}\0{cell_type}\0{source}\0{nonce}".encode("utf-8")
        candidate = hashlib.sha256(material).hexdigest()[:12]
        if candidate not in unavailable:
            return candidate
        nonce += 1


def ensure_unique_cell_ids(nb: NotebookNode) -> int:
    require_v4(nb)
    if not cell_ids_required(nb):
        return 0
    reserved = {
        cell.id for cell in nb.cells if _is_valid_cell_id(getattr(cell, "id", None))
    }
    seen: set[str] = set()
    fixed = 0
    for index, cell in enumerate(nb.cells):
        cell_id = getattr(cell, "id", None)
        if not _is_valid_cell_id(cell_id) or cell_id in seen:
            cell.id = _generated_cell_id(cell, index, reserved | seen)
            reserved.add(cell.id)
            fixed += 1
        seen.add(cell.id)
    return fixed


def validate_notebook(nb: NotebookNode) -> None:
    require_v4(nb)
    missing, duplicates, invalid = count_cell_id_issues(nb)
    if missing or duplicates or invalid:
        raise NotebookContractError(
            "Cell IDs are not schema-ready: "
            f"missing={missing}, duplicate={duplicates}, invalid={invalid}."
        )
    nbformat.validate(deepcopy(nb))


def _existing_mode(path: Path) -> int | None:
    if path.is_symlink():
        raise NotebookContractError(
            f"Refusing symlink output; resolve the intended target explicitly: {path}"
        )
    if not path.exists():
        return None
    if not path.is_file():
        raise NotebookContractError(f"Output is not a regular file: {path}")
    return stat.S_IMODE(path.stat().st_mode)


def _write_text_atomic(text: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = _existing_mode(path)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(text)
            if not text.endswith("\n"):
                handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        if mode is not None:
            temporary.chmod(mode)
        os.replace(temporary, path)
    finally:
        try:
            temporary.unlink()
        except FileNotFoundError:
            pass


def write_notebook_atomic(nb: NotebookNode, path: Path) -> None:
    require_notebook_path(path, must_exist=False)
    validate_notebook(nb)
    validation: dict[str, nbformat.ValidationError] = {}
    rendered = nbformat.writes(nb, capture_validation_error=validation)
    if "ValidationError" in validation:
        raise validation["ValidationError"]
    _write_text_atomic(rendered, path)


def write_json_atomic(data: Any, path: Path) -> None:
    rendered = json.dumps(data, indent=2, sort_keys=True)
    _write_text_atomic(rendered, path)
