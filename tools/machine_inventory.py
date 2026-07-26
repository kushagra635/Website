#!/usr/bin/env python3
"""Write a machine profile for Applied Computing setup decisions."""

from __future__ import annotations

import importlib
import json
import os
import platform
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
from importlib.metadata import PackageNotFoundError, version as distribution_version
from importlib.util import find_spec
from pathlib import Path
from typing import cast


SCHEMA_VERSION = 1
OUTPUT_FILE = "machine-profile.json"


class LibraryStatus(StrEnum):
    AVAILABLE = "available"
    MISSING = "missing"
    BROKEN = "broken"


@dataclass(frozen=True)
class LibrarySpec:
    id: str
    module: str
    distributions: tuple[str, ...]


@dataclass(frozen=True)
class LibraryProbe:
    id: str
    status: LibraryStatus
    version: str | None
    distribution: str | None
    error: str | None

    def as_json(self) -> dict[str, str | None]:
        return {
            "id": self.id,
            "status": self.status.value,
            "version": self.version,
            "distribution": self.distribution,
            "error": self.error,
        }


LIBRARIES = (
    LibrarySpec("numpy", "numpy", ("numpy",)),
    LibrarySpec(
        "opencv",
        "cv2",
        ("opencv-python", "opencv-contrib-python", "opencv-python-headless", "opencv-contrib-python-headless"),
    ),
    LibrarySpec("matplotlib", "matplotlib", ("matplotlib",)),
    LibrarySpec("pillow", "PIL", ("Pillow",)),
    LibrarySpec("jupyterlab", "jupyterlab", ("jupyterlab",)),
    LibrarySpec("ipykernel", "ipykernel", ("ipykernel",)),
)


def shorten_home_path(text: str) -> str:
    home = str(Path.home())
    return text.replace(home, "~") if home else text


def is_isolated_environment() -> bool:
    """Detect Python venvs and activated named Conda environments."""
    if sys.prefix != sys.base_prefix:
        return True
    conda_prefix = os.environ.get("CONDA_PREFIX", "").strip()
    conda_name = os.environ.get("CONDA_DEFAULT_ENV", "").strip()
    return bool(conda_prefix and conda_name and conda_name != "base")


def distribution_for(spec: LibrarySpec) -> tuple[str | None, str | None]:
    for name in spec.distributions:
        try:
            return name, distribution_version(name)
        except PackageNotFoundError:
            continue
    return None, None


def probe_library(spec: LibrarySpec) -> LibraryProbe:
    distribution, detected_version = distribution_for(spec)
    if find_spec(spec.module) is None:
        if detected_version:
            return LibraryProbe(
                spec.id,
                LibraryStatus.BROKEN,
                None,
                distribution,
                f"{distribution} {detected_version} is installed, but {spec.module} cannot be imported",
            )
        return LibraryProbe(spec.id, LibraryStatus.MISSING, None, distribution, None)
    if detected_version:
        return LibraryProbe(spec.id, LibraryStatus.AVAILABLE, detected_version, distribution, None)
    try:
        module = importlib.import_module(spec.module)
    except ImportError as error:
        return LibraryProbe(spec.id, LibraryStatus.BROKEN, None, distribution, shorten_home_path(str(error)))
    module_version = getattr(module, "__version__", None)
    if not isinstance(module_version, str) or not module_version.strip():
        return LibraryProbe(spec.id, LibraryStatus.BROKEN, None, distribution, "Imported, but exposed no version")
    return LibraryProbe(spec.id, LibraryStatus.AVAILABLE, module_version.strip(), distribution, None)


def collect_machine_profile() -> dict[str, object]:
    logical_cpu_count = os.cpu_count()
    if logical_cpu_count is None:
        raise RuntimeError("The operating system did not report a logical CPU count")
    os_name = platform.system().strip()
    release = platform.release().strip()
    architecture = platform.machine().strip()
    if not os_name or not release or not architecture:
        raise RuntimeError("The operating system did not report its name, release, and architecture")
    processor = platform.processor().strip() or None
    libraries = [probe_library(spec).as_json() for spec in LIBRARIES]
    return {
        "schema_version": SCHEMA_VERSION,
        "captured_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "system": {
            "os": os_name,
            "release": release,
            "architecture": architecture,
            "processor": processor,
            "logical_cpu_count": logical_cpu_count,
        },
        "python": {
            "implementation": platform.python_implementation(),
            "version": platform.python_version(),
            "executable": shorten_home_path(sys.executable),
            "virtual_environment": is_isolated_environment(),
        },
        "libraries": libraries,
    }


def write_machine_profile(profile: dict[str, object], output: Path) -> None:
    if output.name != OUTPUT_FILE:
        raise ValueError(f"Machine profiles must be written as {OUTPUT_FILE}")
    payload = json.dumps(profile, indent=2, sort_keys=True) + "\n"
    temporary = output.with_name(f".{output.name}.tmp")
    temporary.write_text(payload, encoding="utf-8")
    temporary.replace(output)


def main() -> None:
    output = Path.cwd() / OUTPUT_FILE
    profile = collect_machine_profile()
    write_machine_profile(profile, output)
    libraries = cast(list[dict[str, str | None]], profile["libraries"])
    missing = [str(item["id"]) for item in libraries if item["status"] != LibraryStatus.AVAILABLE.value]
    print(f"Wrote {output.name}")
    print(f"Setup needed: {', '.join(missing)}" if missing else "All tracked libraries are available")
    print("Commit machine-profile.json to your class repository.")


if __name__ == "__main__":
    main()
