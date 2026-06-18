# Lesson 1: Measure the Baseline Before You Touch Anything

**Trains:** Skill #5 — Defining "done" and proving it, and Skill #9 — The
quality the AI skips (performance).

**Time estimate:** 45–60 minutes

You cannot optimize what you have not measured. Today's whole point is
*before vs after*, so the first job is an honest **before**. No logic changes
yet — you are only adding measurement and writing down numbers.

## The number that already exists

Every demo shows an FPS counter (`#fps`). That is **render FPS** — how often the
screen redraws. It is not the same as how often the model actually runs. On a
slow machine those two numbers drift apart, and the gap is where optimization
lives.

Open your demo file:

- Pose: `mediapipe-lab/sims/pose-estimation/index.html`
- Face Mesh: `mediapipe-lab/sims/face-mesh/index.js`
- Gesture: `mediapipe-lab/sims/gesture-recognition/index.html`

Find the render loop (`requestAnimationFrame`) and the inference call
(`detectForVideo` or `recognizeForVideo`). Those two lines are the engine.
Everything you do today changes how often, how fast, or how smoothly they run.

## Add an honest instrument

Pose Estimation already does this — study it first. Around its inference call it
records the real cost of one model run:

```js
const inferenceStartedAt = performance.now();
const poseResult = poseLandmarker.detectForVideo(video, timestampMs);
const latencyMs = performance.now() - inferenceStartedAt;
```

Add the same two `performance.now()` brackets around *your* demo's inference
call and show a rolling average on screen (or log it). You want three numbers:

1. **Render FPS** — already shown.
2. **Inference latency (ms)** — how long one `detectForVideo` /
   `recognizeForVideo` takes.
3. **Inferences per second** — how many model runs actually happen each second.

## Record the baseline

Create `lessons/2026-06-16/results.md` yourself and write the **before** row. Do
not let an agent invent numbers — run it with the camera on for 10 seconds, then
read the values off your own screen.

| Stage | Render FPS | Inference latency (ms) | Inferences/sec | Notes |
| --- | --- | --- | --- | --- |
| Baseline | | | | browser + machine |

Use the same browser and machine for the after measurement, or the comparison
is meaningless.

## Done when

- [ ] You can point to the exact render-loop line and inference line in your demo.
- [ ] Your demo reports inference latency in ms, not just render FPS.
- [ ] `results.md` has a real Baseline row measured with the camera on.
