# MediaPipe Tasks Vision API

MediaPipe Tasks provides the core programming interface of the MediaPipe Solutions suite, including a set of libraries for deploying ML solutions onto devices with a minimum of code. It supports multiple platforms, including Android, Web / JavaScript, Python, and iOS.

## Web / JavaScript

The MediaPipe Tasks Web JavaScript API is divided into packages that perform ML tasks in vision, natural language, and audio.

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs"
  crossorigin="anonymous"></script>
```

Or via npm:

```
npm install @mediapipe/tasks-vision
```

### Key Classes (tasks-vision)

| Class | Description |
|-------|-------------|
| `DrawingUtils` | Helper class to visualize the result of a MediaPipe Vision task |
| `FaceDetector` | Performs face detection on images |
| `FaceLandmarker` | Performs face landmarks detection on images |
| `FaceStylizer` | Performs face stylization on images |
| `GestureRecognizer` | Performs gesture recognition on images |
| `HandLandmarker` | Performs hand landmarks detection on images |
| `HolisticLandmarker` | Performs holistic landmarks detection on images |
| `ImageClassifier` | Performs image classification on images |
| `ImageEmbedder` | Performs embedding extraction on images |
| `ImageSegmenter` | Performs image segmentation on images |
| `InteractiveSegmenter` | Performs interactive segmentation on images |
| `ObjectDetector` | Performs object detection on images |
| `PoseLandmarker` | Performs pose landmarks detection on images |

### Common Pattern

```js
const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const task = await SomeTask.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "path/to/model.task"
  },
  runningMode: "IMAGE" // or "VIDEO"
});

// For images:
const result = task.detect(image); // or recognize(), classify(), etc.

// For video:
await task.setOptions({ runningMode: "VIDEO" });
const result = task.detectForVideo(videoFrame, timestamp);
```

### Running Modes

- **IMAGE**: Single image inputs. Uses `detect()` / `recognize()` / `classify()`.
- **VIDEO**: Decoded video frames or live stream. Uses `detectForVideo()` / `recognizeForVideo()`.

### Setup Guides

- [Web setup](https://developers.google.com/edge/mediapipe/solutions/setup_web)
- [Android setup](https://developers.google.com/edge/mediapipe/solutions/setup_android)
- [Python setup](https://developers.google.com/edge/mediapipe/solutions/setup_python)

---

*Vendored from [Google AI Edge docs](https://developers.google.com/edge/mediapipe/solutions/tasks) on 2026-06-12. Licensed under CC BY 4.0.*
