# Lessons

This sequence reduces duplication, moves presentation into the shared
stylesheet, and records the resulting architecture.

Work through them in order:

1. [Extract the duplicated JavaScript](01-extract-shared-js.md)
2. [Move inline styles into the stylesheet](02-inline-styles-and-a11y.md)
3. [Explain it back](03-explain-it-back.md)

Constraints:

- Keep behavioral changes outside this refactor sequence.
- Record the plan and update it when the evidence changes.
- One commit per logical step, not one giant commit per lesson. It's fine — good, even — to have commits like "fix: theme toggle broke after extraction."
- After lessons 1 and 2, the site must look and behave **exactly the same** in the browser.
