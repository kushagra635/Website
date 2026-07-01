# Lessons: Optimize the Pipeline (Computer Vision + Performance)

Date: June 16, 2026

**Catch-up note — read this first.** The June 12 MediaPipe project day isn't in
your repo yet: there's no `lessons/2026-06-12/plan.md` or `results.md`, and your
last journal is June 10. Before you can optimize anything, you need something to
optimize. Do this first, compressed:

1. Run the three demos with the camera on and fill in the machine benchmark
   (`lessons/2026-06-12/results.md`) with real numbers — see
   `lessons/2026-06-12/01-machine-benchmark.md`.
2. Ship the **smallest** feature from the June 12 menu
   (`lessons/2026-06-12/02-project-menu.md`). Recommended: the index-finger
   target-game MVP (Track 4) or a single face/pose state — whatever you can finish
   in one sitting. Write `lessons/2026-06-12/plan.md` first.

Once you have one working feature with fresh baseline numbers, the optimization
day below is the same as everyone else's.

This is a measure → change → measure day. Same demo, same machine, honest
before-and-after.

Work through these in order:

1. [Measure the baseline](01-measure-the-baseline.md)
2. [Pick your optimizations](02-optimization-menu.md)
3. [Prove it and explain](03-prove-and-explain.md)

## Recommended once you've built a feature

- **Track A — decouple detection from drawing.** The biggest, most general FPS
  win.
- **Track C — smooth the landmarks** so your feature stops jittering.
- Stretch: **Track B** (GPU vs CPU delegate) — measure the latency delta.

If you genuinely run out of time to build a feature, you can still do the
optimization lesson on an unmodified demo: add the inference-latency instrument
(Lesson 1), then try Track A and Track B on Face Mesh and measure. That keeps you
in sync with the class even on a catch-up day.

Rules of engagement:

- Start a local server from the repo root; do not open the HTML directly.
- Create `lessons/2026-06-16/plan.md` before asking an agent to code.
- Create `lessons/2026-06-16/results.md` after testing. Real numbers only — do not
  let an agent invent performance numbers.
- One commit per logical step, with the measurement in the message.
- For each change you must be able to say which line it touched and why it costs
  less.

## Local server

From the repo root:

```bash
python3 -m http.server 5174
```

Then open:

```text
http://localhost:5174/mediapipe-lab/
```

## End of day deliverables

- The June 12 catch-up: `lessons/2026-06-12/plan.md` + `results.md` + one working
  feature.
- `lessons/2026-06-16/plan.md` with predictions written before measuring.
- `lessons/2026-06-16/results.md` with Baseline and After rows.
- At least two optimizations applied and measured separately (or the
  unmodified-demo fallback above).
- A 90-second demo: before number, the change, after number, the trade.
