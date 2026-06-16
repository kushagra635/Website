# Lesson 3: Prove It Got Faster, Then Explain Why

**Trains:** Skill #5 — Defining "done" and proving it, Skill #4 — Reading code
you didn't write.

**Time estimate:** 45 minutes

An optimization you cannot measure is a story, not a result. Close the loop.

## Fill in the after numbers

Re-run with the camera on for 10 seconds — same browser and machine as your
baseline. Add the **after** row to `lessons/2026-06-16/results.md`:

| Stage | Render FPS | Inference latency (ms) | Inferences/sec | Notes |
| --- | --- | --- | --- | --- |
| Baseline | … | … | … | … |
| After (track: ___) | | | | what changed |

Then write two or three honest sentences:

- What did you change, and which of the three numbers moved?
- Did anything get *worse* — accuracy, jitter, a state that no longer detects?
  Optimization is a trade. Name the trade.
- If a change did nothing, say so. "No measurable difference" is a real and
  useful result.

## Explain the mechanism (this is the real test)

In `results.md`, answer in your own words — no agent:

1. Which line did your change touch, and what does that line do every frame?
2. *Why* does the change cost less? Fewer model runs? Smaller input? A different
   hardware path? Less work drawn per frame?
3. If a classmate said "just make it faster," what would you tell them to measure
   first?

## 90-second demo

Show the before number, make the change visible (or toggle it), show the after
number, say the trade in one sentence.

## Done when

- [ ] `results.md` has Baseline and After rows with real numbers.
- [ ] You named at least one trade-off, even if small.
- [ ] You can explain why the change is cheaper, not just that it is.
