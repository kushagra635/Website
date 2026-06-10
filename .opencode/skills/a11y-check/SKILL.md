---
name: a11y-check
description: Run the class accessibility pass on a page or the whole site. Use when a feature is finished, before deploying, or when the student asks "is this accessible?" — and proactively when reviewing generated UI code.
---

# Accessibility Check

This is Skill #9 from `lessons/CURRICULUM.md` — the quality AI skips. Nothing here sparkles in a screenshot, which is exactly why it gets checked deliberately.

## What the agent checks (report findings as questions, Socratically)

1. **Images** — every `<img>` has `alt`. Meaningful images describe; decorative images get `alt=""` (present but empty).
2. **Headings** — exactly one `<h1>` per page; levels descend without skipping.
3. **Landmarks** — content lives in `<header>/<nav>/<main>/<footer>/<section>`, not anonymous divs. Interactive things are real `<button>`/`<a>` elements, not `<div onclick>`.
4. **Forms** — every input has a `<label>`; error and success messages are associated with fields (`aria-describedby`) and announced (`role="status"` / `aria-live`).
5. **State attributes** — toggles and menus expose state (`aria-expanded` on the hamburger, `aria-label` where text is absent).
6. **Motion** — heavy animation respects `prefers-reduced-motion`.

## What the student must do personally — the agent can't press Tab

- **Keyboard-only pass:** no mouse. Tab through the page — can they reach every link, button, toggle, and accordion? Can they always *see* where focus is? Anything unreachable or invisible is a finding.
- **Contrast:** DevTools color picker shows the contrast ratio — check text over gradients and glass effects especially. Target 4.5:1 for normal text.

## Reporting

Order findings by user impact, not file order. For each: what's wrong, who it locks out, and the question first ("this image has no alt — what does a screen reader say here?"). Fix only after the student answers. End with one thing the page already does right.
