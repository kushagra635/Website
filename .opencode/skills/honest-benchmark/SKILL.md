---
name: honest-benchmark
description: Load whenever latency, throughput, FPS, runtime, or a before-and-after performance claim is measured or reported. Use fixed conditions, repeated runs, distribution summaries, and a recorded setup.
---

# Honest Benchmark

A performance result must be reproducible and large enough to distinguish from
run-to-run variation.

## Protocol

1. Warm up for at least 10 seconds or until timings stabilize.
2. Use a fixed measurement window, normally 10 seconds.
3. Run each condition at least three times; five is preferable.
4. Report the median and p95. Keep startup cost separate when it matters.
5. Measure the core operation separately from end-to-end task time.
6. Hold machine, software version, input, resolution, lighting, and power state
   fixed within a comparison.
7. Change one variable at a time.
8. Record the complete setup and every run.
9. Compare the observed difference with same-condition spread. Treat a smaller
   difference as unresolved noise.
10. Save the raw table and summary with the project artifacts.

Instrumentation may be implemented, reviewed, or debugged as requested. Keep
the timing API traceable through `api-docs-first`, and never invent a missing
measurement.

## Complete when

- [ ] Warm-up precedes recorded runs.
- [ ] Each condition has at least three fixed-window runs.
- [ ] Median and p95 are reported.
- [ ] Core and end-to-end timings are separate.
- [ ] Setup and raw runs are recorded.
- [ ] Every claimed change exceeds measured run-to-run variation.
