# Optimization Plan — Gesture Recognition Demo

## 1. Which optimization track(s) am I doing, and in which order?

1. **Measure baseline first** — record render FPS, inference latency, and inferences/sec with the camera running for ~10 seconds.
2. **Reduce per-inference cost** — lower the resolution of the image fed to `recognizeForVideo`, because the display canvas was retina-sized and much larger than the model needs.
3. **Throttle inference to a sustainable rate** — cap `recognizeForVideo` calls so the main thread never gets saturated if a single inference stalls.
4. **Keep the UI/UX intact** — preserve full-resolution overlay rendering and avoid spawning game targets behind HTML UI elements.

## 2. Which exact line(s) in my demo will change?

`sims/gesture-recognition/index.html` inside the module script:

- **Inference canvas size** — added fixed small canvas before creating the context:
  ```js
  const INFERENCE_WIDTH = 480;
  const INFERENCE_HEIGHT = 360;
  const inferenceCanvas = document.createElement("canvas");
  inferenceCanvas.width = INFERENCE_WIDTH;
  inferenceCanvas.height = INFERENCE_HEIGHT;
  ```
- **Separate cover transform for inference** — added `computeInferenceCoverTransform()` so the low-res inference canvas is filled the same way the full-res display canvas is.
- **Render-loop inference call** — wrapped `recognizeForVideo` in a 50 ms throttle and cached the last results:
  ```js
  let results = lastGestureResults;
  if (nowMs - lastInferenceTime >= INFERENCE_INTERVAL_MS) {
    const inferenceStartedAt = performance.now();
    results = gestureRecognizer.recognizeForVideo(inferenceCanvas, nowMs);
    updateInferenceLatency(performance.now() - inferenceStartedAt);
    inferenceCount += 1;
    lastInferenceTime = nowMs;
    lastGestureResults = results;
  }
  ```
- **Game target spawn** — added `getUiExclusionRects()` and `isTargetInsideExclusion()` so `spawnTarget()` avoids the gesture readout, game HUD, and status banner.

## 3. What do I predict will happen to each of the three numbers?

| Metric | Before | Prediction | Actual |
|--------|--------|------------|--------|
| Render FPS | 12 (then froze) | Rise as inference consumes less of the frame budget | 11 |
| Inference latency | 45 ms | Drop significantly because the model processes far fewer pixels | 24–28 ms |
| Inferences/sec | 3 (then froze) | Drop because inference is throttled | 6 |

The main win was **stability**: the demo went from freezing after a few seconds to running continuously.

## 4. What might get worse, and how will I check?

| Risk | How to check |
|------|--------------|
| Lower inference resolution reduces tracking accuracy, especially for small/far hands | Move hand to edges of frame, test at arm’s length, compare landmark sticking vs. the Pose demo |
| Throttling makes the finger-target game feel laggy | Play the game; the index-finger cursor should still follow smoothly and targets should register hits |
| Mirroring the feed could confuse handedness labels | Verify left/right hand labels still make sense to the user (mirrored display swaps them visually) |
| Targets avoiding UI might cluster in one area and feel repetitive | Play multiple rounds; targets should appear across the whole safe area, not only the center |

## 5. CPU vs GPU delegate

Added `delegate: "GPU"` to `baseOptions` and a dropdown to switch to CPU. Measured on the same machine with the 100 ms throttle and 480×360 inference canvas:

| Delegate | Render FPS | Inference latency (ms) | Inferences/sec | Notes |
|----------|-----------:|-----------------------:|---------------:|-------|
| GPU      | 20         | 12                     | 8              | Lower per-inference cost |
| CPU      | 30         | 40                     | 8              | Higher render FPS; no GPU contention |

Both delegates stayed at ~8 IPS because of the 100 ms throttle. The GPU delegate gives faster individual inferences (12 ms vs 40 ms) but the CPU delegate yields a higher render frame rate on this machine, likely because the GPU is also busy with canvas compositing.

If either delegate fails, the status banner and placeholder now name the failing delegate and suggest switching.

## 6. One-Euro smoothing for jitter reduction

Replaced the simple fixed-blend EMA in `smoothLandmarks()` with a **One-Euro filter** per landmark coordinate (x, y, z). The filter adapts smoothing to motion:
- When the hand is still, `minCutoff` is low → heavy smoothing → less jitter.
- When the hand moves fast, `beta * |velocity|` raises the cutoff → less lag.

The existing smoothing slider now controls `minCutoff` (displayed in Hz next to the percentage). A new on-screen **Jitter** readout shows the average pixel deviation of the smoothed index fingertip from its mean over the last 60 frames.

### How to measure
1. Hold your index fingertip as still as possible.
2. Read the **Jitter** value (lower = smoother).
3. Try smoothing 0% vs 95% and compare jitter.
4. The overlay should still feel responsive during fast motion.

## 7. Next knobs to turn

If any regression appears, the next variables to adjust are:
- `INFERENCE_WIDTH/HEIGHT` if tracking accuracy at edges suffers.
- `INFERENCE_INTERVAL_MS` to trade IPS for render FPS.
- `beta` multiplier or the `minCutoff` range if the One-Euro filter feels too laggy or too shaky.
- Add an explicit mirror/hand-label toggle if handedness labels confuse the user.
