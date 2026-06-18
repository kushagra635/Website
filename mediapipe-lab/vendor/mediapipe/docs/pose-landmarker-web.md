# Pose Landmarker — Web / JavaScript Guide

The MediaPipe Pose Landmarker task lets you detect landmarks of human bodies in an image or video. You can use this task to identify key body locations, analyze posture, and categorize movements.

## Setup

```
npm install @mediapipe/tasks-vision
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
  crossorigin="anonymous"></script>
```

## Create the Task

```js
const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "path/to/pose_landmarker.task"
  },
  runningMode: "IMAGE"
});
```

### Configuration Options

| Option | Description | Range | Default |
|--------|-------------|-------|---------|
| `runningMode` | IMAGE or VIDEO | `IMAGE, VIDEO` | `IMAGE` |
| `numPoses` | Max poses to detect | Integer > 0 | 1 |
| `minPoseDetectionConfidence` | Min confidence for detection | [0.0, 1.0] | 0.5 |
| `minPosePresenceConfidence` | Min confidence for pose presence | [0.0, 1.0] | 0.5 |
| `minTrackingConfidence` | Min confidence for tracking | [0.0, 1.0] | 0.5 |
| `outputSegmentationMasks` | Output segmentation mask | Boolean | False |

## Run the Task

### Image

```js
const image = document.getElementById("image");
const result = poseLandmarker.detect(image);
```

### Video

```js
await poseLandmarker.setOptions({ runningMode: "VIDEO" });

let lastVideoTime = -1;
function renderLoop() {
  const video = document.getElementById("video");
  if (video.currentTime !== lastVideoTime) {
    const result = poseLandmarker.detectForVideo(video);
    processResults(result);
    lastVideoTime = video.currentTime;
  }
  requestAnimationFrame(renderLoop);
}
```

## Results

`PoseLandmarkerResult` contains:

- **Landmarks** (33 per pose): Normalized coordinates `(x, y, z)` where x,y are [0,1] relative to image, z is depth.
- **WorldLandmarks** (33 per pose): Real-world 3D coordinates in meters.
- **SegmentationMasks** (optional): Per-pixel likelihood of belonging to a detected person.

Each landmark has: `x`, `y`, `z`, `visibility`, `presence`.

### Landmark Indices

Output includes 33 body landmarks covering: nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles, heels, feet, etc.

---

*Vendored from [Google AI Edge docs](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js) on 2026-06-12. Licensed under CC BY 4.0.*
