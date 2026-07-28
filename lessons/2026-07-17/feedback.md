# Segmentation feedback — 2026-07-17

Reviewed against the current `main` branch on 2026-07-27.

## Current state

The person-segmentation assignment has not been implemented yet.

- There is no `mediapipe-lab/sims/person-segmentation/` module on any fetched
  branch.
- The expected local route returns 404.
- `plan.md`, `results.md`, and `answer.md` are still blank.
- The local MediaPipe bundle, WASM runtime, and
  `selfie_segmenter.tflite` model are already available in
  `mediapipe-lab/vendor/mediapipe/`.

This is a completion gap rather than a code defect. Start with the planning
gate; do not jump directly to generated implementation code.

## What to investigate first

### 1. Establish the API contract

In `plan.md`, trace the exact local API before creating the module:

- how `FilesetResolver` loads the local WASM directory;
- how `ImageSegmenter` is constructed with the CPU delegate;
- the still-image and video-frame method signatures;
- how `IMAGE` and `VIDEO` running modes differ;
- what `confidenceMasks[0]` contains for this single-class model;
- which masks, results, streams, object URLs, and segmenter resources must be
  released.

OpenCode may locate declarations and ask questions. Write the contract,
predictions, and remaining uncertainty yourself.

Stop if the call signature, running mode, or cleanup owner is still uncertain.
Do not ask an agent to guess from a different MediaPipe version.

### 2. Build the smallest still-image path

Create the module under:

```text
mediapipe-lab/sims/person-segmentation/
```

Add it to the MediaPipe lab launcher. Begin with one uploaded image and one
visible raw confidence mask before adding effects or webcam code.

Look for:

- a bounded input size that preserves the image aspect ratio;
- a visible loading, ready, success, and error state;
- a confidence-mask buffer whose dimensions match the rendered output;
- explicit cleanup after the mask has been read;
- a threshold control whose effect can be observed on the existing image.

Evidence: record the local route, status text, mask dimensions, threshold, and
commit in `results.md`.

### 3. Add one mask-driven effect

Only after the raw mask is correct, add one effect such as an overlay or
background blur.

Verify that the source image remains visible and that the effect changes when
the threshold changes. Keep the source image and the mask on separate drawing
surfaces until the final composite.

Stop if the result becomes only a colored silhouette, the image is stretched,
or moving a control does not update the current output.

### 4. Add the webcam as an explicit mode

Treat still-image and webcam processing as separate states. A transition must:

1. stop the current input;
2. await the required MediaPipe running-mode change;
3. start the new input;
4. prevent stale callbacks from drawing;
5. leave the interface recoverable after an error.

If you use the callback form of `segmentForVideo`, verify that at most one
callback-producing inference is active. If you use a synchronous result form,
do not claim calls overlapped without direct evidence.

### 5. Measure honestly

Use one named browser, machine, camera resolution, threshold, scene, warm-up,
and effect. Run five automatically timed 10-second measurements.

Record:

- completed inferences;
- median and p95 inference latency;
- effective inference FPS;
- foreground coverage;
- every failed or exploratory run.

Do not explain a change in latency from scene content unless the measurements
isolate that mechanism.

## Required failure checks

- camera permission denied;
- camera stopped and restarted;
- image selected while webcam mode is active;
- large uploaded image;
- low light or fast movement;
- person partly outside the frame.

Record the actual result, including failures, before changing the code.

## Stop conditions

Stop and preserve the evidence if:

- the local API signature or running mode is still unverified;
- a model, WASM, or confidence-mask request fails;
- switching inputs leaves two active owners;
- the source image is erased or distorted during compositing;
- a measurement condition changes between runs;
- an explanation goes beyond the observed result.

## Completion evidence

- [ ] `plan.md` contains your API contract, predictions, scope, and stop
      conditions.
- [ ] The launcher reaches the new module without a 404.
- [ ] A still image produces a raw mask and one mask-driven effect.
- [ ] Threshold changes update the current output.
- [ ] Webcam start, stop, restart, and image switching work without stale
      state.
- [ ] Five fixed-condition benchmark runs are recorded.
- [ ] `results.md` contains observations and exact commits.
- [ ] `answer.md` traces one frame and explains one failure in your own words.
- [ ] You can demonstrate one small change without asking OpenCode to explain
      your code for you.
