# Lessons

The site looks great — the design system is cohesive and you clearly understand how to work within it. But most of that architecture arrived in one big generated chunk, which means you've practiced *customizing* code more than *building and owning* it. These lessons close that gap.

The theme: **the LLM wrote it, now you own it.** Owning code means you can find the duplication, explain every line, and change it without fear.

Work through them in order:

1. [Extract the duplicated JavaScript](01-extract-shared-js.md)
2. [Move inline styles into the stylesheet](02-inline-styles-and-a11y.md)
3. [Explain it back](03-explain-it-back.md)

Rules of engagement:

- **No new features until these are done.**
- You can use the LLM to help, but for each lesson, *you* write the plan first and explain it before generating any code.
- One commit per logical step, not one giant commit per lesson. It's fine — good, even — to have commits like "fix: theme toggle broke after extraction."
- After lessons 1 and 2, the site must look and behave **exactly the same** in the browser.
