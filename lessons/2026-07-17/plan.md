# Plan — 2026-07-17

Complete this in your own words before creating the segmentation module. Load
`.opencode/skills/api-docs-first/SKILL.md` first. Your agent may review this and
ask questions, but it must not write the answers or implementation for you.

## API contract

- API and task:
- Local version or source:
- Primary documentation:
- Import or entry point:
- Constructor or factory:
- Call signature:
- Sync, async, callback, or event behavior:
- Result shape used by this feature:
- Lifecycle and cleanup:
- Errors, permissions, and capability fallback:
- Remaining uncertainty:

## Documentation trace

For every symbol below, record the primary documentation page or local
declaration that proves you can use it this way.

| Symbol, method, option, or result field | Source | What the source says |
| --- | --- | --- |
| Runtime/WASM loader | | |
| Segmenter factory | | |
| CPU delegate option | | |
| Still-image method | | |
| Video-frame method | | |
| Running-mode change, if needed | | |
| Confidence-mask result | | |
| Mask data access | | |
| Mask cleanup | | |
| Segmenter cleanup | | |
| Camera permission API | | |

## Module plan

- Files I will create:
- Input states:
- Processing stages, in order:
- Outputs shown to the user:
- Loading state:
- Ready state:
- Stopped state:
- Permission-denied state:
- Runtime-error state:
- How I will prevent overlapping inference calls:
- How I will stop the camera:
- How I will release MediaPipe results and resources:

## Test plan

- Fixed browser and version:
- Machine and operating system:
- Camera and requested resolution:
- Lighting, distance, and background:
- Warm-up period:
- Benchmark duration and number of runs:
- How median latency will be calculated:
- How p95 latency will be calculated:
- How effective inference FPS will be calculated:
- How foreground coverage will be calculated:

## Predictions

- Median inference latency:
- p95 inference latency:
- Effective inference FPS:
- Foreground coverage for the fixed scene:
- Failure case I expect to be worst:
- Why:

## Planning gate

Before asking the agent to write code, explain:

1. Which documented method handles a still image?
2. Which documented method handles a video frame, and what timestamp does it
   require?
3. What exact result data becomes the visible mask?
4. What must be closed or released?
5. How does the plan guarantee only one inference is active?

- [ ] I completed the API contract and documentation trace myself.
- [ ] I can answer all five questions without asking the agent to answer for me.
- [ ] The agent reviewed the plan and identified no unsupported API assumptions.

Implementation remains blocked while any box is unchecked.

