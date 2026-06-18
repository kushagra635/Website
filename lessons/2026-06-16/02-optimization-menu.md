# Lesson 2: Pick Your Optimizations

**Trains:** Skill #3 — Deletion and restraint (do less work per frame),
Skill #7 — Writing intent before code, Skill #9 — performance.

**Time estimate:** 2–3 hours

## Before coding

Create `lessons/2026-06-16/plan.md` yourself and answer:

1. Which optimization track(s) am I doing, and in which order?
2. Which exact line(s) in my demo will change?
3. What do I predict will happen to each of the three numbers?
4. What might get worse, and how will I check?

Write the prediction *before* you measure. Being wrong on purpose, in writing,
is how you learn what actually costs time.

Pick **at least two** tracks. Measure after each one separately — stacking three
changes and measuring once tells you nothing about which one worked.

### Track A: Decouple detection from drawing

Most demos call the model **every** animation frame. The screen can redraw at 60
FPS while the model only needs to run 15–20 times a second to feel live.

- Run inference every Nth frame (or on a timer) and keep drawing the last result
  every frame.
- Pose Estimation already separates "processed FPS" from render FPS — read how it
  does it before you write your own.
- Measure: render FPS should rise, inferences/sec should drop, and the overlay
  should still feel responsive.

Trade to watch: too few inferences/sec and the overlay lags behind reality.

### Track B: GPU vs CPU delegate

In `createFromOptions(...)`, the model runs on a delegate:

```js
baseOptions: { modelAssetPath: "...", delegate: "GPU" }
```

Pose Estimation sets `delegate: "GPU"`. The Face Mesh and Gesture demos set
**no delegate at all**, so they default to **CPU** — which is very likely why
Pose ran smoother in your June 12 benchmark. That makes adding `delegate: "GPU"`
a real change here, not a no-op. Add it to `baseOptions`, then measure inference
latency on CPU vs GPU.

Trade to watch: GPU is usually faster but not always available; the honest
result might be "GPU helped on my machine — yours may differ." If GPU init fails,
say so in the UI and fall back to CPU rather than hiding the error.

### Track C: Smooth the landmarks (EMA / One-Euro)

Raw landmarks jitter frame to frame. Smoothing is a real computer-vision
technique and it calms everything downstream.

- Keep the previous landmark and blend:
  `smoothed = a * raw + (1 - a) * previous` (exponential moving average), or
  implement a One-Euro filter.
- This does not raise FPS — it raises *quality*. Measure jitter instead: how much
  a fingertip / label / joint wobbles while you hold still.

Trade to watch: too much smoothing adds lag ("rubber-banding").

### Track D: Shrink the model's input

The model does not need a full-resolution frame. The face-mesh and gesture demos
already run inference on a separate `inferenceCanvas` — change its size.

- Feed the model a smaller frame; keep the displayed video full size.
- Measure inference latency before and after.

Trade to watch: too small and detection gets less accurate or drops out at
distance.

### Track E: Stop computing what you don't show

Look for work done every frame whose result is never used — face blendshapes you
don't read, extra landmark sets, a second model, console logging in the hot loop.

- Turn off one output your feature doesn't use (e.g. `outputFaceBlendshapes`) and
  measure.

Trade to watch: don't delete something your feature depends on — read first.

## Constraints

- Work in `mediapipe-lab/`. Keep your June 12 feature working.
- Change one thing, measure, commit. Then the next.
- Do not replace real MediaPipe output with fake data.
- Do not hide errors. If the camera or model fails, the UI still says so.
- Keep functions small enough that you can explain them.

## Done when

- [ ] `plan.md` exists with predictions written before measuring.
- [ ] You applied at least two tracks and measured each separately.
- [ ] Your June 12 feature still works.
