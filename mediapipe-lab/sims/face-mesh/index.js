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
const context2d = canvasEl.getContext("2d");
const inferenceCanvasEl = document.createElement("canvas");
const inferenceContext2d = inferenceCanvasEl.getContext("2d");
const placeholderEl = document.getElementById("placeholder");
const placeholderMessageEl = placeholderEl.querySelector(".placeholder-card p");
const statusBadgeEl = document.getElementById("status-badge");
const cameraBtnEl = document.getElementById("camera-btn");
const cameraSourceSelect = document.getElementById("camera-source");
const showVideoFeedInputEl = document.getElementById("show-video-feed");
const fullMeshBtnEl = document.getElementById("full-mesh-btn");
const statsEl = document.getElementById("stats");
const faceCountEl = document.getElementById("face-count");
const fpsEl = document.getElementById("fps");
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

const colorState = { h: 190, s: 90, l: 57 };
const DEFAULT_SMOOTHING = 0.6;
const CAMERA_SOURCE_FRONT = "@user";
const CAMERA_SOURCE_REAR = "@environment";
const FACE_LANDMARKER_MODEL_PATH = "../../vendor/mediapipe/models/face_landmarker.task";
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
let showFullMesh = true;
let lastVideoTime = -1;
let frameCount = 0;
let lastFpsTimestamp = performance.now();
let animationFrameId = 0;
let requiresPermissionRetry = false;
let cameraPermissionStatus = null;
let requiresExternalBrowser = false;
let cameraStartInFlight = false;
let selectedCameraSource = preferredCamera.source;
let selectedCameraLabel = preferredCamera.label;
const smoothedFaces = new Map();

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
}

function resetStats() {
  faceCountEl.textContent = "0";
  fpsEl.textContent = "0";
  frameCount = 0;
  lastFpsTimestamp = performance.now();
}

function updateFpsCounter(nowMs) {
  frameCount += 1;
  if (nowMs - lastFpsTimestamp < 1000) return;
  fpsEl.textContent = String(frameCount);
  frameCount = 0;
  lastFpsTimestamp = nowMs;
}

function computeCoverTransform() {
  const sourceWidth = videoEl.videoWidth;
  const sourceHeight = videoEl.videoHeight;
  const targetWidth = canvasEl.width;
  const targetHeight = canvasEl.height;
  if (!sourceWidth || !sourceHeight || !targetWidth || !targetHeight) {
    return null;
  }
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawnWidth = sourceWidth * scale;
  const drawnHeight = sourceHeight * scale;
  return {
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
    drawnWidth,
    drawnHeight,
    scale,
    offsetX: (targetWidth - drawnWidth) / 2,
    offsetY: (targetHeight - drawnHeight) / 2,
  };
}

function computeFrameTransform() {
  const width = canvasEl.width;
  const height = canvasEl.height;
  if (!width || !height) {
    return null;
  }
  return {
    width,
    height,
    pixelRatio: window.devicePixelRatio || 1,
  };
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

function projectLandmark(landmark, transform) {
  return {
    x: landmark.x * transform.width,
    y: landmark.y * transform.height,
  };
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

function traceConnections(landmarks, connections, transform) {
  context2d.beginPath();
  for (const connection of connections) {
    const endpoints = getConnectionEndpoints(connection);
    if (!endpoints) continue;
    const start = landmarks[endpoints.start];
    const end = landmarks[endpoints.end];
    if (!start || !end) continue;
    const a = projectLandmark(start, transform);
    const b = projectLandmark(end, transform);
    context2d.moveTo(a.x, a.y);
    context2d.lineTo(b.x, b.y);
  }
}

function strokeConnections(landmarks, connections, { color, width, glow = 0, glowColor }, transform) {
  traceConnections(landmarks, connections, transform);
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
  context2d.shadowBlur = radius * 2.4;
  context2d.shadowColor = overlayStyle.iris;
  for (const index of indices) {
    const landmark = landmarks[index];
    if (!landmark) continue;
    const point = projectLandmark(landmark, transform);
    context2d.beginPath();
    context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context2d.fillStyle = overlayStyle.landmark;
    context2d.fill();
  }
  context2d.shadowBlur = 0;
  for (const index of indices) {
    const landmark = landmarks[index];
    if (!landmark) continue;
    const point = projectLandmark(landmark, transform);
    context2d.beginPath();
    context2d.arc(point.x, point.y, coreRadius, 0, Math.PI * 2);
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
  const previous = smoothedFaces.get(faceKey);
  if (!Array.isArray(previous) || previous.length !== faceLandmarks.length) {
    const seeded = faceLandmarks.map((landmark) => ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z ?? 0,
    }));
    smoothedFaces.set(faceKey, seeded);
    return seeded;
  }

  const blendBase = 1 - smoothingStrength;
  let motionAccumulator = 0;
  for (let index = 0; index < faceLandmarks.length; index += 1) {
    const landmark = faceLandmarks[index];
    const prev = previous[index];
    motionAccumulator += Math.hypot(landmark.x - prev.x, landmark.y - prev.y);
  }
  const averageMotion = faceLandmarks.length > 0 ? motionAccumulator / faceLandmarks.length : 0;
  const adaptiveBoost = clampFloat(averageMotion * 20, 0, 0.78);
  const blend = clampFloat(blendBase + adaptiveBoost, 0.1, 1);

  const next = faceLandmarks.map((landmark, index) => {
    const prev = previous[index];
    const nextZ = landmark.z ?? 0;
    return {
      x: prev.x + (landmark.x - prev.x) * blend,
      y: prev.y + (landmark.y - prev.y) * blend,
      z: prev.z + (nextZ - prev.z) * blend,
    };
  });
  smoothedFaces.set(faceKey, next);
  return next;
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
    const results = faceLandmarker.detectForVideo(inferenceCanvasEl, nowMs);
    context2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (showVideoFeed) {
      context2d.drawImage(inferenceCanvasEl, 0, 0, canvasEl.width, canvasEl.height);
    }
    const faces = results.faceLandmarks ?? [];
    faceCountEl.textContent = String(faces.length);
    const activeFaceKeys = new Set();
    for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
      const faceKey = `face-${faceIndex}`;
      activeFaceKeys.add(faceKey);
      const smoothed = smoothFaceLandmarks(faceKey, faces[faceIndex]);
      drawFace(smoothed, frameTransform);
    }
    for (const key of smoothedFaces.keys()) {
      if (!activeFaceKeys.has(key)) {
        smoothedFaces.delete(key);
      }
    }
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
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
  if (webcamStream) {
    for (const track of webcamStream.getTracks()) track.stop();
  }
  webcamStream = null;
  videoEl.srcObject = null;
  context2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
  placeholderEl.classList.remove("hidden");
  setPlaceholderMessage(placeholderText);
  statsEl.hidden = true;
  resetStats();
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
    setStatus(message, "error");
    updateCameraButton();
  } finally {
    cameraStartInFlight = false;
  }
}

async function loadModel() {
  try {
    modelFailed = false;
    setStatus("Loading Face Landmarker model...", "info");
    updateCameraButton();
    const vision = await FilesetResolver.forVisionTasks(
      "../../vendor/mediapipe/tasks-vision/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
    modelReady = true;
    modelFailed = false;
    setStatus("Model loaded. Enable camera to begin.", "success");
    await installCameraPermissionWatcher();
    await refreshCameraSourceOptions();
  } catch (error) {
    console.error("Face Landmarker initialization failed:", error);
    modelReady = false;
    modelFailed = true;
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

fullMeshBtnEl.addEventListener("click", () => {
  showFullMesh = !showFullMesh;
  updateFullMeshButton();
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
updateCameraButton();
loadModel();
