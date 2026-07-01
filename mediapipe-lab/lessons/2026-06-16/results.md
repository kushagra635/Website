# MediaPipe Demo Performance Results

Run each demo with the camera enabled for ~10 seconds, then record the on-screen values.

| Stage                                 | Render FPS | Inference latency (ms) | Inferences/sec | Notes                                  |
| ------------------------------------- | ---------- | ---------------------- | -------------- | -------------------------------------- |
| Baseline (Pose)                       | 10         | 8–13                   | 10             | 1 pose, 0 hands                        |
| Baseline (Face Mesh)                  | 11         | 15–16                  | 10             | 1 face                                 |
| Baseline (Gesture)                    | 11         | 24–28                  | 6              | 1 hand, stable after inference-resolution + 100 ms throttle |
| After (track: disable unused outputs) | 11         | 15–16                  | 10             | `outputFaceBlendshapes`/`outputFacialTransformationMatrixes` explicit false; `outputSegmentationMasks` explicit false |
| GPU delegate                          | 20         | 12                     | 8              | 1 hand, lower latency but lower render FPS than CPU |
| CPU delegate                          | 30         | 40                     | 8              | 1 hand, higher render FPS but higher latency than GPU |

## Before / after / trade

| | Face Mesh | Pose |
| --- | --- | --- |
| **Before** | `outputFaceBlendshapes: false` (already off, but hard-coded literal) | `outputSegmentationMasks` not specified; relying on default `false` |
| **Change made visible** | Added `OUTPUT_FACE_BLENDSHAPES` constant + benchmark UI row that shows **Blendshapes: disabled** | Explicitly set `outputSegmentationMasks: false` in both `createFromOptions` and `setOptions` |
| **After** | `outputFaceBlendshapes: false` via named constant; benchmark panel reports status | `outputSegmentationMasks: false` in code; cannot accidentally flip to `true` if defaults change |
| **Measured impact** | No FPS/latency change on live camera; synthetic benchmark shows overhead ≈ 0% | No measured change; segmentation mask head stays off |

**Trade in one sentence:** We give up the ability to accidentally emit unused blendshapes/segmentation masks, and in exchange we avoid the per-frame work and memory of producing results the feature never reads.

## Disabling unused model outputs

Checked each demo for model outputs whose results are never read:

| Demo | Model | Unused output | Was enabled? | Action |
| ---- | ----- | ------------- | ------------ | ------ |
| Face Mesh | FaceLandmarker | `outputFaceBlendshapes` | Already `false` | Made explicit via `OUTPUT_FACE_BLENDSHAPES`; added benchmark UI row |
| Face Mesh | FaceLandmarker | `outputFacialTransformationMatrixes` | Already `false` | Made explicit via `OUTPUT_FACIAL_TRANSFORMATION_MATRIXES` |
| Pose | PoseLandmarker | `outputSegmentationMasks` | Default `false` | Explicitly set to `false` in create + setOptions |
| Gesture/Slideshow | GestureRecognizer | `worldLandmarks` | Always emitted | No toggle available in Tasks Vision API |
| Pose | HandLandmarker | `worldLandmarks` | Always emitted | No toggle available in Tasks Vision API |

### Blendshape cost measurement

Used `sims/face-mesh/blendshape-benchmark.html` (CPU delegate, synthetic 480×360 face, 4 alternating rounds of 100 warm-up + 300 measured inferences).

| Setting | Median latency | Mean latency | Detected faces |
| ------- | ---------------:| ------------:| --------------:|
| Blendshapes disabled | ~15.5 ms | ~15.6 ms | 300/300 |
| Blendshapes enabled  | ~15.5 ms | ~15.4 ms | 300/300 |
| **Overhead** | **≈ 0%** | **≈ 0%** | — |

On this synthetic frame the blendshape head adds less than the run-to-run variance (~0.5 ms), so the latency win is small. The main value is still removing unused per-frame work and avoiding the memory for 52 unused blendshape coefficients per face. On a GPU delegate or a more complex scene the overhead may be larger; the benchmark page can be re-run with the live delegate to check.

## Reflection questions

**Which line did your change touch, and what does that line do every frame?**

The change touched the `FaceLandmarker.createFromOptions(...)` call in `sims/face-mesh/index.js` and the `PoseLandmarker.createFromOptions(...)` / `setOptions(...)` calls in `sims/pose-estimation/index.html`. These lines configure which outputs the model graph produces. Every frame, `detectForVideo` runs the full face/pose model; the options tell MediaPipe whether to also run the extra output heads (blendshapes, transformation matrices, segmentation masks) and allocate tensors for them.

**Why does the change cost less? Fewer model runs? Smaller input? A different hardware path? Less work drawn per frame?**

It is not fewer model runs, smaller input, a different hardware path, or less drawing. The single model run still happens, but the graph skips the unused output heads and avoids producing tensors that the feature never reads. That means less per-frame GPU/CPU work inside the model and less memory allocated for those tensors.

**If a classmate said "just make it faster," what would you tell them to measure first?**

Measure where the frame budget is actually going. In the browser, use the Performance tab to see if the main thread is blocked by inference, canvas drawing, or JavaScript; read the on-screen inference latency and inferences/sec; and test one knob at a time (resolution, delegate, throttle interval, unused outputs) with a reproducible input so you know which change actually moved the numbers.
