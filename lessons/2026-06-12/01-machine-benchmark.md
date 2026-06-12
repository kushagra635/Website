# Lesson 1: Run the Machine Benchmark

**Trains:** Skill #5 - Defining "done" and proving it, and Skill #4 - Reading
code you did not write.

**Time estimate:** 45-60 minutes

## The problem

Computer vision demos can look impressive while hiding the important question:
can your actual machine run them smoothly in the browser?

Today you are not guessing. You are measuring.

## The exercise

Open:

```text
http://localhost:5174/mediapipe-lab/
```

Run all three demos:

1. Pose Estimation
2. Face Mesh
3. Gesture Recognition

For each demo, record the result in a file you create:

```text
lessons/2026-06-12/results.md
```

Use this table shape:

```markdown
| Demo | Browser | Model loaded? | Camera opened? | FPS after 10 sec | Notes |
| --- | --- | --- | --- | --- | --- |
| Pose Estimation |  |  |  |  |  |
| Face Mesh |  |  |  |  |  |
| Gesture Recognition |  |  |  |  |  |
```

## What to test

Test at least one browser. If you have time, compare two browsers.

Look for:

- whether the model loads without an error;
- whether the browser asks for camera permission;
- whether the overlay follows smoothly or lags;
- whether the FPS drops after a few seconds;
- whether the laptop gets hot or the fan ramps up;
- whether Safari and Chrome behave differently.

## Debug rules

- If a model fails to load, check the browser console and the Network tab.
- If the camera fails, confirm you are using `localhost`, not a `file://` URL.
- If FPS is bad, do not immediately delete features. First write down evidence.
- Do not let an agent make up benchmark numbers. The measurements must be real.

## Done when

- [ ] `lessons/2026-06-12/results.md` exists.
- [ ] All three demos have real results.
- [ ] You can name the slowest demo on your machine.
- [ ] You can explain one likely reason it is slower.
