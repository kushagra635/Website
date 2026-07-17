---
name: honest-benchmark
description: Load whenever performance is measured, reported, or compared - FPS, latency, throughput, benchmark runs, or any before/after claim about speed or efficiency. Enforces the class measurement protocol so numbers are evidence, not anecdotes. The agent guides protocol and reviews results; the student writes the instrumentation code.
---

# Honest Benchmark

A number seen once is an anecdote. This skill exists so every performance claim
in this class is produced the same way, on a recorded setup, and survives being
run again. When a student asks anything about measuring speed, this protocol is
the answer.

## The protocol

1. **Warm up first.** Run the system for at least 10 seconds (or until timings
   stop falling) before recording anything. First-run numbers mix startup cost
   into steady-state performance; measure them separately if startup matters.
2. **Fixed window.** Measure over a fixed window - 10 seconds unless the lesson
   says otherwise. No "it felt like about a second each."
3. **At least three runs per condition.** One run is chance; three is a floor,
   five is better.
4. **Report median and p95. Never the best run.** The median is the headline;
   p95 is the honesty check. If only one number fits, it is the median.
5. **Two clocks, kept separate.** Time the core operation (inference, query,
   render) separately from end-to-end frame or task time. Conflating them hides
   where the time actually goes.
6. **Fixed conditions within a comparison.** Same machine, browser, camera,
   resolution, lighting, and power source (a laptop on battery throttles).
   Change one thing at a time; a before/after with two changes proves nothing.
7. **Record the setup.** Machine, OS, browser and version, camera and
   resolution, lighting, power. Results without a recorded setup cannot be
   compared - not with the reference, not with classmates, not with next week.
8. **Compare differences against noise.** If the before/after difference is
   smaller than the spread between same-condition runs, call it noise. If a
   change was noise or made things worse, say so and revert it.
9. **Write results into the lesson's `results.md` format** - full run tables,
   then the summary - not into chat.

## The agent's role

- Explain the protocol and the concepts (what a percentile is, where a
  timestamp belongs, what `performance.now()` measures, why the display rate
  caps a render loop).
- Review the student's numbers: check the math, check the protocol was
  followed, name what a result does and does not support.
- Do **not** write the instrumentation code, the benchmark harness, or the
  timing logic into the student's app. The student types it; `api-docs-first`
  applies to any timing API they use.

## Violations to name out loud

Call these by name when you see them, then point back to the protocol:

- **Cold numbers** - benchmarking before warm-up.
- **Single-run science** - one measurement presented as the result.
- **Best-run reporting** - quoting the fastest run instead of the median.
- **Moving-target comparison** - conditions changed between before and after.
- **Cross-machine comparison** - two different computers treated as comparable.
- **Mixed clocks** - core-operation time and end-to-end time conflated.
- **Ghost setup** - results with no recorded machine, browser, or conditions.
- **Noise claimed as signal** - a difference smaller than run-to-run spread
  presented as an improvement.

## Hard Limits

- Never help present a number the protocol would reject; fix the measurement,
  not the wording.
- Never fill in the results tables, plan predictions, or journal reflections
  for the student.
- Never invent or estimate numbers for a run that was not actually performed.
- If the protocol cannot be followed (no camera, no time, broken build), record
  that no valid measurement exists rather than substituting a guess.

## Done When

- [ ] Warm-up happened before any recorded run.
- [ ] Each reported condition has at least three fixed-window runs.
- [ ] Median and p95 are reported; the best run is not the headline.
- [ ] Core-operation and end-to-end timings are separate.
- [ ] The full setup is recorded alongside the results.
- [ ] Every claimed improvement is larger than the run-to-run spread.
- [ ] The results live in `results.md`, written by the student.
