# Gesture Recognizer — Web / JavaScript Guide

The MediaPipe Gesture Recognizer task lets you recognize hand gestures in real time, and provides the recognized hand gesture results and the hand landmarks of the detected hands.

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

const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "path/to/gesture_recognizer.task"
  },
  numHands: 2
});
```

### Configuration Options

| Option | Description | Range | Default |
|--------|-------------|-------|---------|
| `runningMode` | IMAGE or VIDEO | `IMAGE, VIDEO` | `IMAGE` |
| `numHands` | Max hands to detect | Integer > 0 | 1 |
| `minHandDetectionConfidence` | Min confidence for detection | [0.0, 1.0] | 0.5 |
| `minHandPresenceConfidence` | Min confidence for presence | [0.0, 1.0] | 0.5 |
| `minTrackingConfidence` | Min confidence for tracking | [0.0, 1.0] | 0.5 |

### Canned Gestures

The built-in gesture classifier recognizes: `None`, `Closed_Fist`, `Open_Palm`, `Pointing_Up`, `Thumb_Down`, `Thumb_Up`, `Victory`, `ILoveYou`.

## Run the Task

### Image

```js
const image = document.getElementById("image");
const result = gestureRecognizer.recognize(image);
```

### Video

```js
await gestureRecognizer.setOptions({ runningMode: "VIDEO" });

let lastVideoTime = -1;
function renderLoop() {
  const video = document.getElementById("video");
  if (video.currentTime !== lastVideoTime) {
    const result = gestureRecognizer.recognizeForVideo(video);
    processResult(result);
    lastVideoTime = video.currentTime;
  }
  requestAnimationFrame(renderLoop);
}
```

## Results

`GestureRecognizerResult` contains per detected hand:

- **Handedness**: Left or right hand with confidence score.
- **Gestures**: Recognized gesture category (e.g. `Thumb_Up`) with confidence.
- **Landmarks** (21 landmarks): Normalized `(x, y, z)` coordinates relative to image.
- **WorldLandmarks** (21 landmarks): Real-world 3D coordinates in meters.

### Hand Landmark Indices (21)

0: Wrist, 1-4: Thumb (CMC, MCP, IP, Tip), 5-8: Index Finger (MCP, PIP, DIP, Tip), 9-12: Middle Finger, 13-16: Ring Finger, 17-20: Pinky.

---

*Vendored from [Google AI Edge docs](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js) on 2026-06-12. Licensed under CC BY 4.0.*
