#!/usr/bin/env python3
"""Write a machine profile for Applied Computing compatibility decisions."""

from __future__ import annotations

import csv
import io
import json
import os
import platform
import re
import shlex
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import cast


SCHEMA_VERSION = 2
OUTPUT_FILE = "machine-profile.json"
COMMAND_TIMEOUT_SECONDS = 10


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


def command_output(command: tuple[str, ...]) -> str | None:
    executable = shutil.which(command[0])
    if executable is None:
        return None
    try:
        result = subprocess.run(
            (executable, *command[1:]),
            check=False,
            capture_output=True,
            text=True,
            errors="replace",
            timeout=COMMAND_TIMEOUT_SECONDS,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    if result.returncode != 0:
        return ""
    return result.stdout.strip() or result.stderr.strip()


def positive_int(value: object) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value if value > 0 else None
    if isinstance(value, str):
        try:
            parsed = int(value.strip())
        except ValueError:
            return None
        return parsed if parsed > 0 else None
    return None


def format_bytes(value: object) -> str:
    if not isinstance(value, int) or value < 0:
        return "unavailable"
    amount = float(value)
    units = ("B", "KiB", "MiB", "GiB", "TiB")
    unit = 0
    while amount >= 1024 and unit < len(units) - 1:
        amount /= 1024
        unit += 1
    digits = 0 if amount >= 100 or unit == 0 else 1 if amount >= 10 else 2
    return f"{amount:.{digits}f} {units[unit]}"


def bytes_from_size_text(value: object) -> int | None:
    if not isinstance(value, str):
        return positive_int(value)
    match = re.search(r"([\d.]+)\s*(KB|MB|GB|TB)", value, flags=re.IGNORECASE)
    if match is None:
        return positive_int(value)
    amount = float(match.group(1))
    exponent = {"KB": 1, "MB": 2, "GB": 3, "TB": 4}[match.group(2).upper()]
    return round(amount * (1024**exponent))


def linux_processor_name() -> str | None:
    cpuinfo = Path("/proc/cpuinfo")
    if not cpuinfo.is_file():
        return None
    for line in cpuinfo.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.lower().startswith(("model name", "hardware")) and ":" in line:
            value = line.split(":", maxsplit=1)[1].strip()
            if value:
                return value
    return None


def linux_physical_core_count() -> int | None:
    topology_root = Path("/sys/devices/system/cpu")
    cores: set[tuple[str, str]] = set()
    for cpu_dir in topology_root.glob("cpu[0-9]*"):
        topology = cpu_dir / "topology"
        try:
            package_id = (topology / "physical_package_id").read_text(encoding="utf-8").strip()
            core_id = (topology / "core_id").read_text(encoding="utf-8").strip()
        except OSError:
            continue
        cores.add((package_id, core_id))
    return len(cores) or None


def windows_system_facts() -> dict[str, object]:
    script = (
        "$computer=Get-CimInstance Win32_ComputerSystem;"
        "$processors=@(Get-CimInstance Win32_Processor);"
        "[pscustomobject]@{"
        "memory=[uint64]$computer.TotalPhysicalMemory;"
        "physical_cores=[int](($processors|Measure-Object NumberOfCores -Sum).Sum);"
        "processor=[string](($processors|Select-Object -First 1).Name);"
        "manufacturer=[string]$computer.Manufacturer;"
        "model=[string]$computer.Model"
        "}|ConvertTo-Json -Compress"
    )
    for executable in ("powershell.exe", "pwsh.exe", "pwsh"):
        output = command_output((executable, "-NoProfile", "-NonInteractive", "-Command", script))
        if output:
            try:
                parsed = json.loads(output)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                return cast(dict[str, object], parsed)
    return {}


def total_memory_bytes(os_name: str, windows_facts: dict[str, object]) -> int | None:
    if os_name == "Windows":
        return positive_int(windows_facts.get("memory"))
    if os_name == "Darwin":
        output = command_output(("sysctl", "-n", "hw.memsize"))
        return positive_int(output)
    try:
        page_size = os.sysconf("SC_PAGE_SIZE")
        physical_pages = os.sysconf("SC_PHYS_PAGES")
    except (OSError, ValueError):
        return None
    if not isinstance(page_size, int) or not isinstance(physical_pages, int):
        return None
    return positive_int(page_size * physical_pages)


def processor_details(
    os_name: str,
    windows_facts: dict[str, object],
) -> tuple[str | None, int | None]:
    processor = platform.processor().strip() or None
    physical_cores: int | None = None
    if os_name == "Windows":
        reported_processor = windows_facts.get("processor")
        if isinstance(reported_processor, str) and reported_processor.strip():
            processor = reported_processor.strip()
        physical_cores = positive_int(windows_facts.get("physical_cores"))
    elif os_name == "Darwin":
        processor = command_output(("sysctl", "-n", "machdep.cpu.brand_string")) or processor
        physical_cores = positive_int(command_output(("sysctl", "-n", "hw.physicalcpu")))
    elif os_name == "Linux":
        processor = linux_processor_name() or processor
        physical_cores = linux_physical_core_count()
    return processor, physical_cores


def operating_system_details(os_family: str) -> tuple[str, str, str, str]:
    kernel = platform.release().strip()
    build = platform.version().strip() or kernel
    name = os_family
    release = kernel
    if os_family == "Linux":
        try:
            os_release = platform.freedesktop_os_release()
        except OSError:
            os_release = {}
        name = os_release.get("NAME", "Linux").strip() or "Linux"
        release = (
            os_release.get("VERSION_ID", "").strip()
            or os_release.get("VERSION", "").strip()
            or kernel
        )
    elif os_family == "Darwin":
        name = "macOS"
        release = platform.mac_ver()[0].strip() or kernel
    return name, release, build, kernel


def machine_identity(os_name: str, windows_facts: dict[str, object]) -> tuple[str | None, str | None]:
    if os_name == "Windows":
        manufacturer = windows_facts.get("manufacturer")
        model = windows_facts.get("model")
        return (
            manufacturer.strip() if isinstance(manufacturer, str) and manufacturer.strip() else None,
            model.strip() if isinstance(model, str) and model.strip() else None,
        )
    if os_name == "Darwin":
        model = command_output(("sysctl", "-n", "hw.model"))
        return "Apple", model or None
    if os_name == "Linux":
        dmi_root = Path("/sys/devices/virtual/dmi/id")

        def dmi_value(name: str) -> str | None:
            try:
                value = (dmi_root / name).read_text(encoding="utf-8", errors="replace").strip()
            except OSError:
                return None
            return value or None

        return dmi_value("sys_vendor"), dmi_value("product_name")
    return None, None


def gpu_device(
    *,
    name: str,
    vendor: str | None = None,
    memory_bytes: int | None = None,
    memory_kind: str = "unknown",
    driver_version: str | None = None,
    compute_api: str | None = None,
) -> dict[str, object]:
    return {
        "name": name.strip(),
        "vendor": vendor.strip() if vendor else None,
        "memory_bytes": memory_bytes,
        "memory_kind": memory_kind,
        "driver_version": driver_version.strip() if driver_version else None,
        "compute_api": compute_api.strip() if compute_api else None,
    }


def canonical_gpu_name(name: str) -> str:
    tokens = re.sub(
        r"\b(nvidia|amd|advanced micro devices|intel|apple|corporation|inc|graphics|gpu|adapter)\b",
        " ",
        name,
        flags=re.IGNORECASE,
    )
    return re.sub(r"[^a-z0-9]+", "", tokens.lower())


def merge_gpu_devices(devices: list[dict[str, object]]) -> list[dict[str, object]]:
    merged: list[dict[str, object]] = []
    for candidate in devices:
        candidate_name = cast(str, candidate["name"])
        candidate_key = canonical_gpu_name(candidate_name)
        match: dict[str, object] | None = None
        for existing in merged:
            existing_name = cast(str, existing["name"])
            existing_key = canonical_gpu_name(existing_name)
            if candidate_key == existing_key or (
                candidate_key
                and existing_key
                and (candidate_key in existing_key or existing_key in candidate_key)
            ):
                match = existing
                break
        if match is None:
            merged.append(candidate)
            continue
        for key in ("vendor", "memory_bytes", "driver_version", "compute_api"):
            if match[key] is None and candidate[key] is not None:
                match[key] = candidate[key]
        if match["memory_kind"] == "unknown" and candidate["memory_kind"] != "unknown":
            match["memory_kind"] = candidate["memory_kind"]
    return merged


def nvidia_devices() -> tuple[bool, list[dict[str, object]]]:
    if shutil.which("nvidia-smi") is None:
        return False, []
    output = command_output(
        (
            "nvidia-smi",
            "--query-gpu=name,memory.total,driver_version",
            "--format=csv,noheader,nounits",
        )
    )
    if not output:
        return False, []
    devices: list[dict[str, object]] = []
    for row in csv.reader(io.StringIO(output)):
        if len(row) != 3 or not row[0].strip():
            continue
        memory_mib = positive_int(row[1])
        devices.append(
            gpu_device(
                name=row[0],
                vendor="NVIDIA",
                memory_bytes=memory_mib * 1024**2 if memory_mib else None,
                memory_kind="dedicated",
                driver_version=row[2],
                compute_api="CUDA",
            )
        )
    return True, devices


def windows_gpu_devices() -> tuple[bool, list[dict[str, object]]]:
    # AdapterRAM is a uint32 in Win32_VideoController and cannot represent modern
    # VRAM capacities above 4 GiB. Exact NVIDIA memory comes from nvidia-smi;
    # leave other vendors unknown instead of publishing a misleading number.
    script = (
        "$items=@(Get-CimInstance Win32_VideoController|"
        "Select-Object Name,AdapterCompatibility,DriverVersion);"
        "ConvertTo-Json -InputObject $items -Compress"
    )
    for executable in ("powershell.exe", "pwsh.exe", "pwsh"):
        if shutil.which(executable) is None:
            continue
        output = command_output((executable, "-NoProfile", "-NonInteractive", "-Command", script))
        if not output:
            continue
        try:
            parsed = json.loads(output)
        except json.JSONDecodeError:
            continue
        rows = parsed if isinstance(parsed, list) else [parsed]
        devices: list[dict[str, object]] = []
        for raw in rows:
            if not isinstance(raw, dict):
                continue
            name = raw.get("Name")
            if not isinstance(name, str) or not name.strip():
                continue
            vendor = raw.get("AdapterCompatibility")
            driver = raw.get("DriverVersion")
            devices.append(
                gpu_device(
                    name=name,
                    vendor=vendor if isinstance(vendor, str) else None,
                    driver_version=driver if isinstance(driver, str) else None,
                )
            )
        return True, devices
    return False, []


def mac_gpu_devices() -> tuple[bool, list[dict[str, object]]]:
    if shutil.which("system_profiler") is None:
        return False, []
    output = command_output(("system_profiler", "SPDisplaysDataType", "-json"))
    if not output:
        return False, []
    try:
        parsed = json.loads(output)
    except json.JSONDecodeError:
        return False, []
    displays = parsed.get("SPDisplaysDataType", []) if isinstance(parsed, dict) else []
    if not isinstance(displays, list):
        return True, []
    devices: list[dict[str, object]] = []
    for raw in displays:
        if not isinstance(raw, dict):
            continue
        name = raw.get("sppci_model") or raw.get("_name")
        if not isinstance(name, str) or not name.strip():
            continue
        dedicated = bytes_from_size_text(raw.get("spdisplays_vram"))
        shared = bytes_from_size_text(raw.get("spdisplays_vram_shared"))
        vendor = raw.get("spdisplays_vendor")
        metal = raw.get("spdisplays_metal")
        devices.append(
            gpu_device(
                name=name,
                vendor=vendor if isinstance(vendor, str) else "Apple",
                memory_bytes=dedicated or shared,
                memory_kind="dedicated" if dedicated else "shared" if shared else "unknown",
                compute_api="Metal" if isinstance(metal, str) and metal.strip() else None,
            )
        )
    return True, devices


def linux_gpu_devices() -> tuple[bool, list[dict[str, object]]]:
    output = command_output(("lspci", "-mm"))
    if output:
        devices: list[dict[str, object]] = []
        for line in output.splitlines():
            try:
                fields = shlex.split(line)
            except ValueError:
                continue
            if len(fields) < 4 or not any(
                marker in fields[1].lower()
                for marker in ("vga compatible controller", "3d controller", "display controller")
            ):
                continue
            devices.append(gpu_device(name=fields[3], vendor=fields[2]))
        return True, devices

    drm_root = Path("/sys/class/drm")
    if not drm_root.is_dir():
        return False, []
    vendors = {
        "0x1002": "AMD",
        "0x10de": "NVIDIA",
        "0x8086": "Intel",
    }
    devices = []
    seen_paths: set[str] = set()
    for card in drm_root.glob("card[0-9]*"):
        device_path = card / "device"
        try:
            resolved = str(device_path.resolve(strict=True))
            if resolved in seen_paths:
                continue
            seen_paths.add(resolved)
            vendor_code = (device_path / "vendor").read_text(encoding="utf-8").strip().lower()
            device_code = (device_path / "device").read_text(encoding="utf-8").strip().lower()
        except OSError:
            continue
        vendor = vendors.get(vendor_code, f"PCI vendor {vendor_code}")
        devices.append(gpu_device(name=f"{vendor} device {device_code}", vendor=vendor))
    return True, devices


def collect_gpu_profile(os_name: str) -> dict[str, object]:
    attempted = False
    devices: list[dict[str, object]] = []
    nvidia_attempted, found_nvidia = nvidia_devices()
    attempted = attempted or nvidia_attempted
    devices.extend(found_nvidia)

    if os_name == "Windows":
        os_attempted, os_devices = windows_gpu_devices()
    elif os_name == "Darwin":
        os_attempted, os_devices = mac_gpu_devices()
    elif os_name == "Linux":
        os_attempted, os_devices = linux_gpu_devices()
    else:
        os_attempted, os_devices = False, []
    if found_nvidia:
        os_devices = [
            device
            for device in os_devices
            if "nvidia" not in str(device["vendor"]).lower()
            and "geforce" not in cast(str, device["name"]).lower()
        ]
    attempted = attempted or os_attempted
    devices.extend(os_devices)
    merged = merge_gpu_devices(devices)
    status = "detected" if merged else "not_detected" if attempted else "unavailable"
    return {"status": status, "devices": merged}


def collect_machine_profile() -> dict[str, object]:
    logical_cpu_count = os.cpu_count()
    if logical_cpu_count is None:
        raise RuntimeError("The operating system did not report a logical CPU count")
    os_name = platform.system().strip()
    architecture = platform.machine().strip()
    if not os_name or not architecture:
        raise RuntimeError("The operating system did not report its name, release, and architecture")
    display_name, release, build, kernel = operating_system_details(os_name)
    windows_facts = windows_system_facts() if os_name == "Windows" else {}
    processor, physical_cpu_count = processor_details(os_name, windows_facts)
    manufacturer, model = machine_identity(os_name, windows_facts)
    memory_bytes = total_memory_bytes(os_name, windows_facts)
    storage = shutil.disk_usage(Path.cwd())
    return {
        "schema_version": SCHEMA_VERSION,
        "captured_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "system": {
            "os": os_name,
            "name": display_name,
            "release": release,
            "build": build,
            "kernel": kernel,
            "architecture": architecture,
            "manufacturer": manufacturer,
            "model": model,
            "processor": processor,
            "physical_cpu_count": physical_cpu_count,
            "logical_cpu_count": logical_cpu_count,
            "memory_bytes": memory_bytes,
            "storage": {
                "total_bytes": storage.total,
                "free_bytes": storage.free,
            },
        },
        "gpu": collect_gpu_profile(os_name),
        "python": {
            "implementation": platform.python_implementation(),
            "version": platform.python_version(),
            "executable": shorten_home_path(sys.executable),
            "virtual_environment": is_isolated_environment(),
        },
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
    system = cast(dict[str, object], profile["system"])
    gpu = cast(dict[str, object], profile["gpu"])
    python = cast(dict[str, object], profile["python"])
    storage = cast(dict[str, object], system["storage"])
    devices = cast(list[dict[str, object]], gpu["devices"])
    host = " ".join(
        value for value in (system["manufacturer"], system["model"]) if isinstance(value, str)
    )
    physical_cores = system["physical_cpu_count"]
    core_text = (
        f"{physical_cores} physical cores / {system['logical_cpu_count']} logical CPUs"
        if isinstance(physical_cores, int)
        else f"{system['logical_cpu_count']} logical CPUs"
    )

    print(f"Wrote {output.name}")
    print(f"Host: {host or 'manufacturer/model unavailable'}")
    os_context = (
        f"{system['os']} {system['architecture']}"
        if system["name"] != system["os"]
        else str(system["architecture"])
    )
    print(
        f"OS: {system['name']} {system['release']} ({os_context}); "
        f"kernel {system['kernel']}; build {system['build']}"
    )
    print(f"CPU: {system['processor'] or 'model unavailable'}; {core_text}")
    print(f"RAM: {format_bytes(system['memory_bytes'])}")
    if devices:
        for index, device in enumerate(devices, start=1):
            details = [
                format_bytes(device["memory_bytes"]) if device["memory_bytes"] is not None else None,
                cast(str | None, device["memory_kind"])
                if device["memory_kind"] != "unknown"
                else None,
                cast(str | None, device["compute_api"]),
                f"driver {device['driver_version']}" if device["driver_version"] else None,
            ]
            detail_text = "; ".join(detail for detail in details if detail)
            print(f"GPU {index}: {device['name']}" + (f"; {detail_text}" if detail_text else ""))
    else:
        print(f"GPU: {str(gpu['status']).replace('_', ' ')}")
    print(
        f"Working disk: {format_bytes(storage['free_bytes'])} free / "
        f"{format_bytes(storage['total_bytes'])} total"
    )
    print(
        f"Python: {python['implementation']} {python['version']}; {python['executable']}; "
        f"{'isolated environment' if python['virtual_environment'] else 'base or system environment'}"
    )
    print("Commit machine-profile.json to this repository.")


if __name__ == "__main__":
    main()
