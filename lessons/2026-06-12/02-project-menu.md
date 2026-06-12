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

## Today's project tracks

Pick one of these four. If you finish early, add one stretch goal from your own
track before starting a second project.

### Track 1: Chrome vs Safari MediaPipe Shootout

Compare the same MediaPipe demos in Chrome and Safari.

Required:

- run Pose Estimation, Face Mesh, and Gesture Recognition in both browsers;
- record model load success, camera permission behavior, and FPS after 10
  seconds;
- write one short paragraph explaining which browser handled the demos better;
- include at least one screenshot or copied console/network note if something
  fails.

Stretch goal: add a tiny benchmark panel to one demo that can copy a Markdown
row for `results.md`.

Good fit if you like testing, performance, and evidence.

### Track 2: Facial Expression Detector

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

### Track 3: Pose Coach

Use pose landmarks to detect one simple body position.

Required:

- detect at least one pose state;
- show clear feedback in the UI;
- label approximate detections as approximate;
- explain which pose landmarks and thresholds you used.

Examples:

- arms raised;
- leaning left or right;
- standing centered;
- squat depth approximation;
- shoulder level warning.

Keep it honest. If your detection is approximate, label it approximate.

Good fit if you like geometry and logic.

### Track 4: Index Finger Target Game

Build a simple game in the hand or gesture demo: the app generates a point on
screen, and the player touches it with their index finger.

Required:

- draw one target point at a random position inside the video area;
- draw or highlight the detected index fingertip;
- count a hit when the fingertip is inside the target radius;
- move the target after each hit;
- show score and time remaining;
- do not use mouse clicks as the main input.

Implementation hint: MediaPipe hand landmarks use normalized coordinates. The
index fingertip is landmark `8`. You will need to convert `landmark.x` and
`landmark.y` into canvas pixel coordinates. If the video is mirrored, you may
need to use `1 - landmark.x` for the displayed x coordinate.

Stretch goals:

- make the target shrink after every hit;
- require the finger to stay on the target for 0.25 seconds;
- add a countdown and high score;
- add different target colors worth different points;
- add a "privacy mode" that hides the camera image but keeps the game overlay.

Good fit if you like games, coordinate systems, and immediate feedback.

## Extra ideas if a track is done

- **Face filter:** attach glasses, a mask, or labels to face landmarks.
- **Gesture slideshow:** use hand gestures to move between demo states or
  portfolio pages.
- **Nose cursor:** use the nose landmark as a pointer for a tiny drawing pad.
- **Accessibility mode:** add a high-contrast, large-text overlay for classroom
  projection.
- **Privacy mode:** hide the camera image but keep landmark overlays visible.

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
