---
name: a11y-check
description: Review a page or site for semantic structure, keyboard access, visible focus, form labeling, exposed control state, contrast, and reduced-motion behavior.
---

# Accessibility Check

Inspect:

1. Meaningful images have useful `alt`; decorative images use `alt=""`.
2. Each page has one `<h1>` and a logical heading order.
3. Landmarks and interactive elements use semantic HTML.
4. Inputs have labels; errors and status messages are associated and announced.
5. Toggles and menus expose state such as `aria-expanded`.
6. Animation respects `prefers-reduced-motion`.
7. Every control is reachable and operable by keyboard with visible focus.
8. Normal text meets a 4.5:1 contrast target.

Run the keyboard pass in a browser. Report findings by user impact with the
affected element, consequence, and concrete fix. Implement fixes when requested
and verify the changed behavior.
