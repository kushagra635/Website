#!/usr/bin/env python3
"""Compare strict benchmark artifacts and emit an auditable regression gate."""

from __future__ import annotations

import argparse
import math
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from _artifact_io import (
    ArtifactError,
    MEASUREMENT_SCHEMAS,
    finite_number,
    load_json,
    measurement_contract,
    sample_stats,
    sha256_file,
    validate_measurement,
    validate_samples,
    write_json_atomic,
)


def _get_path(data: dict[str, Any], path: str) -> float:
    current: Any = data
    for key in path.split("."):
        if not key or not isinstance(current, dict) or key not in current:
            raise ArtifactError(f"metric path not found: {path}")
        current = current[key]
    return finite_number(current, f"metric {path}")


def _metric_value(data: dict[str, Any], metric: str) -> float:
    if metric.startswith("stats.") and data.get("schema") in MEASUREMENT_SCHEMAS:
        key = metric.removeprefix("stats.")
        stats = sample_stats(validate_samples(data.get("durations_s")))
        if key not in stats:
            raise ArtifactError(f"unsupported derived timing metric: {metric}")
        return stats[key]
    return _get_path(data, metric)


def _metric_status(
    baseline: float,
    current: float,
    direction: str,
    noise_pct: float,
    max_regress_pct: float,
) -> tuple[float, str, bool]:
    if baseline <= 0 or current < 0:
        raise ArtifactError("comparison metrics require baseline > 0 and current >= 0")
    raw_change = (current - baseline) / baseline * 100.0
    regression = raw_change if direction == "lower-is-better" else -raw_change
    if regression > max_regress_pct:
        return raw_change, "fail", False
    if regression > noise_pct:
        return raw_change, "regressed", True
    if regression < -noise_pct:
        return raw_change, "improved", True
    return raw_change, "flat", True


def _result(
    baseline: dict[str, Any],
    current: dict[str, Any],
    metric: str,
    direction: str,
    noise_pct: float,
    max_regress_pct: float,
) -> dict[str, Any]:
    baseline_value = _metric_value(baseline, metric)
    current_value = _metric_value(current, metric)
    change, status, passed = _metric_status(
        baseline_value, current_value, direction, noise_pct, max_regress_pct
    )
    return {
        "metric": metric,
        "direction": direction,
        "baseline": baseline_value,
        "current": current_value,
        "delta": current_value - baseline_value,
        "delta_pct": change,
        "noise_pct": noise_pct,
        "max_regress_pct": max_regress_pct,
        "status": status,
        "passed": passed,
    }


def _summary_status(results: list[dict[str, Any]]) -> str:
    if any(not result["passed"] for result in results):
        return "fail"
    if all(result["status"] == "flat" for result in results):
        return "pass"
    return "mixed"


def _contract_differences(
    baseline: dict[str, Any], current: dict[str, Any]
) -> list[str]:
    baseline_measurement = baseline.get("schema") in MEASUREMENT_SCHEMAS
    current_measurement = current.get("schema") in MEASUREMENT_SCHEMAS
    if baseline_measurement != current_measurement:
        raise ArtifactError("cannot compare a measurement artifact with arbitrary JSON")
    if not baseline_measurement:
        return []
    validate_measurement(baseline)
    validate_measurement(current)
    first = measurement_contract(baseline)
    second = measurement_contract(current)
    return sorted(key for key in set(first) | set(second) if first.get(key) != second.get(key))


def _validate_args(args: argparse.Namespace) -> list[str]:
    if args.baseline.resolve() == args.current.resolve():
        raise ArtifactError("baseline and current must be different artifacts")
    if not math.isfinite(args.noise_pct) or args.noise_pct < 0:
        raise ArtifactError("--noise-pct must be finite and non-negative")
    if not math.isfinite(args.max_regress) or args.max_regress < args.noise_pct:
        raise ArtifactError("--max-regress must be finite and at least --noise-pct")
    metrics = args.metric or ["stats.p50_s"]
    if len(metrics) != len(set(metrics)):
        raise ArtifactError("metric names must be unique")
    return metrics


def compare(args: argparse.Namespace) -> dict[str, Any]:
    metrics = _validate_args(args)
    baseline = load_json(args.baseline)
    current = load_json(args.current)
    differences = _contract_differences(baseline, current)
    if differences and not args.allow_contract_difference:
        raise ArtifactError(
            "benchmark contracts differ in " + ", ".join(differences)
            + "; rerun consistently or pass --allow-contract-difference REASON"
        )
    results = [
        _result(
            baseline, current, metric, args.direction,
            args.noise_pct, args.max_regress,
        )
        for metric in metrics
    ]
    return {
        "schema": "performance-compare-v2",
        "timestamp": datetime.now(UTC).isoformat(),
        "baseline": {"path": str(args.baseline), "sha256": sha256_file(args.baseline)},
        "current": {"path": str(args.current), "sha256": sha256_file(args.current)},
        "contract_differences": differences,
        "contract_difference_reason": args.allow_contract_difference,
        "status": _summary_status(results),
        "metric_results": results,
    }


def _print_result(result: dict[str, Any]) -> None:
    status = str(result["status"]).upper()
    stream = sys.stderr if status == "FAIL" else sys.stdout
    print(
        f"{status} {result['metric']}: {result['baseline']:.6f} -> "
        f"{result['current']:.6f} ({result['delta_pct']:+.2f}%)",
        file=stream,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--current", type=Path, required=True)
    parser.add_argument("--metric", action="append", default=[])
    parser.add_argument(
        "--direction",
        choices=("lower-is-better", "higher-is-better"),
        default="lower-is-better",
    )
    parser.add_argument("--noise-pct", type=float, default=2.0)
    parser.add_argument("--max-regress", type=float, default=10.0)
    parser.add_argument("--allow-contract-difference", metavar="REASON")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--overwrite", action="store_true")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        payload = compare(args)
        write_json_atomic(
            payload, args.out, [args.baseline, args.current], args.overwrite
        )
    except (ArtifactError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    for result in payload["metric_results"]:
        _print_result(result)
    print(f"SUMMARY {payload['status'].upper()}")
    return 2 if payload["status"] == "fail" else 0


if __name__ == "__main__":
    raise SystemExit(main())
