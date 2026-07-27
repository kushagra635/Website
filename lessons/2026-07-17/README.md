# July 17 — CPU Person Segmentation

Build a person-segmentation module from a blank implementation. Use the local
MediaPipe runtime and model, run inference on the CPU, and prove how well it
works with measurements and failure tests.

The core workflow is to record the intended behavior, verify the API contract,
implement a bounded path, and test both performance and failure behavior.

## Constraints

- Load `.opencode/skills/api-docs-first/SKILL.md` before planning the code.
- Record the API contract and implementation plan in `plan.md`.
- Do not copy an existing segmentation implementation.
- Use the checked-in MediaPipe files. Do not add a CDN or another library.
- Use the CPU delegate. Do not request GPU acceleration.
- Use scoped commits whose diffs each represent one logical decision.

## Provided files

- Runtime module:
  `mediapipe-lab/vendor/mediapipe/tasks-vision/vision_bundle.mjs`
- WASM directory:
  `mediapipe-lab/vendor/mediapipe/tasks-vision/wasm/`
- Segmentation model:
  `mediapipe-lab/vendor/mediapipe/models/selfie_segmenter.tflite`

You still need to verify the runtime source or version, exported symbols,
method signatures, result shape, and cleanup behavior from local declarations
and primary MediaPipe documentation.

## Work in this order

1. Load `api-docs-first`, inspect the local files, read primary documentation,
   and complete the API contract in `plan.md`.
2. Plan the module's data flow, files, UI states, measurements, and likely
   failure cases.
3. Create `mediapipe-lab/sims/person-segmentation/` with an empty HTML, CSS,
   and JavaScript module. Build only the interface and status states.
4. Load the local MediaPipe runtime and model on the CPU. Show loading, ready,
   and error states.
5. Accept one uploaded image and run one segmentation request.
6. Display the raw mask and add a threshold control.
7. Use the mask for one effect: background blur, replacement, or transparency.
8. Add webcam input and handle permission denial or a missing camera.
9. First run the loop naively — request segmentation for every frame — for 30
    seconds and record what happens to responsiveness and latency in
    `results.md`. Then enforce the mechanism from your plan so overlapping
    inference is impossible, and release the camera and MediaPipe resources
    when stopped. Record why the mechanism prevents overlap.
10. Load `honest-benchmark`, warm up the module, then run the five fixed
    10-second CPU tests in `results.md`.
11. Test low light, fast movement, multiple people, a partly cropped person,
    and a busy background.
12. Explain the pipeline, its limits, and one justified next change in
    `answer.md`.
13. Review the recorded evidence and make the final scoped commit.

## Checkpoints

Use the still-image result to validate the API and mask before adding webcam
state. Record each checkpoint:

1. API contract traced to source
2. Runtime and model ready on CPU
3. One still image segmented
4. Raw mask visible
5. Visual effect driven by the mask
6. Webcam loop stable and stoppable
7. Measurements and failure tests recorded
8. Final walkthrough completed

## Done when

- The module works from a local server without a CDN.
- The still-image and webcam paths both work.
- The raw mask and one mask-based visual effect are visible.
- Loading, permission-denied, no-camera, stopped, and runtime-error states are
  handled.
- The loop never starts overlapping inference calls.
- `plan.md` contains the API contract and prediction.
- `results.md` contains five runs, the naive-loop observation, and failure tests.
- `answer.md` contains the pipeline explanation and limitations.
- Commits are scoped to reviewable decisions.
- The walkthrough traces a live frame, identifies the CPU delegate, explains
  one confidence value, and demonstrates one small verified change.

## Overdrive (optional, after everything above is done)

Only with evidence — same benchmark protocol, recorded in `results.md`:

- Move inference into a worker. Measure what it does to end-to-end latency and
  UI responsiveness, before and after.
- The vendored `wasm/` directory ships a SIMD and a no-SIMD engine. Force the
  no-SIMD fallback and quantify what SIMD is worth on your machine.
