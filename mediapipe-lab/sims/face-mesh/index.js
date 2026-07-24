import {
  FaceLandmarker,
  FilesetResolver,
} from "../../vendor/mediapipe/tasks-vision/vision_bundle.mjs";
import {
  appendRememberedCameraOption,
  getSelectedCameraLabel,
  loadPreferredCamera,
  savePreferredCamera,
} from "../camera-preferences.js";

const containerEl = document.getElementById("container");
const videoEl = document.getElementById("webcam");
const canvasEl = document.getElementById("canvas");
const drawPadEl = document.getElementById("draw-pad");
const drawPadCtx = drawPadEl.getContext("2d");
const context2d = canvasEl.getContext("2d");
const inferenceCanvasEl = document.createElement("canvas");
const inferenceContext2d = inferenceCanvasEl.getContext("2d");
const placeholderEl = document.getElementById("placeholder");
const placeholderMessageEl = placeholderEl.querySelector(".placeholder-card p");
const statusBadgeEl = document.getElementById("status-badge");
const cameraBtnEl = document.getElementById("camera-btn");
const cameraSourceSelect = document.getElementById("camera-source");
const showVideoFeedInputEl = document.getElementById("show-video-feed");
const privacyModeInputEl = document.getElementById("privacy-mode");
const accessibilityModeInputEl = document.getElementById("accessibility-mode");
const fullMeshBtnEl = document.getElementById("full-mesh-btn");
const noseDrawToggleBtnEl = document.getElementById("nose-draw-toggle");
const noseDrawClearBtnEl = document.getElementById("nose-draw-clear");
const glassesFilterBtnEl = document.getElementById("glasses-filter-btn");
const labelsFilterBtnEl = document.getElementById("labels-filter-btn");
const statsEl = document.getElementById("stats");
const faceCountEl = document.getElementById("face-count");
const fpsEl = document.getElementById("fps");
const inferenceLatencyEl = document.getElementById("inference-latency");
const inferenceRateEl = document.getElementById("inference-rate");
const colorPreviewEl = document.getElementById("color-preview");
const hueSliderEl = document.getElementById("hue-slider");
const saturationSliderEl = document.getElementById("sat-slider");
const lightnessSliderEl = document.getElementById("light-slider");
const nodeSizeSliderEl = document.getElementById("node-size");
const nodeSizeValueEl = document.getElementById("node-size-value");
const smoothingSliderEl = document.getElementById("smoothing-slider");
const smoothingValueEl = document.getElementById("smoothing-value");
const swatchEls = Array.from(document.querySelectorAll(".swatch"));
const defaultPlaceholderMessage = placeholderMessageEl.textContent;

const benchPanelEl = document.getElementById("benchmark-panel");
const benchModelEl = document.getElementById("bench-model");
const benchLoadTimeEl = document.getElementById("bench-load-time");
const benchPermissionEl = document.getElementById("bench-permission");
const benchCameraEl = document.getElementById("bench-camera");
const benchFpsEl = document.getElementById("bench-fps");
const benchFacesEl = document.getElementById("bench-faces");
const benchBlendshapesEl = document.getElementById("bench-blendshapes");
const benchLogEl = document.getElementById("benchmark-log");
const copyMarkdownBtnEl = document.getElementById("copy-markdown-row");
const copyFeedbackEl = document.getElementById("copy-feedback");

const expressionCurrentEl = document.getElementById("expression-current");
const expressionMouthOpenEl = document.getElementById("expression-mouth-open");
const expressionSmileEl = document.getElementById("expression-smile");
const expressionBrowEl = document.getElementById("expression-brow");
const expressionEyeOpenEl = document.getElementById("expression-eye-open");
const calibrateNeutralBtnEl = document.getElementById("calibrate-neutral");
const calibrateStatusEl = document.getElementById("calibrate-status");

const colorState = { h: 190, s: 90, l: 57 };
const DEFAULT_SMOOTHING = 0.6;
const CAMERA_SOURCE_FRONT = "@user";
const CAMERA_SOURCE_REAR = "@environment";
const FACE_LANDMARKER_MODEL_PATH = "../../vendor/mediapipe/models/face_landmarker.task";
const OUTPUT_FACE_BLENDSHAPES = false;
const OUTPUT_FACIAL_TRANSFORMATION_MATRIXES = false;
const preferredCamera = loadPreferredCamera(CAMERA_SOURCE_FRONT);
const overlayStyle = {
  mesh: "",
  meshOutline: "",
  feature: "",
  featureGlow: "",
  contour: "",
  contourGlow: "",
  iris: "",
  irisGlow: "",
  landmarkOutline: "",
  landmark: "",
  landmarkCore: "",
};

const FACE_CONNECTION_GROUPS = {
  mesh: FaceLandmarker.FACE_LANDMARKS_TESSELATION,
  oval: FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
  lips: FaceLandmarker.FACE_LANDMARKS_LIPS,
  leftEye: FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
  rightEye: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
  leftBrow: FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
  rightBrow: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
  leftIris: FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
  rightIris: FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
};

const FEATURE_CONNECTION_GROUPS = [
  FACE_CONNECTION_GROUPS.lips,
  FACE_CONNECTION_GROUPS.leftEye,
  FACE_CONNECTION_GROUPS.rightEye,
  FACE_CONNECTION_GROUPS.leftBrow,
  FACE_CONNECTION_GROUPS.rightBrow,
];

const FEATURE_LANDMARK_INDICES = collectConnectionIndices(FEATURE_CONNECTION_GROUPS);
const IRIS_LANDMARK_INDICES = collectConnectionIndices([
  FACE_CONNECTION_GROUPS.leftIris,
  FACE_CONNECTION_GROUPS.rightIris,
]);

let faceLandmarker = null;
let modelReady = false;
let modelFailed = false;
let webcamRunning = false;
let webcamStream = null;
let nodeRadius = Number.parseFloat(nodeSizeSliderEl.value);
let smoothingStrength = DEFAULT_SMOOTHING;
let showVideoFeed = showVideoFeedInputEl.checked;
let privacyMode = privacyModeInputEl.checked;
let showFullMesh = true;
let noseDrawingEnabled = false;
let lastNosePoint = null;
let glassesFilterEnabled = false;
let labelsFilterEnabled = false;
let lastVideoTime = -1;
let frameCount = 0;
let lastFpsTimestamp = performance.now();
let animationFrameId = 0;
let inferenceLatencyEstimate = 0;
let inferenceCount = 0;
let lastInferenceCountTick = performance.now();
let requiresPermissionRetry = false;
let cameraPermissionStatus = null;
let requiresExternalBrowser = false;
let cameraStartInFlight = false;
let selectedCameraSource = preferredCamera.source;
let selectedCameraLabel = preferredCamera.label;
const smoothedFaces = new Map();
const smoothingBuffers = new Map();
const activeFaceKeys = new Set();

const bench = {
  modelLoadStartAt: 0,
  modelLoadEndAt: 0,
  modelLoadSuccess: false,
  modelLoadError: "",
  permissionState: "",
  permissionChangedAt: 0,
  cameraStartSuccess: false,
  cameraStartError: "",
  cameraStartedAt: 0,
  avgFps: 0,
  faceCount: 0,
  events: [],
};

function logBenchEvent(message) {
  const timestamp = new Date().toISOString();
  bench.events.push({ timestamp, message });
  if (!benchLogEl) return;
  const entry = document.createElement("div");
  entry.className = "benchmark-event";
  entry.innerHTML = `<time>${timestamp.split("T")[1].replace("Z", "")}</time> ${escapeHtml(message)}`;
  benchLogEl.appendChild(entry);
  benchLogEl.scrollTop = benchLogEl.scrollHeight;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setBenchValue(el, text, tone = "") {
  if (!el) return;
  el.textContent = text;
  el.classList.remove("ok", "fail", "warn");
  if (tone) el.classList.add(tone);
}

function formatMs(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  return `${Math.round(ms)} ms`;
}

function recordModelLoad(success, errorMessage = "") {
  bench.modelLoadEndAt = performance.now();
  bench.modelLoadSuccess = success;
  bench.modelLoadError = errorMessage;
  const duration = bench.modelLoadEndAt - bench.modelLoadStartAt;
  if (success) {
    setBenchValue(benchModelEl, "success", "ok");
    setBenchValue(benchLoadTimeEl, formatMs(duration));
    logBenchEvent(`Model loaded in ${Math.round(duration)} ms`);
  } else {
    setBenchValue(benchModelEl, "failed", "fail");
    setBenchValue(benchLoadTimeEl, formatMs(duration));
    logBenchEvent(`Model load failed: ${errorMessage || "unknown error"}`);
  }
}

function recordPermissionState(state) {
  if (bench.permissionState === state) return;
  bench.permissionState = state;
  bench.permissionChangedAt = performance.now();
  let tone = "";
  if (state === "granted") tone = "ok";
  else if (state === "denied" || state === "prompt") tone = "warn";
  setBenchValue(benchPermissionEl, state || "unknown", tone);
  if (state) logBenchEvent(`Camera permission: ${state}`);
}

function recordCameraStart(success, errorMessage = "") {
  bench.cameraStartedAt = performance.now();
  bench.cameraStartSuccess = success;
  bench.cameraStartError = errorMessage;
  if (success) {
    setBenchValue(benchCameraEl, "success", "ok");
    logBenchEvent("Camera started");
  } else {
    setBenchValue(benchCameraEl, errorMessage ? errorMessage.split(".")[0] : "failed", "fail");
    logBenchEvent(`Camera start failed: ${errorMessage || "unknown error"}`);
  }
}

function updateBenchFps(fps) {
  bench.avgFps = fps;
  setBenchValue(benchFpsEl, Number.isFinite(fps) ? String(fps) : "—");
}

function updateBenchFaceCount(count) {
  bench.faceCount = count;
  setBenchValue(benchFacesEl, String(count));
}

function updateBenchBlendshapesState(enabled) {
  setBenchValue(benchBlendshapesEl, enabled ? "enabled" : "disabled", enabled ? "warn" : "ok");
}

function buildMarkdownRow() {
  const today = new Date().toISOString().split("T")[0];
  const modelLoad = bench.modelLoadSuccess ? "Success" : (bench.modelLoadError ? "Failed" : "—");
  const loadTime = bench.modelLoadEndAt > bench.modelLoadStartAt
    ? Math.round(bench.modelLoadEndAt - bench.modelLoadStartAt)
    : "—";
  const permission = bench.permissionState || "—";
  const cameraStart = bench.cameraStartSuccess ? "Success" : (bench.cameraStartError ? "Failed" : "—");
  const fps = Number.isFinite(bench.avgFps) && bench.avgFps > 0 ? bench.avgFps : "—";
  const faces = bench.faceCount ?? "—";
  const notes = bench.modelLoadError || bench.cameraStartError || "";
  return `| Face Mesh | ${today} | ${modelLoad} | ${loadTime} | ${permission} | ${cameraStart} | ${fps} | ${faces} | ${notes} |`;
}

async function copyBenchmarkRow() {
  const row = buildMarkdownRow();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(row);
      copyFeedbackEl.textContent = "Copied!";
      logBenchEvent("Markdown row copied to clipboard");
    } else {
      throw new Error("Clipboard API unavailable");
    }
  } catch (error) {
    copyFeedbackEl.textContent = "Copy failed.";
    logBenchEvent(`Copy failed: ${error.message || "unknown"}`);
  }
  window.setTimeout(() => { copyFeedbackEl.textContent = ""; }, 1800);
}

function setStatus(message, tone = "info") {
  statusBadgeEl.textContent = message;
  statusBadgeEl.dataset.tone = tone;
}

function setPlaceholderMessage(message) {
  placeholderMessageEl.textContent = message;
}

function updateCameraButton() {
  if (modelFailed) {
    cameraBtnEl.textContent = "Model unavailable";
    cameraBtnEl.disabled = true;
    return;
  }
  if (!modelReady) {
    cameraBtnEl.textContent = "Loading model...";
    cameraBtnEl.disabled = true;
    return;
  }
  if (!webcamRunning && requiresPermissionRetry) {
    cameraBtnEl.textContent = "Retry Camera";
    cameraBtnEl.disabled = false;
    return;
  }
  if (!webcamRunning && requiresExternalBrowser) {
    cameraBtnEl.textContent = "Copy Page Link";
    cameraBtnEl.disabled = false;
    return;
  }
  cameraBtnEl.disabled = false;
  cameraBtnEl.textContent = webcamRunning ? "Disable Camera" : "Enable Camera";
}

async function syncCameraPermissionState() {
  const permissionState = cameraPermissionStatus?.state;
  recordPermissionState(permissionState || "");
  if (!permissionState) return;

  if (permissionState === "granted") {
    await refreshCameraSourceOptions();
    if (requiresPermissionRetry && !webcamRunning && modelReady && faceLandmarker && !cameraStartInFlight) {
      requiresPermissionRetry = false;
      updateCameraButton();
      setStatus("Camera permission granted. Starting camera...", "success");
      await startCamera();
      return;
    }
    updateCameraButton();
    return;
  }

  if (permissionState === "prompt") {
    if (requiresPermissionRetry && !webcamRunning && modelReady) {
      setStatus("Camera permission reset. Click Retry Camera to continue.", "success");
    }
    updateCameraButton();
    return;
  }

  if (webcamRunning) {
    stopCamera(
      "Camera permission was removed. Allow access to continue.",
      "error",
      "Camera permission was removed. Allow access to continue."
    );
    return;
  }
  updateCameraButton();
}

function handleCameraPermissionChange() {
  void syncCameraPermissionState();
}

async function installCameraPermissionWatcher() {
  if (!navigator.permissions?.query) {
    return;
  }
  try {
    const nextStatus = await navigator.permissions.query({ name: "camera" });
    if (cameraPermissionStatus !== nextStatus) {
      cameraPermissionStatus?.removeEventListener("change", handleCameraPermissionChange);
      cameraPermissionStatus = nextStatus;
      cameraPermissionStatus.addEventListener("change", handleCameraPermissionChange);
    }
    await syncCameraPermissionState();
  } catch (error) {
    if (error instanceof TypeError || error instanceof DOMException) {
      return;
    }
    throw error;
  }
}

function isLikelyEmbeddedEditorBrowser() {
  const ua = navigator.userAgent || "";
  const host = window.location.hostname;
  return /\bElectron\//i.test(ua) && (host === "localhost" || host === "127.0.0.1");
}

async function handleExternalBrowserFallback() {
  const pageUrl = window.location.href;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(pageUrl);
      copied = true;
    }
  } catch (error) {
    copied = false;
  }
  setStatus(
    copied
      ? "Link copied. Open it in Chrome, Safari, or Edge to use the camera."
      : "Open this page in Chrome, Safari, or Edge to use the camera.",
    "error"
  );
}

function createCameraOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function resetCameraSourceOptions() {
  cameraSourceSelect.replaceChildren(
    createCameraOption(CAMERA_SOURCE_FRONT, "Front / Default Camera"),
    createCameraOption(CAMERA_SOURCE_REAR, "Rear Camera")
  );
}

function hasCameraSourceOption(value) {
  return Array.from(cameraSourceSelect.options).some((option) => option.value === value);
}

function getCameraSourceLabel(device, index) {
  const label = typeof device.label === "string" ? device.label.trim() : "";
  return label || `Camera ${index + 1}`;
}

function getActiveCameraDeviceId() {
  if (!webcamStream) return "";
  const [track] = webcamStream.getVideoTracks();
  if (!track) return "";
  const settings = track.getSettings?.();
  return typeof settings?.deviceId === "string" ? settings.deviceId : "";
}

async function refreshCameraSourceOptions() {
  resetCameraSourceOptions();
  if (!navigator.mediaDevices?.enumerateDevices) {
    cameraSourceSelect.value = selectedCameraSource;
    return;
  }

  let devices;
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    if (error instanceof DOMException) {
      cameraSourceSelect.value = selectedCameraSource;
      return;
    }
    throw error;
  }

  const seenDeviceIds = new Set();
  const videoInputs = devices.filter((device) => device.kind === "videoinput");
  videoInputs.forEach((device, index) => {
    if (!device.deviceId || seenDeviceIds.has(device.deviceId)) return;
    seenDeviceIds.add(device.deviceId);
    cameraSourceSelect.append(createCameraOption(device.deviceId, getCameraSourceLabel(device, index)));
  });
  appendRememberedCameraOption(cameraSourceSelect, selectedCameraSource, selectedCameraLabel);

  const activeDeviceId = getActiveCameraDeviceId();
  if (hasCameraSourceOption(selectedCameraSource)) {
    cameraSourceSelect.value = selectedCameraSource;
  } else if (activeDeviceId && hasCameraSourceOption(activeDeviceId)) {
    cameraSourceSelect.value = activeDeviceId;
  } else {
    cameraSourceSelect.value = CAMERA_SOURCE_FRONT;
  }
  selectedCameraSource = cameraSourceSelect.value;
  selectedCameraLabel = getSelectedCameraLabel(cameraSourceSelect);
  savePreferredCamera(selectedCameraSource, selectedCameraLabel);
}

function getVideoConstraints() {
  const constraints = {
    width: { ideal: 1280 },
    height: { ideal: 960 },
  };
  if (selectedCameraSource === CAMERA_SOURCE_REAR) {
    return {
      ...constraints,
      facingMode: { exact: "environment" },
    };
  }
  if (selectedCameraSource !== CAMERA_SOURCE_FRONT) {
    return {
      ...constraints,
      deviceId: { exact: selectedCameraSource },
    };
  }
  return {
    ...constraints,
    facingMode: "user",
  };
}

function clampNodeSize(size) {
  return Math.min(4.2, Math.max(0.6, size));
}

function clampFloat(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampSmoothingPercent(percent) {
  return Math.min(95, Math.max(0, Math.round(percent)));
}

function updateSmoothingLabel() {
  smoothingValueEl.textContent = `${Math.round(smoothingStrength * 100)}%`;
}

function updateFullMeshButton() {
  fullMeshBtnEl.textContent = showFullMesh ? "Full Mesh: On" : "Full Mesh: Off";
  fullMeshBtnEl.dataset.active = showFullMesh ? "true" : "false";
  fullMeshBtnEl.setAttribute("aria-pressed", String(showFullMesh));
}

function asHsl(h, s, l, alpha = 1) {
  const hue = ((h % 360) + 360) % 360;
  if (alpha >= 1) return `hsl(${hue} ${s}% ${l}%)`;
  return `hsl(${hue} ${s}% ${l}% / ${alpha})`;
}

function renderOverlayStyle() {
  overlayStyle.mesh = asHsl(colorState.h, Math.min(100, colorState.s + 4), Math.min(92, colorState.l + 10), 0.2);
  overlayStyle.feature = asHsl(colorState.h, Math.min(100, colorState.s + 6), Math.min(96, colorState.l + 16), 0.22);
  overlayStyle.featureGlow = asHsl(colorState.h, Math.min(100, colorState.s + 10), Math.min(98, colorState.l + 22), 0.16);
  overlayStyle.contour = asHsl(colorState.h, Math.min(100, colorState.s + 10), Math.min(99, colorState.l + 22), 0.4);
  overlayStyle.contourGlow = asHsl(colorState.h, Math.min(100, colorState.s + 8), Math.min(99, colorState.l + 26), 0.32);
  overlayStyle.iris = asHsl(colorState.h, Math.min(100, colorState.s + 14), Math.min(99, colorState.l + 30), 0.5);
  overlayStyle.irisGlow = asHsl(colorState.h, Math.min(100, colorState.s + 10), Math.min(99, colorState.l + 28), 0.35);
  overlayStyle.landmark = asHsl(colorState.h, Math.min(100, colorState.s + 10), Math.min(99, colorState.l + 24), 0.95);
  overlayStyle.landmarkCore = "rgba(250, 253, 255, 0.98)";
  colorPreviewEl.style.background = asHsl(colorState.h, colorState.s, colorState.l);
}

function refreshSliderGradients() {
  const hue = colorState.h;
  const saturation = colorState.s;
  const lightness = colorState.l;
  saturationSliderEl.style.background =
    `linear-gradient(90deg, hsl(${hue} 0% ${lightness}%), hsl(${hue} 100% ${lightness}%))`;
  lightnessSliderEl.style.background =
    `linear-gradient(90deg, hsl(${hue} ${saturation}% 0%), hsl(${hue} ${saturation}% 50%), hsl(${hue} ${saturation}% 100%))`;
}

function syncColorControls() {
  hueSliderEl.value = String(Math.round(colorState.h));
  saturationSliderEl.value = String(Math.round(colorState.s));
  lightnessSliderEl.value = String(Math.round(colorState.l));
  renderOverlayStyle();
  refreshSliderGradients();
}

function activateSwatch(hexColor) {
  for (const swatchEl of swatchEls) {
    swatchEl.classList.toggle("active", swatchEl.dataset.color === hexColor);
  }
}

function parseHexColor(hexColor) {
  const normalized = hexColor.trim().replace("#", "");
  if (!/^[\dA-Fa-f]{6}$/.test(normalized)) return null;
  const hexValue = Number.parseInt(normalized, 16);
  return {
    r: (hexValue >> 16) & 255,
    g: (hexValue >> 8) & 255,
    b: hexValue & 255,
  };
}

function rgbToHsl(rgb) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const lightness = (max + min) / 2;
  if (chroma === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }
  const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (max === r) hue = ((g - b) / chroma) % 6;
  else if (max === g) hue = (b - r) / chroma + 2;
  else hue = (r - g) / chroma + 4;
  return {
    h: hue * 60,
    s: saturation * 100,
    l: lightness * 100,
  };
}

function applySwatchColor(hexColor) {
  const rgb = parseHexColor(hexColor);
  if (!rgb) return;
  const converted = rgbToHsl(rgb);
  colorState.h = Math.round(converted.h);
  colorState.s = Math.round(converted.s);
  colorState.l = Math.round(converted.l);
  syncColorControls();
  activateSwatch(hexColor);
}

function applyFreeColor() {
  colorState.h = Number.parseInt(hueSliderEl.value, 10);
  colorState.s = Number.parseInt(saturationSliderEl.value, 10);
  colorState.l = Number.parseInt(lightnessSliderEl.value, 10);
  syncColorControls();
  activateSwatch(null);
}

function syncCanvasSize() {
  const rect = videoEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * pixelRatio));
  const height = Math.max(1, Math.round(rect.height * pixelRatio));
  if (canvasEl.width === width && canvasEl.height === height) return;
  canvasEl.width = width;
  canvasEl.height = height;
  inferenceCanvasEl.width = width;
  inferenceCanvasEl.height = height;
  cachedCoverTransform = null;
  cachedCoverKey = "";
  cachedFrameTransform = null;
  cachedFrameKey = "";
}

function resetStats() {
  faceCountEl.textContent = "0";
  fpsEl.textContent = "0";
  inferenceLatencyEl.textContent = "0";
  inferenceRateEl.textContent = "0";
  frameCount = 0;
  lastFpsTimestamp = performance.now();
  inferenceCount = 0;
  lastInferenceCountTick = performance.now();
  inferenceLatencyEstimate = 0;
}

function updateInferenceLatency(latencyMs) {
  inferenceLatencyEstimate = inferenceLatencyEstimate
    ? (inferenceLatencyEstimate * 0.85) + (latencyMs * 0.15)
    : latencyMs;
  if (inferenceLatencyEl) {
    inferenceLatencyEl.textContent = String(Math.round(inferenceLatencyEstimate));
  }
}

function updateFpsCounter(nowMs) {
  frameCount += 1;
  const elapsedMs = nowMs - lastFpsTimestamp;
  if (elapsedMs < 1000) return;
  fpsEl.textContent = String(frameCount);
  updateBenchFps(frameCount);
  const inferenceElapsedMs = nowMs - lastInferenceCountTick;
  const inferencesPerSecond = inferenceElapsedMs > 0
    ? Math.round((inferenceCount * 1000) / inferenceElapsedMs)
    : 0;
  inferenceRateEl.textContent = String(inferencesPerSecond);
  frameCount = 0;
  inferenceCount = 0;
  lastFpsTimestamp = nowMs;
  lastInferenceCountTick = nowMs;
}

let cachedCoverTransform = null;
let cachedCoverKey = "";

function computeCoverTransform() {
  const sw = videoEl.videoWidth;
  const sh = videoEl.videoHeight;
  const tw = canvasEl.width;
  const th = canvasEl.height;
  if (!sw || !sh || !tw || !th) {
    return null;
  }
  const key = `${sw}:${sh}:${tw}:${th}`;
  if (cachedCoverTransform && cachedCoverKey === key) {
    return cachedCoverTransform;
  }
  const scale = Math.max(tw / sw, th / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  cachedCoverTransform = {
    sourceWidth: sw, sourceHeight: sh,
    targetWidth: tw, targetHeight: th,
    drawnWidth: dw, drawnHeight: dh,
    scale,
    offsetX: (tw - dw) / 2,
    offsetY: (th - dh) / 2,
  };
  cachedCoverKey = key;
  return cachedCoverTransform;
}

let cachedFrameTransform = null;
let cachedFrameKey = "";

function computeFrameTransform() {
  const w = canvasEl.width;
  const h = canvasEl.height;
  if (!w || !h) {
    return null;
  }
  const pr = window.devicePixelRatio || 1;
  const key = `${w}:${h}:${pr}`;
  if (cachedFrameTransform && cachedFrameKey === key) {
    return cachedFrameTransform;
  }
  cachedFrameTransform = { width: w, height: h, pixelRatio: pr };
  cachedFrameKey = key;
  return cachedFrameTransform;
}

function drawCoveredVideo(targetContext, transform) {
  targetContext.drawImage(
    videoEl,
    transform.offsetX,
    transform.offsetY,
    transform.drawnWidth,
    transform.drawnHeight
  );
}

function getConnectionEndpoints(connection) {
  if (typeof connection.start === "number" && typeof connection.end === "number") {
    return { start: connection.start, end: connection.end };
  }
  if (Array.isArray(connection) && connection.length === 2) {
    return { start: connection[0], end: connection[1] };
  }
  return null;
}

function collectConnectionIndices(connectionGroups) {
  const indices = new Set();
  for (const group of connectionGroups) {
    for (const connection of group) {
      const endpoints = getConnectionEndpoints(connection);
      if (!endpoints) continue;
      indices.add(endpoints.start);
      indices.add(endpoints.end);
    }
  }
  return Array.from(indices);
}

function traceConnections(landmarks, connections, tx, ty) {
  context2d.beginPath();
  for (const connection of connections) {
    const endpoints = getConnectionEndpoints(connection);
    if (!endpoints) continue;
    const s = landmarks[endpoints.start];
    const e = landmarks[endpoints.end];
    if (!s || !e) continue;
    context2d.moveTo(s.x * tx, s.y * ty);
    context2d.lineTo(e.x * tx, e.y * ty);
  }
}

function strokeConnections(landmarks, connections, { color, width, glow = 0, glowColor }, transform) {
  traceConnections(landmarks, connections, transform.width, transform.height);
  context2d.lineCap = "round";
  context2d.lineJoin = "round";
  context2d.strokeStyle = color;
  context2d.lineWidth = width * transform.pixelRatio;
  if (glow > 0) {
    context2d.shadowBlur = glow * transform.pixelRatio;
    context2d.shadowColor = glowColor || color;
  } else {
    context2d.shadowBlur = 0;
  }
  context2d.stroke();
  context2d.shadowBlur = 0;
}

function drawLandmarks(landmarks, indices, radiusScale, transform) {
  const radius = nodeRadius * radiusScale * transform.pixelRatio;
  const coreRadius = Math.max(radius * 0.38, 0.9 * transform.pixelRatio);
  const tx = transform.width;
  const ty = transform.height;
  context2d.shadowBlur = radius * 2.4;
  context2d.shadowColor = overlayStyle.iris;
  for (const index of indices) {
    const landmark = landmarks[index];
    if (!landmark) continue;
    const px = landmark.x * tx;
    const py = landmark.y * ty;
    context2d.beginPath();
    context2d.arc(px, py, radius, 0, Math.PI * 2);
    context2d.fillStyle = overlayStyle.landmark;
    context2d.fill();
  }
  context2d.shadowBlur = 0;
  for (const index of indices) {
    const landmark = landmarks[index];
    if (!landmark) continue;
    const px = landmark.x * tx;
    const py = landmark.y * ty;
    context2d.beginPath();
    context2d.arc(px, py, coreRadius, 0, Math.PI * 2);
    context2d.fillStyle = overlayStyle.landmarkCore;
    context2d.fill();
  }
}

function drawFace(faceLandmarks, transform) {
  const previousComposite = context2d.globalCompositeOperation;
  context2d.globalCompositeOperation = "lighter";

  if (showFullMesh) {
    strokeConnections(faceLandmarks, FACE_CONNECTION_GROUPS.mesh,
      { color: overlayStyle.mesh, width: 0.7 }, transform);
  }
  for (const featureGroup of FEATURE_CONNECTION_GROUPS) {
    strokeConnections(faceLandmarks, featureGroup,
      { color: overlayStyle.feature, width: 0.55, glow: 1.5, glowColor: overlayStyle.featureGlow }, transform);
  }
  strokeConnections(faceLandmarks, FACE_CONNECTION_GROUPS.oval,
    { color: overlayStyle.contour, width: 1.1, glow: 5, glowColor: overlayStyle.contourGlow }, transform);
  strokeConnections(faceLandmarks, FACE_CONNECTION_GROUPS.leftIris,
    { color: overlayStyle.iris, width: 0.9, glow: 3, glowColor: overlayStyle.irisGlow }, transform);
  strokeConnections(faceLandmarks, FACE_CONNECTION_GROUPS.rightIris,
    { color: overlayStyle.iris, width: 0.9, glow: 3, glowColor: overlayStyle.irisGlow }, transform);

  drawLandmarks(faceLandmarks, IRIS_LANDMARK_INDICES, 0.35, transform);

  context2d.globalCompositeOperation = previousComposite;
}

function smoothFaceLandmarks(faceKey, faceLandmarks) {
  let buffers = smoothingBuffers.get(faceKey);
  const n = faceLandmarks.length;
  if (!buffers || buffers.a.length !== n) {
    const a = new Array(n);
    const b = new Array(n);
    for (let i = 0; i < n; i++) {
      const lm = faceLandmarks[i];
      const z = lm.z ?? 0;
      a[i] = { x: lm.x, y: lm.y, z };
      b[i] = { x: lm.x, y: lm.y, z };
    }
    buffers = { a, b, current: "a" };
    smoothingBuffers.set(faceKey, buffers);
    return a;
  }

  const prev = buffers.current === "a" ? buffers.a : buffers.b;
  const next = buffers.current === "a" ? buffers.b : buffers.a;
  buffers.current = buffers.current === "a" ? "b" : "a";

  const blendBase = 1 - smoothingStrength;
  let motionAccumulator = 0;
  for (let i = 0; i < n; i++) {
    const lm = faceLandmarks[i];
    motionAccumulator += Math.hypot(lm.x - prev[i].x, lm.y - prev[i].y);
  }
  const averageMotion = n > 0 ? motionAccumulator / n : 0;
  const blend = clampFloat(blendBase + clampFloat(averageMotion * 20, 0, 0.78), 0.1, 1);

  for (let i = 0; i < n; i++) {
    const lm = faceLandmarks[i];
    const p = prev[i];
    const nz = lm.z ?? 0;
    next[i].x = p.x + (lm.x - p.x) * blend;
    next[i].y = p.y + (lm.y - p.y) * blend;
    next[i].z = p.z + (nz - p.z) * blend;
  }
  return next;
}

// Expression detection from raw landmark geometry.
//
// We use normalized MediaPipe landmarks (0-1). All distances are divided by
// face width (left jaw 58 -> right jaw 288) so the ratios stay roughly stable
// as the face moves toward or away from the camera.
//
// Ratios:
//   mouthOpen = distance(upper lip 13, lower lip 14) / faceWidth
//   smile     = (mouth center Y - average mouth corner Y) / faceWidth
//               Positive when corners are raised (smile).
//   browRaise = average(eye center Y - inner eyebrow Y) / faceWidth
//               Positive when eyebrows are raised above the eyes.
//
// Thresholds were chosen from typical relaxed vs. expressive face proportions.

const EXPRESSION_INDICES = {
  leftJaw: 58,
  rightJaw: 288,
  upperLip: 13,
  lowerLip: 14,
  mouthTop: 0,
  mouthBottom: 17,
  leftMouthCorner: 61,
  rightMouthCorner: 291,
  leftEyeTop: 159,
  leftEyeBottom: 145,
  leftEyeLeft: 33,
  leftEyeRight: 133,
  rightEyeTop: 386,
  rightEyeBottom: 374,
  rightEyeLeft: 362,
  rightEyeRight: 263,
  leftBrowInner: 105,
  rightBrowInner: 334,
};

const EXPRESSION_THRESHOLDS = {
  // These are *relative* deltas from the calibrated neutral face.
  // They stay small because we compare to the user's own baseline.
  mouthOpen: 0.035,
  smile: 0.012,
  browRaise: 0.020,
  eyeCloseVsOpen: 0.40,
  winkAsymmetry: 0.30,
};

let neutralBaseline = null;

function getLandmark(landmarks, index) {
  return landmarks?.[index] ?? null;
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function computeExpressionRatios(landmarks) {
  const leftJaw = getLandmark(landmarks, EXPRESSION_INDICES.leftJaw);
  const rightJaw = getLandmark(landmarks, EXPRESSION_INDICES.rightJaw);
  const upperLip = getLandmark(landmarks, EXPRESSION_INDICES.upperLip);
  const lowerLip = getLandmark(landmarks, EXPRESSION_INDICES.lowerLip);
  const mouthTop = getLandmark(landmarks, EXPRESSION_INDICES.mouthTop);
  const mouthBottom = getLandmark(landmarks, EXPRESSION_INDICES.mouthBottom);
  const leftCorner = getLandmark(landmarks, EXPRESSION_INDICES.leftMouthCorner);
  const rightCorner = getLandmark(landmarks, EXPRESSION_INDICES.rightMouthCorner);
  const leftEyeTop = getLandmark(landmarks, EXPRESSION_INDICES.leftEyeTop);
  const leftEyeBottom = getLandmark(landmarks, EXPRESSION_INDICES.leftEyeBottom);
  const leftEyeLeft = getLandmark(landmarks, EXPRESSION_INDICES.leftEyeLeft);
  const leftEyeRight = getLandmark(landmarks, EXPRESSION_INDICES.leftEyeRight);
  const rightEyeTop = getLandmark(landmarks, EXPRESSION_INDICES.rightEyeTop);
  const rightEyeBottom = getLandmark(landmarks, EXPRESSION_INDICES.rightEyeBottom);
  const rightEyeLeft = getLandmark(landmarks, EXPRESSION_INDICES.rightEyeLeft);
  const rightEyeRight = getLandmark(landmarks, EXPRESSION_INDICES.rightEyeRight);
  const leftBrow = getLandmark(landmarks, EXPRESSION_INDICES.leftBrowInner);
  const rightBrow = getLandmark(landmarks, EXPRESSION_INDICES.rightBrowInner);

  if (!leftJaw || !rightJaw || !upperLip || !lowerLip || !mouthTop || !mouthBottom ||
      !leftCorner || !rightCorner || !leftEyeTop || !leftEyeBottom || !leftEyeLeft || !leftEyeRight ||
      !rightEyeTop || !rightEyeBottom || !rightEyeLeft || !rightEyeRight || !leftBrow || !rightBrow) {
    return null;
  }

  const faceWidth = distance2D(leftJaw, rightJaw);
  if (faceWidth <= 0) return null;

  const mouthOpen = distance2D(upperLip, lowerLip) / faceWidth;
  const mouthCenter = midpoint(mouthTop, mouthBottom);
  const avgCornerY = (leftCorner.y + rightCorner.y) / 2;
  const smile = (mouthCenter.y - avgCornerY) / faceWidth;

  const leftEyeCenter = midpoint(
    midpoint(leftEyeTop, leftEyeBottom),
    midpoint(leftEyeLeft, leftEyeRight)
  );
  const rightEyeCenter = midpoint(
    midpoint(rightEyeTop, rightEyeBottom),
    midpoint(rightEyeLeft, rightEyeRight)
  );
  const browRaise = (
    (leftEyeCenter.y - leftBrow.y) + (rightEyeCenter.y - rightBrow.y)
  ) / (2 * faceWidth);

  const leftEyeHeight = distance2D(leftEyeTop, leftEyeBottom);
  const leftEyeWidth = distance2D(leftEyeLeft, leftEyeRight);
  const rightEyeHeight = distance2D(rightEyeTop, rightEyeBottom);
  const rightEyeWidth = distance2D(rightEyeLeft, rightEyeRight);
  const leftEyeOpenness = leftEyeWidth > 0 ? leftEyeHeight / leftEyeWidth : 0;
  const rightEyeOpenness = rightEyeWidth > 0 ? rightEyeHeight / rightEyeWidth : 0;
  const avgEyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;

  return {
    mouthOpen,
    smile,
    browRaise,
    leftEyeOpenness,
    rightEyeOpenness,
    avgEyeOpenness,
  };
}

function classifyExpression(ratios) {
  if (!ratios) return { label: "uncertain", reason: "no face" };

  const base = neutralBaseline;
  const t = EXPRESSION_THRESHOLDS;

  // Deltas from calibrated neutral (or absolute if not calibrated).
  const dMouthOpen = base ? ratios.mouthOpen - base.mouthOpen : 0;
  const dSmile = base ? ratios.smile - base.smile : ratios.smile;
  const dBrowRaise = base ? ratios.browRaise - base.browRaise : ratios.browRaise;

  // Wink / one-eye-closed detection.
  // Compare each eye's openness to its own neutral baseline (if calibrated),
  // or to the average of the two current eyes (fallback).
  const leftOpennessRef = base ? base.leftEyeOpenness : ratios.avgEyeOpenness;
  const rightOpennessRef = base ? base.rightEyeOpenness : ratios.avgEyeOpenness;
  const leftClosed = ratios.leftEyeOpenness < leftOpennessRef * (1 - t.eyeCloseVsOpen);
  const rightClosed = ratios.rightEyeOpenness < rightOpennessRef * (1 - t.eyeCloseVsOpen);
  const eyeAsymmetry = Math.abs(ratios.leftEyeOpenness - ratios.rightEyeOpenness);
  const isWink = (leftClosed || rightClosed) && eyeAsymmetry > t.winkAsymmetry;

  if (isWink) {
    if (leftClosed && rightClosed) {
      // Both closed is not a wink; treat as neutral / blink.
    } else if (leftClosed) {
      return { label: "wink (left)", reason: "left eye closed" };
    } else {
      return { label: "wink (right)", reason: "right eye closed" };
    }
  }

  // Mouth open: jaw dropped / talking / surprise mouth.
  if (dMouthOpen > t.mouthOpen) {
    return { label: "mouth open", reason: "jaw dropped" };
  }

  // Smile: corners pulled up relative to neutral.
  if (dSmile > t.smile) {
    return { label: "smiling", reason: "mouth corners raised" };
  }

  // Eyebrows raised.
  if (dBrowRaise > t.browRaise) {
    return { label: "eyebrows raised", reason: "eyebrows lifted" };
  }

  // Nothing strong enough — treat as neutral (resting face).
  return { label: "neutral", reason: base ? "close to calibrated baseline" : "no strong expression" };
}

function calibrateNeutralFace() {
  // Use the most recent smoothed face. If the camera isn't running yet,
  // try to detect a single frame from the video element.
  let source = null;
  if (webcamRunning && videoEl.currentTime > 0) {
    const results = faceLandmarker?.detectForVideo(videoEl, performance.now());
    source = results?.faceLandmarks?.[0];
  } else if (!webcamRunning && faceLandmarker && videoEl.videoWidth > 0) {
    const results = faceLandmarker.detectForVideo(videoEl, performance.now());
    source = results?.faceLandmarks?.[0];
  }

  if (!source) {
    if (calibrateStatusEl) {
      calibrateStatusEl.textContent = "No face detected. Enable the camera and face the lens.";
      calibrateStatusEl.style.color = "#c88";
    }
    return;
  }

  const ratios = computeExpressionRatios(source);
  if (!ratios) {
    if (calibrateStatusEl) {
      calibrateStatusEl.textContent = "Could not read face geometry. Try again.";
      calibrateStatusEl.style.color = "#c88";
    }
    return;
  }

  neutralBaseline = {
    mouthOpen: ratios.mouthOpen,
    smile: ratios.smile,
    browRaise: ratios.browRaise,
    leftEyeOpenness: ratios.leftEyeOpenness,
    rightEyeOpenness: ratios.rightEyeOpenness,
    avgEyeOpenness: ratios.avgEyeOpenness,
  };

  if (calibrateStatusEl) {
    calibrateStatusEl.textContent = `Neutral saved. Openness L=${ratios.leftEyeOpenness.toFixed(2)} R=${ratios.rightEyeOpenness.toFixed(2)}`;
    calibrateStatusEl.style.color = "#8b8";
  }
}

function updateExpressionReadout(landmarks) {
  const ratios = computeExpressionRatios(landmarks);
  const expression = classifyExpression(ratios);

  if (!expressionCurrentEl) return;
  expressionCurrentEl.textContent = expression.label;
  expressionCurrentEl.classList.toggle("uncertain", expression.label === "uncertain");

  if (ratios) {
    expressionMouthOpenEl.textContent = ratios.mouthOpen.toFixed(3);
    expressionSmileEl.textContent = ratios.smile.toFixed(3);
    expressionBrowEl.textContent = ratios.browRaise.toFixed(3);
    expressionEyeOpenEl.textContent = `${ratios.leftEyeOpenness.toFixed(2)} / ${ratios.rightEyeOpenness.toFixed(2)}`;
  } else {
    expressionMouthOpenEl.textContent = "—";
    expressionSmileEl.textContent = "—";
    expressionBrowEl.textContent = "—";
    expressionEyeOpenEl.textContent = "—";
  }
}

function syncDrawPadSize() {
  const rect = videoEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * pixelRatio));
  const height = Math.max(1, Math.round(rect.height * pixelRatio));
  if (drawPadEl.width === width && drawPadEl.height === height) return;
  // Preserve existing drawing when resizing by copying to an offscreen canvas.
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = drawPadEl.width;
  tempCanvas.height = drawPadEl.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (tempCtx && drawPadEl.width > 1 && drawPadEl.height > 1) {
    tempCtx.drawImage(drawPadEl, 0, 0);
  }
  drawPadEl.width = width;
  drawPadEl.height = height;
  if (tempCtx && tempCanvas.width > 1 && tempCanvas.height > 1) {
    drawPadCtx.drawImage(tempCanvas, 0, 0, drawPadEl.width, drawPadEl.height);
  }
}

function clearDrawPad() {
  drawPadCtx.clearRect(0, 0, drawPadEl.width, drawPadEl.height);
  lastNosePoint = null;
}

function updateNoseDrawing(landmarks) {
  if (!noseDrawingEnabled || !landmarks?.[1]) {
    lastNosePoint = null;
    return;
  }
  syncDrawPadSize();
  const rect = videoEl.getBoundingClientRect();
  const pr = window.devicePixelRatio || 1;
  const sw = videoEl.videoWidth || rect.width;
  const sh = videoEl.videoHeight || rect.height;
  const tw = rect.width * pr;
  const th = rect.height * pr;
  const scale = Math.max(tw / sw, th / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const ox = (tw - dw) / 2;
  const oy = (th - dh) / 2;
  const lx = landmarks[1].x;
  const ly = landmarks[1].y;
  const nx = lx * dw + ox;
  const ny = ly * dh + oy;

  drawPadCtx.beginPath();
  drawPadCtx.arc(nx, ny, 6 * pr, 0, Math.PI * 2);
  drawPadCtx.fillStyle = "rgba(250, 253, 255, 0.85)";
  drawPadCtx.fill();

  if (lastNosePoint) {
    drawPadCtx.beginPath();
    drawPadCtx.moveTo(lastNosePoint.x, lastNosePoint.y);
    drawPadCtx.lineTo(nx, ny);
    drawPadCtx.strokeStyle = asHsl(colorState.h, colorState.s, colorState.l, 0.9);
    drawPadCtx.lineWidth = 3 * pr;
    drawPadCtx.lineCap = "round";
    drawPadCtx.lineJoin = "round";
    drawPadCtx.stroke();
  }
  lastNosePoint = nose;
}

function updateNoseDrawToggleButton() {
  if (!noseDrawToggleBtnEl) return;
  noseDrawToggleBtnEl.textContent = noseDrawingEnabled ? "Drawing: On" : "Drawing: Off";
  noseDrawToggleBtnEl.dataset.active = noseDrawingEnabled ? "true" : "false";
  noseDrawToggleBtnEl.setAttribute("aria-pressed", String(noseDrawingEnabled));
}

function updateFilterToggleButtons() {
  if (glassesFilterBtnEl) {
    glassesFilterBtnEl.textContent = glassesFilterEnabled ? "Glasses: On" : "Glasses: Off";
    glassesFilterBtnEl.dataset.active = glassesFilterEnabled ? "true" : "false";
    glassesFilterBtnEl.setAttribute("aria-pressed", String(glassesFilterEnabled));
  }
  if (labelsFilterBtnEl) {
    labelsFilterBtnEl.textContent = labelsFilterEnabled ? "Labels: On" : "Labels: Off";
    labelsFilterBtnEl.dataset.active = labelsFilterEnabled ? "true" : "false";
    labelsFilterBtnEl.setAttribute("aria-pressed", String(labelsFilterEnabled));
  }
}

function drawGlassesFilter(landmarks, transform) {
  if (!glassesFilterEnabled || !landmarks) return;
  const leftOuter = landmarks[33];
  const rightOuter = landmarks[263];
  const leftBrow = landmarks[105];
  const rightBrow = landmarks[334];
  if (!leftOuter || !rightOuter || !leftBrow || !rightBrow) return;

  const tx = transform.width;
  const ty = transform.height;
  const ax = leftOuter.x * tx;
  const ay = leftOuter.y * ty;
  const bx = rightOuter.x * tx;
  const by = rightOuter.y * ty;
  const browAx = leftBrow.x * tx;
  const browAy = leftBrow.y * ty;
  const browBx = rightBrow.x * tx;
  const browBy = rightBrow.y * ty;
  const pr = transform.pixelRatio;

  const width = Math.hypot(bx - ax, by - ay);
  const height = Math.max(width * 0.28, Math.abs(browAy - ay) * 0.9);
  const angle = Math.atan2(by - ay, bx - ax);
  const centerX = (ax + bx) / 2;
  const centerY = (ay + by) / 2;

  context2d.save();
  context2d.translate(centerX, centerY);
  context2d.rotate(angle);
  context2d.fillStyle = "rgba(20, 20, 30, 0.82)";
  context2d.strokeStyle = "rgba(250, 253, 255, 0.9)";
  context2d.lineWidth = 2 * pr;
  context2d.beginPath();
  context2d.roundRect(-width / 2 - 4 * pr, -height / 2, width + 8 * pr, height, 8 * pr);
  context2d.fill();
  context2d.stroke();
  context2d.restore();
}

function drawLabelFilter(landmarks, transform) {
  if (!labelsFilterEnabled || !landmarks) return;
  const labels = [
    { index: 1, text: "nose" },
    { index: 159, text: "L eye" },
    { index: 386, text: "R eye" },
    { index: 61, text: "mouth" },
    { index: 10, text: "forehead" },
  ];
  const pr = transform.pixelRatio;
  const tx = transform.width;
  const ty = transform.height;
  context2d.save();
  context2d.font = `${600 * pr}px ui-monospace, monospace`;
  context2d.fillStyle = "rgba(250, 253, 255, 0.92)";
  context2d.strokeStyle = "rgba(0, 0, 0, 0.7)";
  context2d.lineWidth = 2 * pr;
  for (const { index, text } of labels) {
    const landmark = landmarks[index];
    if (!landmark) continue;
    const px = landmark.x * tx;
    const py = landmark.y * ty;
    context2d.strokeText(text, px + 8 * pr, py - 8 * pr);
    context2d.fillText(text, px + 8 * pr, py - 8 * pr);
  }
  context2d.restore();
}

function renderLoop() {
  if (!webcamRunning || !faceLandmarker || !inferenceContext2d) return;
  const nowMs = performance.now();
  if (videoEl.currentTime !== lastVideoTime) {
    lastVideoTime = videoEl.currentTime;
    syncCanvasSize();
    const frameTransform = computeFrameTransform();
    const coverTransform = computeCoverTransform();
    if (!frameTransform || !coverTransform) {
      animationFrameId = requestAnimationFrame(renderLoop);
      return;
    }
    inferenceContext2d.clearRect(0, 0, coverTransform.targetWidth, coverTransform.targetHeight);
    drawCoveredVideo(inferenceContext2d, coverTransform);
    const inferenceStartedAt = performance.now();
    const results = faceLandmarker.detectForVideo(inferenceCanvasEl, nowMs);
    updateInferenceLatency(performance.now() - inferenceStartedAt);
    inferenceCount += 1;
    context2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (privacyMode) {
      context2d.fillStyle = "rgba(0, 0, 0, 0.85)";
      context2d.fillRect(0, 0, canvasEl.width, canvasEl.height);
    } else if (showVideoFeed) {
      context2d.drawImage(inferenceCanvasEl, 0, 0, canvasEl.width, canvasEl.height);
    }
    const faces = results.faceLandmarks ?? [];
    faceCountEl.textContent = String(faces.length);
    updateBenchFaceCount(faces.length);
    activeFaceKeys.clear();
    for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
      const faceKey = `face-${faceIndex}`;
      activeFaceKeys.add(faceKey);
      const smoothed = smoothFaceLandmarks(faceKey, faces[faceIndex]);
      drawFace(smoothed, frameTransform);
      drawGlassesFilter(smoothed, frameTransform);
      drawLabelFilter(smoothed, frameTransform);
    }
    for (const key of smoothingBuffers.keys()) {
      if (!activeFaceKeys.has(key)) {
        smoothedFaces.delete(key);
        smoothingBuffers.delete(key);
      }
    }
    updateExpressionReadout(faces[0]);
    updateNoseDrawing(faces[0]);
    updateFpsCounter(nowMs);
  }
  animationFrameId = requestAnimationFrame(renderLoop);
}

function getModelErrorMessage(error) {
  if (error instanceof TypeError) {
    return "Model download failed. Check your network connection and reload.";
  }
  return "Model failed to initialize. Reload the page to retry.";
}

function getCameraErrorMessage(error) {
  if (!(error instanceof DOMException)) {
    return "Unable to start camera. Check device settings and retry.";
  }
  if (error.name === "NotAllowedError") {
    return "Camera permission denied. Allow access in your browser. You can retry without refreshing.";
  }
  if (error.name === "NotFoundError") {
    return "No camera device found. Connect a camera and retry.";
  }
  if (error.name === "NotReadableError") {
    return "Camera is busy in another app or browser tab.";
  }
  if (error.name === "OverconstrainedError") {
    return "Requested camera settings are unsupported on this device.";
  }
  return `Camera error: ${error.name}`;
}

function stopCamera(
  statusText = "",
  tone = "info",
  placeholderText = defaultPlaceholderMessage
) {
  webcamRunning = false;
  requiresPermissionRetry = false;
  requiresExternalBrowser = false;
  smoothedFaces.clear();
  smoothingBuffers.clear();
  activeFaceKeys.clear();
  cachedCoverTransform = null;
  cachedCoverKey = "";
  cachedFrameTransform = null;
  cachedFrameKey = "";
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
  if (webcamStream) {
    for (const track of webcamStream.getTracks()) track.stop();
  }
  webcamStream = null;
  videoEl.srcObject = null;
  context2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
  drawPadCtx.clearRect(0, 0, drawPadEl.width, drawPadEl.height);
  lastNosePoint = null;
  placeholderEl.classList.remove("hidden");
  setPlaceholderMessage(placeholderText);
  statsEl.hidden = true;
  resetStats();
  updateExpressionReadout(null);
  if (statusText) setStatus(statusText, tone);
  updateCameraButton();
}

async function startCamera() {
  if (!modelReady || !faceLandmarker) {
    setStatus("Model is still loading. Please wait a moment.", "warn");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("Camera API is unavailable in this browser.", "error");
    return;
  }
  if (cameraStartInFlight) {
    return;
  }
  cameraStartInFlight = true;
  try {
    requiresPermissionRetry = false;
    requiresExternalBrowser = false;
    updateCameraButton();
    setStatus("Requesting camera access...", "info");
    webcamStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: getVideoConstraints(),
    });
    const handleTrackEnded = () => {
      if (webcamRunning) {
        stopCamera(
          "Camera stream ended. Enable camera to resume.",
          "error",
          "Camera stream ended. Enable camera to resume."
        );
      }
    };
    for (const track of webcamStream.getTracks()) {
      track.addEventListener("ended", handleTrackEnded, { once: true });
    }
    videoEl.srcObject = webcamStream;
    await videoEl.play();
    requiresPermissionRetry = false;
    await refreshCameraSourceOptions();
    syncCanvasSize();
    resetStats();
    smoothedFaces.clear();
    webcamRunning = true;
    placeholderEl.classList.add("hidden");
    statsEl.hidden = false;
    recordCameraStart(true);
    setStatus("Camera active. Face mesh is running.", "success");
    updateCameraButton();
    renderLoop();
  } catch (error) {
    webcamRunning = false;
    if (webcamStream) {
      for (const track of webcamStream.getTracks()) track.stop();
      webcamStream = null;
    }
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      if (isLikelyEmbeddedEditorBrowser()) {
        requiresExternalBrowser = true;
        requiresPermissionRetry = false;
        updateCameraButton();
        setStatus(
          "This IDE preview blocks camera access. Copy the page link and open it in your browser.",
          "error"
        );
        return;
      }
      requiresPermissionRetry = true;
      await installCameraPermissionWatcher();
    }
    const message = getCameraErrorMessage(error);
    recordCameraStart(false, message);
    setStatus(message, "error");
    updateCameraButton();
  } finally {
    cameraStartInFlight = false;
  }
}

async function loadModel() {
  try {
    modelFailed = false;
    bench.modelLoadStartAt = performance.now();
    setStatus("Loading Face Landmarker model...", "info");
    updateCameraButton();
    logBenchEvent("Started loading Face Landmarker model");
    const vision = await FilesetResolver.forVisionTasks(
      "../../vendor/mediapipe/tasks-vision/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
      },
      runningMode: "VIDEO",
      numFaces: 1,
      // The mesh overlay and expression readout only need face landmarks.
      // Blendshapes and transformation matrices are extra per-frame work
      // that this feature never reads, so keep them disabled.
      outputFaceBlendshapes: OUTPUT_FACE_BLENDSHAPES,
      outputFacialTransformationMatrixes: OUTPUT_FACIAL_TRANSFORMATION_MATRIXES,
    });
    modelReady = true;
    modelFailed = false;
    recordModelLoad(true);
    logBenchEvent(
      `FaceLandmarker outputs: blendshapes=${OUTPUT_FACE_BLENDSHAPES}, matrices=${OUTPUT_FACIAL_TRANSFORMATION_MATRIXES}`
    );
    updateBenchBlendshapesState(OUTPUT_FACE_BLENDSHAPES);
    setStatus("Model loaded. Enable camera to begin.", "success");
    await installCameraPermissionWatcher();
    await refreshCameraSourceOptions();
  } catch (error) {
    console.error("Face Landmarker initialization failed:", error);
    modelReady = false;
    modelFailed = true;
    recordModelLoad(false, getModelErrorMessage(error));
    setStatus(getModelErrorMessage(error), "error");
  }
  updateCameraButton();
}

for (const swatchEl of swatchEls) {
  swatchEl.addEventListener("click", () => {
    const hexColor = swatchEl.dataset.color;
    if (!hexColor) return;
    applySwatchColor(hexColor);
  });
}

hueSliderEl.addEventListener("input", applyFreeColor);
saturationSliderEl.addEventListener("input", applyFreeColor);
lightnessSliderEl.addEventListener("input", applyFreeColor);

nodeSizeSliderEl.addEventListener("input", () => {
  const parsed = Number.parseFloat(nodeSizeSliderEl.value);
  nodeRadius = clampNodeSize(Number.isFinite(parsed) ? parsed : 1.6);
  nodeSizeValueEl.textContent = `${nodeRadius.toFixed(1)}px`;
});

smoothingSliderEl.addEventListener("input", () => {
  const parsed = Number.parseInt(smoothingSliderEl.value, 10);
  const nextPercent = clampSmoothingPercent(Number.isFinite(parsed) ? parsed : 60);
  smoothingStrength = nextPercent / 100;
  updateSmoothingLabel();
});

showVideoFeedInputEl.addEventListener("change", () => {
  showVideoFeed = showVideoFeedInputEl.checked;
});

privacyModeInputEl.addEventListener("change", () => {
  privacyMode = privacyModeInputEl.checked;
});

accessibilityModeInputEl.addEventListener("change", () => {
  document.body.classList.toggle("accessibility-mode", accessibilityModeInputEl.checked);
});

fullMeshBtnEl.addEventListener("click", () => {
  showFullMesh = !showFullMesh;
  updateFullMeshButton();
});

noseDrawToggleBtnEl.addEventListener("click", () => {
  noseDrawingEnabled = !noseDrawingEnabled;
  updateNoseDrawToggleButton();
  if (!noseDrawingEnabled) lastNosePoint = null;
});

noseDrawClearBtnEl.addEventListener("click", () => {
  clearDrawPad();
});

glassesFilterBtnEl.addEventListener("click", () => {
  glassesFilterEnabled = !glassesFilterEnabled;
  updateFilterToggleButtons();
});

labelsFilterBtnEl.addEventListener("click", () => {
  labelsFilterEnabled = !labelsFilterEnabled;
  updateFilterToggleButtons();
});

window.addEventListener("resize", () => {
  syncDrawPadSize();
});

cameraSourceSelect.addEventListener("change", async () => {
  selectedCameraSource = cameraSourceSelect.value;
  selectedCameraLabel = getSelectedCameraLabel(cameraSourceSelect);
  savePreferredCamera(selectedCameraSource, selectedCameraLabel);
  if (!webcamRunning) return;
  stopCamera("Switching camera...");
  await startCamera();
});

cameraBtnEl.addEventListener("click", async () => {
  if (webcamRunning) {
    stopCamera("Camera disabled. Enable camera to resume.");
    return;
  }
  if (requiresExternalBrowser) {
    await handleExternalBrowserFallback();
    return;
  }
  if (requiresPermissionRetry) {
    setStatus("Retrying camera access...", "info");
  }
  await startCamera();
});

copyMarkdownBtnEl.addEventListener("click", () => {
  void copyBenchmarkRow();
});

calibrateNeutralBtnEl.addEventListener("click", () => {
  calibrateNeutralFace();
});

function handleViewportResize() {
  syncCanvasSize();
}

videoEl.addEventListener("loadedmetadata", handleViewportResize);
window.addEventListener("resize", handleViewportResize);
window.addEventListener("orientationchange", handleViewportResize);
window.addEventListener("focus", () => {
  void installCameraPermissionWatcher();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    void installCameraPermissionWatcher();
  }
});
window.visualViewport?.addEventListener("resize", handleViewportResize);

window.addEventListener("beforeunload", () => {
  if (webcamRunning || webcamStream) stopCamera("");
});

syncColorControls();
updateSmoothingLabel();
updateFullMeshButton();
updateNoseDrawToggleButton();
updateFilterToggleButtons();
updateCameraButton();
logBenchEvent("Page loaded");
void installCameraPermissionWatcher();
loadModel();
