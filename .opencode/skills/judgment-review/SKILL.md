---
name: judgment-review
description: Review code, a diff, a file, or generated output against the class standards. Use when the student asks for a review, finishes a lesson, or before committing — or whenever generated code should be checked against the nine judgment skills.
---

# Judgment Review

Review the target (a diff, file, folder, or the whole repo) against the three class standards, in this order:

1. **`lessons/CURRICULUM.md`** — run the nine questions. Especially: does anything live in the wrong place (#1)? Is anything duplicated (#2)? What should be deleted (#3)? What did the generator NOT do — accessibility, error states, alt text (#9)?
2. **`lessons/FILES.md`** — does each file match its anatomy? One `<h1>`, semantic landmarks, CSS tokens at top with no stray hex codes mid-file, JS one-job-per-file with init at the bottom, no magic numbers.
3. **`lessons/STRUCTURE.md`** — is every file in the right folder? Anything at root that didn't earn it? Naming lowercase-hyphenated?

## How to report

- **Findings as questions first.** For each finding, ask the student the relevant skill's question about that specific spot ("this hex code is mid-file — does it belong here?"). Let them answer before you explain.
- Order findings by importance, not by file order. Three real findings beat ten nitpicks.
- If the student asks you to just fix everything: fix only after they've stated, for each finding, what's wrong and why. The review is the lesson; the fix is the afterthought.
- End with one thing done *well*, specifically — they should learn what good looks like, too.
