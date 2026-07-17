# July 17 — CPU Person Segmentation

Build a person-segmentation module from a blank implementation. Use the local
MediaPipe runtime and model, run inference on the CPU, and prove how well it
works with measurements and failure tests.

The primary judgment skill is **7. Writing intent before code**. Ask: **did I
decide what I want, or did the agent decide for me?** This lesson also uses
skills 4, 5, and 9: explain the code, prove it works, and test what the agent
would otherwise skip.

## Rules

- Write your own plan and explanations. The agent may ask questions and point
  to documentation, but it may not fill in your answers.
- Load `.opencode/skills/api-docs-first/SKILL.md` before planning the code.
- Do not write implementation code until the planning gate in `plan.md` is
  complete and reviewed.
- Do not copy an existing segmentation implementation.
- Use the checked-in MediaPipe files. Do not add a CDN or another library.
- Use the CPU delegate. Do not request GPU acceleration.
- Commit at every checkpoint with `safe-commit`. Each gate ends in a scoped
  commit; one giant final commit is a failed gate.

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

1. Create today's journal entry and write your goals.
2. Load `api-docs-first`, inspect the local files, read primary documentation,
   and complete the API contract in `plan.md`.
3. Plan the module's data flow, files, UI states, measurements, and likely
   failure cases. Stop for the planning gate.
4. Create `mediapipe-lab/sims/person-segmentation/` with an empty HTML, CSS,
   and JavaScript module. Build only the interface and status states.
5. Load the local MediaPipe runtime and model on the CPU. Show loading, ready,
   and error states.
6. Accept one uploaded image and run one segmentation request.
7. Display the raw mask and add a threshold control.
8. Use the mask for one effect: background blur, replacement, or transparency.
9. Add webcam input and handle permission denial or a missing camera.
10. First run the loop naively — request segmentation for every frame — for 30
    seconds and record what happens to responsiveness and latency in
    `results.md`. Then enforce the mechanism from your plan so overlapping
    inference is impossible, and release the camera and MediaPipe resources
    when stopped. Be ready to defend why your mechanism works.
11. Load `honest-benchmark`, warm up the module, then run the five fixed
    10-second CPU tests in `results.md`.
12. Test low light, fast movement, multiple people, a partly cropped person,
    and a busy background.
13. Explain the pipeline, its limits, and one justified next change in
    `answer.md`, then run a `defense-drill` on your implementation and record
    the scorecard in your journal.
14. Finish `results.md` and `answer.md`, finish the journal, and make the
    final scoped commit.

## Checkpoints

Do not jump to the webcam before the still-image path works. At each checkpoint,
show the result and explain the relevant method and returned data before moving
on:

1. API contract approved
2. Runtime and model ready on CPU
3. One still image segmented
4. Raw mask visible
5. Visual effect driven by the mask
6. Webcam loop stable and stoppable
7. Measurements and failure tests recorded
8. Defense drill survived

## Done when

- The module works from a local server without a CDN.
- The still-image and webcam paths both work.
- The raw mask and one mask-based visual effect are visible.
- Loading, permission-denied, no-camera, stopped, and runtime-error states are
  handled.
- The loop never starts overlapping inference calls.
- `plan.md` contains the student's API contract and prediction.
- `results.md` contains five runs, the naive-loop observation, and failure tests.
- `answer.md` contains the student's explanation and defense answers.
- Every checkpoint has its own commit.
- At the demo the student traces a live frame, points to the line selecting the
  CPU delegate, explains what one confidence value means, and makes one small
  change the instructor picks — without the agent.

## Overdrive (optional, after everything above is done)

Only with evidence — same benchmark protocol, recorded in `results.md`:

- Move inference into a worker. Measure what it does to end-to-end latency and
  UI responsiveness, before and after.
- The vendored `wasm/` directory ships a SIMD and a no-SIMD engine. Force the
  no-SIMD fallback and quantify what SIMD is worth on your machine.

