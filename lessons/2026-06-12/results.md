# Machine Check Results — 2026-06-12

Use the benchmark panel in any MediaPipe demo to copy a Markdown row, then paste it into the table below.

## How to record a row

1. Open a demo (Pose Estimation, Face Mesh, or Gesture Recognition).
2. Wait for the model to load.
3. Enable the camera and grant/deny permission as needed.
4. Open the **Benchmark** panel and click **Copy Markdown row**.
5. Paste the row into the table below under the matching demo section.

## Results Table

| Demo | Date | Model Load | Load Time (ms) | Camera Permission | Camera Start | Avg FPS | Face/Hand Count | Notes |
|------|------|------------|----------------|-------------------|--------------|---------|-----------------|-------|
| Face Mesh (Chrome) | 2026-06-12 | Success | <1000 | granted | Success | 21-26 | 1 | Stable, single face tracked |
| Face Mesh (Opera GX) | 2026-06-12 | Success | <1000 | granted | Success | 21-28 | 1 | Similar range to Chrome |
| Pose Estimation | 2026-06-12 | — | — | — | — | — | — | — |
| Gesture Recognition | 2026-06-12 | — | — | — | — | — | — | — |

## Observations

- Both Chrome and Opera GX run the Face Mesh demo at roughly 21-28 FPS.
- Model load time is under one second on both browsers.
- Face count consistently reads 1 during testing.

