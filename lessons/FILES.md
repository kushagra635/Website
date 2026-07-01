# Inside Your Files — the Anatomy of Each Kind

[STRUCTURE.md](STRUCTURE.md) is about where files live. This is about what goes on *inside* them — and in what order. Same skill, one level down: every kind of file has places where things belong.

You won't hand-write most of these files. So why learn their anatomy? Because **this is the standard you hold the agent's output to.** When a generated file matches this shape, you can read it, navigate it, and review it fast. When it doesn't, that's a finding.

## An HTML page

Every page, same skeleton, same order:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- 1. meta: charset, viewport -->
  <!-- 2. <title> — unique per page, says what THIS page is -->
  <!-- 3. stylesheet links -->
</head>
<body>
  <header>  <!-- site name + <nav> — same on every page -->
  <main>    <!-- this page's actual content — exactly one <h1> lives here -->
  <footer>  <!-- same on every page -->
  <!-- 4. scripts last, or in <head> with `defer` -->
</body>
</html>
```

**What to check when reviewing a generated page:**
- Exactly one `<h1>`, and heading levels descend in order (h1 → h2 → h3, no skipping)
- Content sits in semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`) — not a pile of `<div>`s
- No inline `style="..."` (you know this one by now)
- Every `<img>` has an `alt`

## A CSS file

Top to bottom, general to specific:

```css
/* 1. Design tokens — :root variables: colors, spacing, fonts. The ONLY place raw values live */
/* 2. Base — resets, body, default headings/links */
/* 3. Layout — containers, grids, page scaffolding */
/* 4. Components — one commented section per component: nav, cards, buttons, forms… */
/* 5. Page-specific styles — clearly labeled by page */
/* 6. Media queries — at the bottom, or right beside the component they adjust (pick ONE convention and keep it) */
```

**What to check:** can you find the rule you're looking for in ten seconds? Are colors and sizes pulled from the variables in section 1, or is the agent sprinkling raw hex codes mid-file? A hardcoded `#7c3aed` in a component is a "does this belong here?" moment — the answer is no, it belongs in the tokens.

## A JavaScript file

**One file, one job.** The file's name *is* its job (`theme.js`, `navigation.js`) — if you can't summarize a file in one sentence, it should be split. Inside, the order is:

```js
// 1. Imports — what this file depends on
// 2. Constants & config — named values at the top, no magic numbers buried below
// 3. Functions — the logic, each doing one thing
// 4. Init & event wiring — at the bottom, in ONE place, so you can see everything
//    this file does to the page just by reading its last few lines
```

**What to check:** does the file touch things outside its stated job? Is event wiring scattered through the middle where you can't audit it? Are there numbers like `150` or `0.3` with no name explaining what they mean?

## The principle

A well-structured file answers questions *by position*: "where are the colors defined?" — top of the CSS. "What does this script do to the page?" — bottom of the JS. "Where's this page's content?" — inside `<main>`. When position answers the question, you read less and understand more — and so does your agent next session.

When the agent hands you a file that doesn't follow this anatomy, don't reorganize it yourself. Tell it what's out of place and have it fix it. That review *is* the skill.
