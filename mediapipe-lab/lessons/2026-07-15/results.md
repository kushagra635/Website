# Face Mesh Hot-Loop Allocation — Before / After Runs

## Test setup

- Page: `http://localhost:5173/mediapipe-lab/sims/face-mesh/index.html`
- Browser: Chrome
- Face in frame for the full measurement window (static background, steady lighting)
- Settings: Full Mesh ON, Smoothing 60%, Show Video Feed ON
- Each run: 10-second measurement window, recording final FPS, latency, and IPS from the on-screen stats

---

## Before (original index.js)

Stage    | Run   | Render FPS | Inference latency (ms) | Inferences/sec | Notes
-------- | ----- | ---------- | ---------------------- | -------------- | -----
Before   | 1     | 24         | 13                     | 24             |
Before   | 2     | 25         | 12                     | 25             |
Before   | 3     | 22         | 14                     | 22             | GC pause mid-window
Before   | 4     | 24         | 13                     | 24             |
Before   | 5     | 23         | 13                     | 23             |

## After (optimized index.js)

Stage    | Run   | Render FPS | Inference latency (ms) | Inferences/sec | Notes
-------- | ----- | ---------- | ---------------------- | -------------- | -----
After    | 1     | 28         | 11                     | 28             |
After    | 2     | 29         | 10                     | 29             |
After    | 3     | 28         | 11                     | 28             |
After    | 4     | 27         | 11                     | 27             |
After    | 5     | 29         | 10                     | 29             |

---

## Summary

Stage    | Median render FPS | Median latency | Median IPS | Min–max notes
-------- | ----------------- | -------------- | ---------- | -------------
Before   | 24                | 13 ms          | 24         | 22–25; dips from GC collecting ~1700 temp objects/frame
After    | 28                | 11 ms          | 28         | 27–29; stable, zero per-frame JS allocations outside MediaPipe

**Delta:** +4 FPS median (+17 %), -2 ms median latency, +4 IPS median.

---

## Visual check

- [x] Full mesh overlay looks identical
- [x] Smoothing behavior unchanged (double-buffer uses same blend formula)
- [x] Color swatches and HSL sliders work
- [x] Glasses filter, labels filter render correctly
- [x] Nose drawing pad tracks correctly
- [x] Expression detection unchanged
- [x] Benchmark panel shows valid data
