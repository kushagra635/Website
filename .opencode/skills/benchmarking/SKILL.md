---
name: benchmarking
description: Load whenever a number describing speed is produced or compared - latency, runtime, FPS, throughput, "is it faster", "how long does it take", or any before-and-after claim. Use fixed conditions, repeated runs, distribution summaries, and a recorded setup.
metadata:
  upstream: performance-profiling
---

# Benchmarking

A performance result must be reproducible and large enough to distinguish from
run-to-run variation. The runner enforces the protocol; do not hand-time with a
stopwatch or a single `console.time()` call. The one exception is timing a
single function inside a notebook, where the runner cannot reach: warm up
first, loop the call, keep every per-repeat sample, and report median and
spread. The lesson template's checks cell shows the pattern.

## Measure

State the question, the metric, and its unit before running anything. Latency and
runtime are lower-is-better. FPS and throughput are higher-is-better. Never
compare two numbers in different units.

```bash
python .opencode/skills/benchmarking/scripts/run_bench.py --label image-resize --warmup 2 --runs 7 --metadata input=sample-800x600.jpg --out results/bench-before.json --quiet -- python scripts/resize.py sample.jpg
```

The command after `--` can be anything runnable; `node scripts/resize.js` is
measured the same way. Keep the invocation on one line so it pastes into both
bash and PowerShell, and use `python`, which resolves inside the `ac-cv`
environment on every platform.

The runner performs the warmups, times each measured run separately, and writes
median, p50, p95, p99, mean, and standard deviation alongside every raw sample.
It refuses to overwrite an existing artifact, so `before` and `after` cannot
collide.

Use at least five measured runs. Raise `--runs` when the samples are spread out.
Do not report the single fastest run.

## Compare

```bash
python .opencode/skills/benchmarking/scripts/compare_baseline.py --baseline results/bench-before.json --current results/bench-after.json --metric stats.p50_s --direction lower-is-better --noise-pct 3 --out results/compare.json
```

The comparison refuses to run when the label, command, metadata, or warmup and
run counts differ between the two artifacts. That refusal is the point: it means
a reported speedup came from the change and not from a quietly edited command.
When the difference is intentional — an input file was renamed, the command
legitimately changed — rerun both sides consistently if at all possible;
otherwise pass `--allow-contract-difference` with the reason, which is recorded
in the comparison artifact.

Report the result exactly as the tool returns it:

- `pass` — every metric is within noise.
- `mixed` — something moved beyond noise but stayed inside the allowed bound.
- `fail` — a metric exceeded the allowed regression bound.

A fourth state is yours to report, not the tool's: `blocked`, when the input,
environment, or correctness check could not be reproduced. A blocked run has no
number. Say that instead of estimating one.

A difference smaller than the same-condition spread is unresolved noise, not a
win.

## Time completed work, not started work

`run_bench.py` times whole commands, so it always measures completed work. A
timer you write by hand does not.

```js
// Bad: measures how long it took to *ask* for the image
const t0 = performance.now();
img.src = "hero.jpg";
const elapsed = performance.now() - t0;   // ~0 ms, always
```

```js
// Good: measures until the work is actually done
const t0 = performance.now();
await new Promise((resolve) => { img.onload = resolve; });
const elapsed = performance.now() - t0;
```

The same rule applies to `fetch` before the body is read, a canvas draw before
the next frame paints, and any `await` you forgot. A suspiciously small number
usually means the timer stopped before the work did.

## Check the output, not only the number

An optimization that changes what the user sees needs both gates. Look at the
before and after yourself; producing a screenshot is not the same as viewing it.
Cutting particle count or animation steps buys FPS by removing the thing being
measured, and only the visual check catches that.

If the number improves and the output looks worse, report both. Do not let one
gate cancel the other.

## Hold conditions fixed

Within one comparison, keep the machine, browser, Node or Python version, input
file, resolution, window size, and power state fixed. Change one variable at a
time. Close the other tabs and applications that compete for the machine.

Measure the core operation separately from end-to-end time when startup cost is
a material part of the total.

The runner records the command and environment keys. Use repository-relative
commands, and do not put a machine name, username, home path, credential, or
secret-bearing argument in the command or `--metadata`; the artifact is
committed. The recorded working directory is invocation-relative and the runner
rejects `--cwd` outside the directory where it was invoked.

## Complete when

- [ ] The metric, unit, and direction are stated.
- [ ] `run_bench.py` produced the artifact, with warmup and at least five runs.
- [ ] Median and p95 come from that artifact, not from a retyped number.
- [ ] `compare_baseline.py` ran on before-and-after artifacts and accepted the
      contract.
- [ ] Core and end-to-end timings are separate when startup cost matters.
- [ ] Every claimed change exceeds the measured run-to-run spread.
- [ ] Artifacts are saved with the project results.

## Boundary

The runner times a whole command. It does not attribute time to a function or
line. When the measurement shows a slow path but not a cause, profile the
dominant stage with the platform tool: Chrome DevTools for browser work,
`node --prof` for Node, `cProfile` for Python. Keep the timing API traceable
through `api-docs-first`, and never invent a missing measurement.
