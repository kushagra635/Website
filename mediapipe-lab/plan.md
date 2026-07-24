# Face Mesh Hot-Loop Allocation Reduction Plan

## Goal

Reduce per-frame heap allocations in the `renderLoop` hot path while preserving
the identical visual output: same face mesh, same smoothing behavior, same
color controls, same filters.

## Prediction

Eliminating ~2000+ temporary objects per frame should yield a measurable FPS
improvement (5–15 % on mid-range hardware) and significantly fewer GC pauses.
Inferences-per-second (IPS) should stay close to FPS since we aren't touching
the model execution path.

## Hot-loop allocations identified

### 1. `projectLandmark()` – new `{x, y}` per call (highest volume)

Called from `traceConnections`, `drawLandmarks`, `drawGlassesFilter`, and
`drawLabelFilter`. Every connection endpoint and every landmark point creates
a throwaway object. With the full-mesh tesselation (~300 connections) traced
twice (mesh + feature contour), plus oval, iris, label, and glasses paths,
this is roughly **1200–1500 allocations per frame** for a single face.

**Fix:** Inline `landmark.x * transform.width` / `landmark.y * transform.height`
directly in every draw site. No new function, no temporary objects.

### 2. `smoothFaceLandmarks()` – new Array + map objects per frame

Each frame creates a new `Array(468)` and 468 `{x, y, z}` objects via
`faceLandmarks.map(...)`. That's **~469 allocations per face per frame**.

**Fix:** Double-buffer pool. Maintain two arrays per face key
(`smoothingBuffers` Map). Each frame swaps the active buffer and mutates
entries in place. After the first frame, zero allocations.

### 3. `computeFrameTransform()` / `computeCoverTransform()` – objects per frame

Two small objects `{width, height, pixelRatio}` and
`{sourceWidth, ..., offsetY}` created every animation frame, even when the
canvas/video dimensions haven't changed.

**Fix:** Memoize with a dimension-signature key. Recompute only when the
relevant dimensions change.

### 4. `new Set()` in renderLoop

A Set is allocated every frame for deduplicating active face keys.

**Fix:** Reuse a module-level Set with `.clear()` each frame.

### 5. `landmarkToCanvas()` in `updateNoseDrawing()`

Creates `{x, y}` object for the nose tip cursor.

**Fix:** Inline projection math directly in `updateNoseDrawing()`.

## What is NOT changed

- `computeExpressionRatios` / `classifyExpression` — runs once per frame on
  face[0], not per landmark. Midpoint allocations are negligible.
- `getConnectionEndpoints` — always returns `{start, end}` but the connection
  structures are static; these are thin wrappers.
- Context2D operations (`beginPath`, `moveTo`, `lineTo`, `arc`, `fill`,
  `stroke`) — internal to the canvas subsystem, not JS heap.

## Expected net savings

| Source | Before (per frame) | After (per frame) |
|---|---|---|
| `projectLandmark` objects | ~1200–1500 | 0 |
| `smoothFaceLandmarks` array + objects | ~469 | 0 (after frame 1) |
| `computeFrameTransform` + `coverTransform` | 2 | 0 (when stable) |
| `new Set()` | 1 | 0 (reuse) |
| `landmarkToCanvas` object | 1 | 0 |
| **Total** | **~1700+ allocs** | **0** |

The MediaPipe `detectForVideo` call still returns new result objects; that
allocation is outside our control.

## Testing plan

1. Confirm the visual output is identical (mesh, landmarks, colors, filters,
   expression detection, nose drawing).
2. Run 5 x 10-second measurement windows before vs. after and record FPS and
   inference latency from the on-screen stats + benchmark panel.
3. Write the results to `results.md`.
