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

## Constraints

- Work in `mediapipe-lab/`.
- Keep the demo usable on a laptop screen.
- Keep controls readable on mobile.
- Do not replace real MediaPipe output with fake data.
- Do not hide errors. If the camera or model fails, the UI should say so.
- Keep functions small enough that you can explain them.

## Done when

- [ ] `plan.md` exists before code changes.
- [ ] You built one option, not pieces of four options.
- [ ] The demo still loads from `localhost`.
- [ ] You tested with the camera on.
- [ ] You can point to the exact MediaPipe result data your feature uses.
