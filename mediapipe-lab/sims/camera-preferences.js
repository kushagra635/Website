const STORAGE_KEY = "alfredo-sandoval.explore.preferred-camera";

const CAMERA_SOURCE_FRONT = "@user";
const CAMERA_SOURCE_REAR = "@environment";

function isValidCameraSource(value) {
  return typeof value === "string" && value.length > 0;
}

function normalizeLabel(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isSpecificCameraSource(value) {
  return (
    isValidCameraSource(value) &&
    value !== CAMERA_SOURCE_FRONT &&
    value !== CAMERA_SOURCE_REAR
  );
}

export function loadPreferredCamera(defaultSource = CAMERA_SOURCE_FRONT) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { source: defaultSource, label: "" };
    }

    const parsed = JSON.parse(raw);
    const source = isValidCameraSource(parsed?.source)
      ? parsed.source
      : defaultSource;

    return {
      source,
      label: normalizeLabel(parsed?.label),
    };
  } catch (error) {
    if (error instanceof DOMException || error instanceof SyntaxError) {
      return { source: defaultSource, label: "" };
    }
    throw error;
  }
}

export function savePreferredCamera(source, label = "") {
  if (!isValidCameraSource(source)) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        source,
        label: normalizeLabel(label),
      })
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return;
    }
    throw error;
  }
}

export function appendRememberedCameraOption(selectEl, source, label) {
  if (!isSpecificCameraSource(source)) {
    return;
  }

  const normalizedLabel = normalizeLabel(label);
  if (!normalizedLabel) {
    return;
  }

  const alreadyPresent = Array.from(selectEl.options).some(
    (option) => option.value === source
  );
  if (alreadyPresent) {
    return;
  }

  const option = document.createElement("option");
  option.value = source;
  option.textContent = `${normalizedLabel} (saved)`;
  selectEl.append(option);
}

export function getSelectedCameraLabel(selectEl) {
  const selectedOption = selectEl.selectedOptions?.[0];
  if (!selectedOption) {
    return "";
  }

  return normalizeLabel(
    selectedOption.textContent?.replace(/\s+\(saved\)$/u, "") ?? ""
  );
}
