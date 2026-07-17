# Answer — 2026-07-17

Write every answer yourself, in your own words, anchored to your own code
(file and line). The agent may review what you wrote and ask questions; it may
not write or rewrite these answers.

## Pipeline explanation

1. Trace one webcam frame from the video element to the displayed output,
   naming each of your functions it passes through.
2. What does one value in the confidence mask mean? What visibly changes when
   the threshold moves from 0.3 to 0.5 to 0.7?
3. Where exactly does your code select the CPU delegate? (file and line)
4. What happened when the loop ran naively, and why does your mechanism make
   overlapping inference impossible?
5. Where is CPU time spent, based on your measurements rather than a guess?
6. Where did the mask fail most clearly, and what is the mechanism — not
   "low light is hard" but *why* it is hard for this model?
7. Which cleanup step prevents the camera or MediaPipe resources from staying
   active?
8. What is one next change supported by the results? What evidence supports it?

## Defense preparation

Before the demo, run a `defense-drill` on this implementation and record the
scorecard in your journal. At the demo you will, without the agent:

- trace one live frame through your own code,
- point to the line where CPU execution is selected,
- explain what a confidence value of 0.62 means and why your threshold is
  where it is,
- explain the mechanism that prevents overlapping inference,
- make one small live change the instructor picks.

## Honesty log

- Level of agent help I actually used (documentation lookup, error
  explanation, plan review — be specific):
- Anything in my module I could not fully explain during the drill:
