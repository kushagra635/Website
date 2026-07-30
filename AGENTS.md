# AGENTS.md — Kushagra's Portfolio

## Reporting language

- Report to the user only in ASD-STE100 Simplified Technical English.
- Use short, direct sentences.
- Each sentence must give one instruction or state one main fact.
- Use common words and consistent technical terms.
- Define each necessary technical term at its first use.
- Do not use idioms, jokes, metaphors, or vague language.
- Keep code, commands, paths, API names, error messages, and quotations exact.

## Development velocity

- Development velocity is the number one engineering priority.
- Use the smallest correct change that delivers the requested result.
- Treat excessive documentation and excessive validation as engineering
  failures because they slow delivery and increase maintenance.
- Do not add repeated checksums, hashes, audits, tests, or manual checks after
  the required pipeline check passes.
- Trust a stable pipeline after its required check passes.
- If a pipeline cannot be trusted, fix the pipeline instead of adding repeated
  downstream checks.
- Safety, correctness, science, security, data integrity, and explicit user
  requirements remain mandatory.

This file guides AI coding assistants working on this project.

## Project Stack

- Plain HTML + CSS (no frameworks)
- Vanilla JavaScript for interactivity, canvas animations, and scroll effects
- Shared `style.css` for common styles across pages
- Page-specific styles in each page's `<style>` block
- No build step — files open directly in the browser
- Google Fonts: Inter (system font via CSS @import) and Dancing Script (cursive for hero headings) loaded via `@import` in `style.css`

## Code Conventions

- Use semantic HTML (`<header>`, `<section>`, `<footer>`, `<nav>`)
- CSS custom properties for colors (`:root` variables) in `style.css`
- Shared styles go in `style.css`, one-off styles stay inline in `<style>`
- Primary font: 'Inter', system-ui, sans-serif (set on `body` via CSS)
- Hero `<h1>` uses `font-family: 'Dancing Script', cursive` for a cursive accent
- Devin-inspired design: dark glass-morphism, purple/pink/blue gradient accents, ambient glow effects

## Navigation

- All pages share the same `<nav>` bar at the top
- The current page's link gets `.active` class
- Navbar links: Home, About, Accomplishments, Activities

## Components

### Canvas Hero

- `.hero` with `min-height: 90vh` (`.hero-sm` for 50vh on Accomplishments page)
- Contains a `.hero-bg` with a `<canvas>` for particle network animation
- Particle colors use Devin palette: `['#a855f7', '#ec4899', '#3b82f6', '#06b6d4', '#10b981']`
- On scroll, the hero background fades out via `window.scrollY` → opacity mapping
- Canvas auto-resizes on window resize
- Each page that uses a hero must include the canvas init, animate, and scroll logic

### Animated Interest Bars

- `.interests-list` with `.interest-item` entries
- Each has a `.bar-track` containing a `.bar-fill` div
- When scrolled into view (IntersectionObserver, threshold 0.3), `.bar-fill` gets `.filled` class
- CSS `transition: width 1.2s cubic-bezier(...)` animates the bar from 0% to 100%

### Creative Skills Grid

- `.skills-showcase` is an auto-fit grid of `.skill-block` cards
- Each block has a Unicode icon, a skill name, and a subtitle
- Hover lifts the block with a glow shadow

### Accordion

- Structure: `.accordion > .accordion-header[data-panel] + .accordion-panel#panel-*`
- Clicking `.accordion-header` toggles `.open` on both the header and its panel
- The panel uses `max-height` + `opacity` transition
- Color variants: `.accordion-tsa` (red), `.accordion-deca` (yellow), `.accordion-hunch` (purple)

### Detail Cards (click-to-enlarge)

- Structure: `.detail-card > .summary + .details`
- Clicking toggles `.open` — details expand with bullet points
- Used in Volunteering and FRC/Robotics sections

### Static Activity Cards

- `.static-card` for non-expandable items (Other Activities)
- Always visible, no dropdown or click behavior

### Award List (Accomplishments)

- `.award-list` with `.award-item` entries
- Each has a `.year` badge (yellow accent) and a `.desc` text
- Hover pushes the item right with a glow shadow

## Workflow

- Always preview changes by opening the `.html` file directly in the browser
- Keep the site fast — no unnecessary libraries
- Commit to Git frequently with clear messages

## Agent Skills

Reusable skills live in `.opencode/skills/` (OpenCode loads them automatically;
other agents should read them as standing instructions).

Before creating or editing any skill, read `SKILLS_GUIDE.md`. It defines the
local quality bar for trigger descriptions, progressive disclosure, reusable
resources, and repository-specific constraints.

- **api-docs-first** — must be loaded before using any external API, SDK,
  library, browser API, or CLI; verify the exact local version and read primary
  documentation before coding
- **benchmarking** — fixed conditions, repeated runs, medians, p95, and a
  recorded setup for every performance claim; `scripts/run_bench.py` produces
  the artifact
- **defensive-coding** — validate real boundaries and expose invalid states
- **explanation** — the agent becomes the examiner and drills you on your own
  code without answering its own questions
- **jupyter** — safely edit, execute, validate, and review notebooks
- **release-check** — check public artifacts for secrets, accidental files, and
  unsupported claims before publishing
- **science** — keep claims within the evidence collected
- **standard-methods-first** — test documented existing methods before building
  substitutes
- **a11y-check** (local) — inspect markup, keyboard behavior, focus, contrast,
  and reduced motion
- **deploy-site** (local) — publish or update the live site on GitHub Pages and
  verify the live URL
- **safe-commit** (local) — commit and push scoped work while preserving
  unrelated changes
- **judgment-review** (local) — report concrete findings against the repository
  guidance files that exist
- **journal-pdf** (local) — render existing `journal/*.md` files as a PDF report
- **html-to-pdf** / **html-to-docx** (local) — export HTML documents such as the
  resume; the HTML is the source of truth

Keep skills task-scoped, evidence-based, and available for implementation,
explanation, debugging, and review.

## Working Routine

1. Inspect the requested files, current Git state, and relevant repository
   guidance.
2. State the evidence, intended change, scope, and verification.
3. Implement, explain, debug, or review within the requested scope.
4. Preserve unrelated work and use objective stop conditions for destructive
   operations, missing contracts, or unresolved file ownership.
5. Treat journals as optional project files. Do not inspect or enforce them
   unless the request is specifically about those files.
6. Give direct answers and concrete findings. Grade understanding only when the
   user explicitly invokes `explanation`; never speculate that work was
   copied.

## Before Committing

State which of these ran and what they reported. Do not claim a check passed
without its output.

1. Open the changed page in the browser and confirm the change is visible.
2. Check the browser console for errors introduced by the change.
3. For a notebook change, restart the kernel, run every cell, and inspect the
   rendered outputs.
4. Run `a11y-check` when markup, focus, color, or motion changed.
5. Run `release-check` before publishing or deploying.
6. Confirm `git status` shows only the files this task was meant to touch.

## Development Preferences

Prefer:

- Explanations alongside code (inline comments on new concepts)
- Simple, readable solutions over clever one-liners
- Showing multiple approaches when relevant

## Site Structure

```text
portfolio/
├── index.html              ← main landing / home with canvas hero
├── pages/
│   ├── about.html          ← personal bio with photo placeholder
│   ├── accomplishments.html ← all awards and recognitions
│   └── activities.html     ← skills, clubs, volunteering, FRC, projects
├── css/
│   └── style.css           ← shared styles for all pages
├── resume/
│   └── Resume K.S.docx     ← latest resume file
├── README.md               ← project docs
└── AGENTS.md               ← agent instructions
```

## When Adding New Features

1. Check existing patterns in the code first
2. Propose the approach before writing a lot of code
3. Add the feature description to README.md
4. Update this file if new conventions or tools are introduced
