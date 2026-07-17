# Results — 2026-07-17

Record evidence as each checkpoint is completed. Do not invent or estimate
measurements. If something does not work, record that result and the error.

## Checkpoint evidence

| Checkpoint | Evidence | What I can explain | Commit |
| --- | --- | --- | --- |
| Runtime and model ready on CPU | | | |
| One still image segmented | | | |
| Raw mask visible | | | |
| Visual effect driven by mask | | | |
| Webcam loop stable | | | |
| Camera and resources stop cleanly | | | |

## Fixed benchmark setup

- Browser and version:
- Machine and operating system:
- Camera and resolution:
- Lighting, distance, and background:
- Threshold:
- Visual effect enabled:
- Warm-up completed:

Warm up for 10 seconds. Then run the same scene for 10 seconds five times.
Keep every run, including bad ones.

| Run | Inferences | Median latency (ms) | p95 latency (ms) | Effective inference FPS | Foreground coverage (%) | Notes |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

## Benchmark summary

- Median latency across all recorded samples:
- p95 latency across all recorded samples:
- Effective inference FPS across all runs:
- Foreground-coverage range:
- What happened during the naive every-frame loop, before my mechanism:
- Were any inference calls overlapping? How did I verify this?

## Failure tests

| Test | What I changed | What happened to the mask | Latency or stability change | Pass, partial, or fail |
| --- | --- | --- | --- | --- |
| Low light | | | | |
| Fast movement | | | | |
| More than one person | | | | |
| Person partly outside the frame | | | | |
| Busy background | | | | |
| Camera permission denied | | | | |
| Camera stopped and restarted | | | | |

## Explanation

The written explanation lives in `answer.md`. Nothing here is complete until
that file is.

## Final evidence

- Module path:
- Commit hash:
- Journal completed:
- Result I would demonstrate:
- Limitation I would state during the demonstration:

