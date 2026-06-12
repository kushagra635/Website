# Lesson 2: Pick One MediaPipe Build Project

**Trains:** Skill #1 - Scope control, Skill #2 - Separation of concerns, and
Skill #7 - Writing intent before code.

**Time estimate:** 2-3 hours

## Before coding

Create:

```text
lessons/2026-06-12/plan.md
```

Answer these before asking an agent to implement anything:

1. Which project am I choosing?
2. Which file or files in `mediapipe-lab/` will change?
3. What is the smallest version that would count as working?
4. How will I test it?
5. What should I avoid adding?

## Choose one project

### Option A: Performance Inspector

Add a small performance panel to one demo.

It should show:

- current FPS;
- lowest FPS seen during the run;
- model name;
- browser name;
- whether the camera is active.

Stretch goal: add a "Copy result" button that copies one Markdown table row for
`results.md`.

Good fit if you like measurement, debugging, and clean UI.

### Option B: Gesture Command Center

Use the hand or gesture recognition demo to control the page.

Examples:

- open palm changes the overlay color;
- thumbs up toggles a success state;
- closed fist pauses or resumes drawing;
- two hands on screen changes the mode.

The command must be visible in the UI. Do not make a hidden trick that only you
understand.

Good fit if you like interaction design.

### Option C: Face Mesh Overlay Studio

Improve the face mesh demo so the user can switch between visual presets.

Required:

- at least three named presets;
- visible controls;
- a short description of what each preset changes;
- no change to the model loading path.

Preset examples:

- clean contour;
- dense mesh;
- eyes and lips only;
- high contrast classroom mode.

Good fit if you like visual design and careful controls.

### Option D: Pose Coach

Use pose landmarks to detect one simple body position.

Examples:

- arms raised;
- leaning left or right;
- standing centered;
- squat depth approximation;
- shoulder level warning.

Keep it honest. If your detection is approximate, label it approximate.

Good fit if you like geometry and logic.

### Option E: Facial Expression Detector

Use the face mesh demo to detect visible facial expressions from landmark
geometry.

This is not mind-reading and not a true emotion model. Keep the label honest:
you are detecting face shapes like smiling, mouth open, eyebrows raised, or one
eye closed.

Required:

- detect at least three visible states;
- show the current state in the UI;
- show "uncertain" when no state is strong enough;
- explain which landmark distances or ratios you used;
- keep the original Face Landmarker model path unchanged.

Good first states:

- neutral;
- smiling;
- mouth open;
- eyebrows raised;
- wink or one eye closed.

Stretch goal: add a "Calibrate neutral face" button. Faces and cameras vary, so
calibration is a better engineering answer than pretending one threshold works
for everyone.

Good fit if you like geometry, human-computer interaction, and careful wording.

## Fast-finisher ideas

If your main project is working and tested, pitch one of these as a small
extension:

- **Reaction game:** the app calls out a pose or gesture, and you race to match
  it.
- **Face filter:** attach glasses, a mask, or labels to face landmarks.
- **Posture alert:** warn when shoulders are uneven or the face is too close to
  the camera.
- **Gesture slideshow:** use hand gestures to move between demo states or
  portfolio pages.
- **Nose cursor:** use the nose landmark as a pointer for a simple drawing pad.
- **Two-browser comparison:** record Chrome versus Safari FPS and explain the
  difference.
- **Accessibility mode:** add a high-contrast, large-text overlay for classroom
  projection.
- **Privacy mode:** add a toggle that hides the camera image but keeps landmark
  overlays visible.

## Constraints

- Work in `mediapipe-lab/`.
- Keep the demo usable on a laptop screen.
- Keep controls readable on mobile.
- Do not replace real MediaPipe output with fake data.
- Do not hide errors. If the camera or model fails, the UI should say so.
- Keep functions small enough that you can explain them.

## Done when

- [ ] `plan.md` exists before code changes.
- [ ] You built one option, not pieces of multiple options.
- [ ] The demo still loads from `localhost`.
- [ ] You tested with the camera on.
- [ ] You can point to the exact MediaPipe result data your feature uses.
