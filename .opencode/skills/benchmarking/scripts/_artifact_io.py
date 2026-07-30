"""Strict benchmark artifact validation, statistics, and atomic I/O."""

from __future__ import annotations

import hashlib
import json
import math
import os
import statistics
import tempfile
from pathlib import Path
from typing import Any


class ArtifactError(ValueError):
    """Raised when a benchmark artifact violates its declared contract."""


MEASUREMENT_SCHEMAS = {
    "performance-bench-v2",
    "performance-bench-v3",
    "performance-bench-v4",
    "performance-merge-v2",
}


def _reject_constant(value: str) -> None:
    raise ArtifactError(f"non-standard JSON numeric constant: {value}")


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ArtifactError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def load_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise ArtifactError(f"input artifact is not a regular file: {path}")
    try:
        with path.open("r", encoding="utf-8") as stream:
            value = json.load(
                stream,
                parse_constant=_reject_constant,
                object_pairs_hook=_unique_object,
            )
    except json.JSONDecodeError as exc:
        raise ArtifactError(f"invalid JSON in {path}: {exc.msg}") from exc
    if not isinstance(value, dict):
        raise ArtifactError(f"artifact root must be an object: {path}")
    return value


def finite_number(value: Any, label: str, *, positive: bool = False) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ArtifactError(f"{label} must be numeric")
    result = float(value)
    if not math.isfinite(result):
        raise ArtifactError(f"{label} must be finite")
    if positive and result <= 0:
        raise ArtifactError(f"{label} must be greater than zero")
    return result


def validate_samples(value: Any, label: str = "durations_s") -> list[float]:
    if not isinstance(value, list) or not value:
        raise ArtifactError(f"{label} must be a non-empty list")
    result = [finite_number(item, f"{label}[{index}]") for index, item in enumerate(value)]
    if any(item < 0 for item in result):
        raise ArtifactError(f"{label} values must be non-negative")
    return result


def percentile(sorted_samples: list[float], value: float) -> float:
    if not sorted_samples:
        raise ArtifactError("cannot compute a percentile without samples")
    if value <= 0:
        return sorted_samples[0]
    if value >= 100:
        return sorted_samples[-1]
    rank = (len(sorted_samples) - 1) * value / 100.0
    lower = int(rank)
    upper = min(lower + 1, len(sorted_samples) - 1)
    weight = rank - lower
    return sorted_samples[lower] * (1.0 - weight) + sorted_samples[upper] * weight


def sample_stats(samples: list[float]) -> dict[str, float]:
    ordered = sorted(validate_samples(samples))
    return {
        "min_s": ordered[0],
        "max_s": ordered[-1],
        "mean_s": statistics.mean(ordered),
        "median_s": statistics.median(ordered),
        "stdev_s": statistics.stdev(ordered) if len(ordered) > 1 else 0.0,
        "p50_s": percentile(ordered, 50.0),
        "p95_s": percentile(ordered, 95.0),
        "p99_s": percentile(ordered, 99.0),
    }


def _string_mapping(value: Any, label: str) -> dict[str, str]:
    if not isinstance(value, dict):
        raise ArtifactError(f"{label} must be an object")
    if not all(isinstance(key, str) and isinstance(item, str) for key, item in value.items()):
        raise ArtifactError(f"{label} keys and values must be strings")
    return value


def _command(value: Any) -> list[str]:
    if not isinstance(value, list) or not value or not all(isinstance(item, str) for item in value):
        raise ArtifactError("command must be a non-empty list of strings")
    return value


def _integer(value: Any, label: str, minimum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise ArtifactError(f"{label} must be an integer >= {minimum}")
    return value


def _validate_stats(value: Any) -> None:
    if not isinstance(value, dict):
        raise ArtifactError("stats must be an object")
    required = set(sample_stats([1.0]))
    if set(value) != required:
        raise ArtifactError("stats keys do not match the timing statistics contract")
    for key, item in value.items():
        if finite_number(item, f"stats.{key}") < 0:
            raise ArtifactError(f"stats.{key} must be non-negative")


def validate_measurement(payload: dict[str, Any], path: Path | None = None) -> None:
    location = f" in {path}" if path is not None else ""
    schema = payload.get("schema")
    if schema not in MEASUREMENT_SCHEMAS:
        raise ArtifactError(f"unsupported measurement schema {schema!r}{location}")
    samples = validate_samples(payload.get("durations_s"))
    _validate_stats(payload.get("stats"))
    if schema == "performance-merge-v2":
        if not isinstance(payload.get("contract"), dict):
            raise ArtifactError("performance-merge-v2 requires a contract object")
        return
    _command(payload.get("command"))
    _string_mapping(payload.get("metadata"), "metadata")
    if not isinstance(payload.get("label"), str) or not payload["label"].strip():
        raise ArtifactError("label must be a non-empty string")
    _integer(payload.get("warmup"), "warmup", 0)
    runs = _integer(payload.get("runs"), "runs", 1)
    if runs != len(samples):
        raise ArtifactError("runs must equal the number of duration samples")
    if schema == "performance-bench-v2":
        _string_mapping(payload.get("env_overrides", {}), "env_overrides")
    else:
        environment = payload.get("environment")
        if not isinstance(environment, dict):
            raise ArtifactError(f"{schema} requires environment")
        _string_mapping(environment.get("env_overrides", {}), "env_overrides")
        secret_keys = environment.get("secret_env_keys", [])
        if not isinstance(secret_keys, list) or not all(isinstance(item, str) for item in secret_keys):
            raise ArtifactError("secret_env_keys must be a list of strings")
    if schema == "performance-bench-v4":
        cwd = payload.get("cwd")
        if not isinstance(cwd, str) or not cwd:
            raise ArtifactError("performance-bench-v4 requires a working directory")
        cwd_path = Path(cwd)
        if cwd_path.is_absolute() or ".." in cwd_path.parts:
            raise ArtifactError("performance-bench-v4 cwd must be a safe relative path")


def measurement_contract(payload: dict[str, Any]) -> dict[str, Any]:
    validate_measurement(payload)
    if payload["schema"] == "performance-merge-v2":
        return dict(payload["contract"])
    if payload["schema"] == "performance-bench-v2":
        environment = {
            "env_overrides": payload.get("env_overrides", {}),
            "secret_env_keys": [],
        }
    else:
        environment = payload["environment"]
    return {
        "label": payload["label"],
        "command": payload["command"],
        "metadata": payload["metadata"],
        "environment": environment,
        "cwd": payload.get("cwd"),
        "warmup": payload.get("warmup"),
        "runs": payload.get("runs"),
    }


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def prepare_output(target: Path, inputs: list[Path], overwrite: bool) -> Path:
    if not target.parent.exists() or not target.parent.is_dir():
        raise ArtifactError(f"output parent directory does not exist: {target.parent}")
    if target.is_symlink():
        raise ArtifactError(f"refusing symlink output: {target}")
    resolved = target.resolve(strict=False)
    if any(path.resolve(strict=False) == resolved for path in inputs):
        raise ArtifactError(f"output aliases an input artifact: {target}")
    if target.exists() and not overwrite:
        raise ArtifactError(f"output exists; pass --overwrite: {target}")
    if target.exists() and not target.is_file():
        raise ArtifactError(f"output is not a regular file: {target}")
    return target


def write_json_atomic(payload: dict[str, Any], target: Path, inputs: list[Path], overwrite: bool) -> None:
    prepare_output(target, inputs, overwrite)
    descriptor, raw_path = tempfile.mkstemp(
        prefix=f".{target.name}.", suffix=".tmp", dir=target.parent
    )
    temporary = Path(raw_path)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(payload, stream, indent=2, allow_nan=False)
            stream.write("\n")
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)
