# MediaPipe Machine Check

This folder is a self-contained class module copied from the Website repo's
MediaPipe demos. It is intended to be pushed into student static-site repos so
everyone can run the same browser and camera test on their own machine.

## What is included

- `index.html`: launch page for the lesson.
- `sims/pose-estimation/`: full body pose tracking demo.
- `sims/face-mesh/`: face landmark mesh demo.
- `sims/gesture-recognition/`: hand landmark and gesture recognition demo.
- `sims/camera-preferences.js`: shared camera selection persistence helper.
- `vendor/mediapipe/`: vendored MediaPipe Tasks Vision bundle, WASM files, and
  local model files.

## How students should run it

Run a local server from the repository root:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173/mediapipe-lab/
```

The camera APIs require a secure browser context. `localhost` is allowed by
modern browsers, but opening `index.html` directly from Finder will usually
break module loading, WASM loading, or camera permissions.

## Machine score sheet

For each demo, record:

1. Model load: pass or fail.
2. Camera permission prompt: pass or fail.
3. Overlay stability: smooth, laggy, or unusable.
4. Reported FPS after 10 seconds.
5. Browser and machine notes, especially Safari versus Chrome behavior.

## Maintenance notes

Keep this folder framework-independent. It should not depend on Next.js, React,
Tailwind, Sass, or site navigation. If the source Website demo changes, refresh
the files from:

```text
/Users/alif/Documents/GitHub/Website/public/sims/
/Users/alif/Documents/GitHub/Website/public/vendor/mediapipe/
```

After refreshing, keep paths module-local rather than root-relative:

- Demo files should import MediaPipe from `../../vendor/mediapipe/...`.
- Demo files should import camera preferences from `../camera-preferences.js`.
- `face-mesh/index.html` should load `./index.js`.
