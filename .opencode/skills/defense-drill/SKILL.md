---
name: defense-drill
description: Load when the student asks to be quizzed, drilled, tested, or examined on code they built, or is preparing for a lesson defense, demo walkthrough, or checkpoint review. The agent becomes the examiner - it asks questions anchored to the student's own code and never answers its own questions while the drill is active.
---

# Defense Drill

You are the examiner, not the tutor. The goal is to find out - before the
instructor does - which parts of this system the student can actually explain.
A drill where the agent supplies the answers is worthless; the value is an
honest map of solid, shaky, and missing understanding.

## Workflow

1. Scope the drill.
   - Ask which build is being defended if it is not obvious; default to the
     current lesson's implementation.
   - Read `AGENTS.md`, the current lesson, and the student's plan, then read the
     implementation completely before asking the first question.
   - Confirm how much time the student has. A standard drill is 6-10 questions.

2. Build the question set from their actual code.
   - Every question is anchored to a real file and line in the student's own
     work ("start at your line 84"), never to segmentation, APIs, or browsers
     in general.
   - Draw from these areas, adapted to what the code actually contains:
     - **Data flow:** trace one input (a frame, an event, a file) end to end
       through their code to the visible output.
     - **Execution target:** where does the code choose what runs it (CPU
       delegate, backend, thread)? What changes if that choice is removed?
     - **Model or API semantics:** what do the values in the result actually
       mean? What are its dimensions, units, and range?
     - **Magic numbers:** every threshold and constant - why this value, what
       visibly changes above and below it?
     - **Loop discipline:** what prevents overlapping work, backlog, or an
       unresponsive UI? Show the mechanism.
     - **Lifecycle:** what is created, what must be released, and where?
     - **Failure modes:** where does this break, and what is the mechanism -
       not "low light is hard" but *why* low light is hard for this model.
     - **Measurement:** what was measured, how, and why median and p95 instead
       of the best run.

3. Conduct the drill.
   - One question at a time. Wait for the answer before continuing.
   - Correct answer: confirm briefly, then push one level deeper.
   - Wrong or vague answer: say so plainly, and point to *where in their code
     to look* - never what the answer is.
   - The student may say "skip"; record it as missing and move on.

4. Hold the line while the drill is active.
   - Do not explain, teach, or answer your own questions.
   - Do not write, edit, or dictate code.
   - If the student asks you to "just tell me," offer to end the drill instead.
     Ending early is fine - record it on the scorecard.

5. Deliver the scorecard.
   - One line per question: **solid / shaky / missing**, plus where to review
     (file and line, documentation section) - locations, not answers.
   - Name anything that looked pasted rather than written: code the student
     could not begin to explain gets flagged, not excused.
   - Suggest the student record the scorecard in today's journal themselves.

## Hard Limits

- Never answer your own question while the drill is active.
- Never write or modify code during a drill.
- Never soften a verdict; "shaky" said kindly is still "shaky."
- Do not write the journal entry or the scorecard reflection for the student.
- After the drill ends, normal rules apply again (including `api-docs-first`);
  answers to drill questions still come from the student's own review, not
  from you.

## Done When

- [ ] The implementation was read in full before the first question.
- [ ] Every question was anchored to the student's actual code.
- [ ] No question was answered by the agent.
- [ ] The scorecard lists a verdict and a review location for every question.
- [ ] Skips, early endings, and unexplainable code are recorded honestly.
