# MediaPipe Demos

Three browser-based demos powered by MediaPipe: pose estimation, face mesh,
and gesture recognition. All models, WASM files, and documentation are bundled
locally — no CDN dependency.

## What is included

- `index.html`: launch page for the demos.
- `sims/pose-estimation/`: full body pose tracking demo.
- `sims/face-mesh/`: face landmark mesh demo.
- `sims/gesture-recognition/`: hand landmark and gesture recognition demo.
- `sims/camera-preferences.js`: shared camera selection persistence helper.
- `vendor/mediapipe/`: vendored MediaPipe Tasks Vision bundle, WASM files,
  local model files, and documentation.

## How to run

Start a local server from the repository root:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173/mediapipe-lab/
```

The camera APIs require a secure browser context. `localhost` is allowed by
modern browsers, but opening `index.html` directly from the file system will
usually break module loading, WASM loading, or camera permissions.

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
