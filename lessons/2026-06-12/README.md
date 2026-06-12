# Lessons: MediaPipe Project Day

Date: June 12, 2026

Today is a build day. Everyone has the same `mediapipe-lab/` folder, so the
comparison is fair: same demos, same models, same browser APIs. Your job is to
measure how it runs on your machine, then make one small, real improvement that
you can explain.

Work through these in order:

1. [Run the machine benchmark](01-machine-benchmark.md)
2. [Pick one MediaPipe build project](02-project-menu.md)
3. [Demo, score, and explain it](03-demo-rubric.md)

Rules of engagement:

- Start a local server from the repo root. Do not open the HTML files directly.
- Create `lessons/2026-06-12/plan.md` yourself before asking an agent to code.
- Create `lessons/2026-06-12/results.md` yourself after testing. Do not let an
  agent invent performance numbers.
- Keep your code changes inside `mediapipe-lab/` unless the instructor approves
  a site navigation change.
- One commit for the benchmark notes, one commit for each meaningful code step.
- You must be able to explain the MediaPipe task you changed: model file,
  landmark output, camera flow, and what happens every animation frame.

## Local server

From the repo root:

```bash
python3 -m http.server 5174
```

Then open:

```text
http://localhost:5174/mediapipe-lab/
```

If that port is busy, use another one:

```bash
python3 -m http.server 5180
```

## End of day deliverables

- `lessons/2026-06-12/plan.md` in your own words.
- `lessons/2026-06-12/results.md` with real test results.
- One working MediaPipe feature or improvement.
- A 90 second live demo.
- A short answer to: "What did I change, and how do I know it works?"
