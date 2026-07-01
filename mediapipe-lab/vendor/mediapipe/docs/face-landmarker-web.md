# Face Landmarker — Web / JavaScript Guide

The MediaPipe Face Landmarker task lets you detect face landmarks and facial expressions in images and videos. You can use this task to identify human facial expressions, apply facial filters and effects, and create virtual avatars.

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

const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "path/to/face_landmarker.task"
  },
  runningMode: "IMAGE"
});
```

### Configuration Options

| Option | Description | Range | Default |
|--------|-------------|-------|---------|
| `runningMode` | IMAGE or VIDEO | `IMAGE, VIDEO` | `IMAGE` |
| `numFaces` | Max faces to detect | Integer > 0 | 1 |
| `minFaceDetectionConfidence` | Min confidence for detection | [0.0, 1.0] | 0.5 |
| `minFacePresenceConfidence` | Min confidence for presence | [0.0, 1.0] | 0.5 |
| `minTrackingConfidence` | Min confidence for tracking | [0.0, 1.0] | 0.5 |
| `outputFaceBlendshapes` | Output facial expression blendshapes | Boolean | False |
| `outputFacialTransformationMatrixes` | Output transformation matrix | Boolean | False |

## Run the Task

### Image

```js
const image = document.getElementById("image");
const result = faceLandmarker.detect(image);
```

### Video

```js
await faceLandmarker.setOptions({ runningMode: "VIDEO" });

let lastVideoTime = -1;
function renderLoop() {
  const video = document.getElementById("video");
  if (video.currentTime !== lastVideoTime) {
    const result = faceLandmarker.detectForVideo(video);
    processResults(result);
    lastVideoTime = video.currentTime;
  }
  requestAnimationFrame(renderLoop);
}
```

## Results

`FaceLandmarkerResult` contains:

- **face_landmarks** (478 landmarks per face): Normalized coordinates `(x, y, z)`.
- **face_blendshapes** (optional, 52 blendshapes): Expression coefficients such as `browDownLeft`, `browInnerUp`, `mouthSmileLeft`, etc.
- **facial_transformation_matrixes** (optional): Matrix for rendering effects.

---

*Vendored from [Google AI Edge docs](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js) on 2026-06-12. Licensed under CC BY 4.0.*
