# Lessons: MediaPipe Project Day

Date: June 12, 2026

The three repositories use the same `mediapipe-lab/` inputs, models, and browser
APIs. Measure the local result, then make one bounded improvement.

Work through these in order:

1. [Run the machine benchmark](01-machine-benchmark.md)
2. [Pick one MediaPipe build project](02-project-menu.md)
3. [Demo, score, and explain it](03-demo-rubric.md)

Constraints:

- Start a local server from the repo root. Do not open the HTML files directly.
- Record the intended change in `lessons/2026-06-12/plan.md`.
- Record executed measurements in `lessons/2026-06-12/results.md`; never invent
  performance numbers.
- Keep code changes inside `mediapipe-lab/` unless the recorded scope includes
  site navigation.
- One commit for the benchmark notes, one commit for each meaningful code step.
- The final walkthrough covers the model file, landmark output, camera flow,
  and animation-frame behavior.

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
