# Lesson 2: Inline Styles and an Accessibility Pass

**Trains:** Skill #1 — Where things live, and Skill #9 — The quality AI skips (*"what did it NOT do?"*) — see [CURRICULUM.md](../CURRICULUM.md)
**Time estimate:** ~1 hour

## The problem

Two issues, one lesson.

**Inline styles:** `about.html` styles gradient text inline instead of using your own design system — you have a `style.css` full of variables, and these styles bypass it.

**Accessibility:** images missing alt text, and nobody has ever tried using this site without a mouse. This is the quality dimension AI consistently skips unless you demand it — nothing about a focus state sparkles in a screenshot.

## The exercise

1. Have your agent inventory every inline style. **You decide the class names** — the gradient-text pattern repeats, and that's exactly what a class is for. Agent executes; the site must look pixel-identical after.
2. Have the agent flag every image. **You write the alt text** — and learn the rule for decorative images (`alt=""`, present but empty — find out why that's different from no alt at all).
3. **Unplug your mouse.** Really. Tab through every page: can you reach the theme toggle, every nav link, every accordion? Can you always *see* where you are? Anything unreachable or invisible goes on a fix list for the agent — with your description of what's wrong, not just "fix accessibility."
4. Run the contrast checker in browser DevTools on each page — glass-morphism over gradients is a classic low-contrast trap. You judge the results.

## Done when

- [ ] Your agent proves zero inline styles remain, and you've seen the proof
- [ ] Every image has alt text *you* wrote
- [ ] You can operate the entire site keyboard-only, and you always know where focus is
