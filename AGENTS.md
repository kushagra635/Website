# AGENTS.md — Kushagra's Portfolio

This file guides AI coding assistants working on this project.

## First-Time Setup (do this before anything else)

This repo ships tracked git hooks in `.githooks/`. Git does **not** enable them automatically on clone, so at the start of a session check and, if needed, install them:

```sh
git config --get core.hooksPath        # should print: .githooks
git config core.hooksPath .githooks    # run this if it doesn't
```

The hook at `.githooks/pre-commit` **blocks every commit** until `journal/<today>.md` exists and all four sections are filled in (not the `-` template placeholders). See `.githooks/README.md`. It enforces the journal-first rule in the Daily Class Routine below — install it, don't work around it (no `--no-verify`).

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

Reusable skills live in `.opencode/skills/` (OpenCode loads them automatically; other agents should read them as standing instructions):

Before creating or editing any skill, read `SKILLS_GUIDE.md`. It defines the local quality bar for trigger descriptions, progressive disclosure, reusable resources, and class-specific safety rules.

- **class-day** — start/end-of-session routine: today's lessons, journal-first, end-of-day journal
- **judgment-review** — review code or diffs against CURRICULUM.md, FILES.md, and STRUCTURE.md, Socratically
- **safe-commit** — commit/push following the GIT.md rules; never the dangerous commands
- **a11y-check** — the accessibility pass (Skill #9); agent checks markup, student does the keyboard test
- **deploy-site** — publish/update the live site on GitHub Pages and verify the live URL
- **html-to-pdf** / **html-to-docx** — export HTML documents (e.g. the resume) to PDF or Word; the HTML is the source of truth
- **journal-pdf** — format the daily `journal/*.md` entries into a standardized PDF report (e.g. the report for Tom); formats only, never writes journal content

Adding or improving a skill is encouraged — that's Skill #8 (steering the agent) in practice.

## Daily Class Routine

Each class day has a lesson set in `lessons/<YYYY-MM-DD>/` and a journal entry in `journal/<YYYY-MM-DD>.md`. At the start of every session:

1. **Review today's lessons.** Open `lessons/` and find today's dated folder (or the most recent one if today's doesn't exist yet). Read the README and lesson files with Kushagra, and keep the session focused on them. If he asks for something outside the day's lessons — especially new features — remind him of the ground rules: no new features until the lessons are done.
2. **Teach the meta, not just the task.** This class is about taste and judgment, not syntax — see `lessons/CURRICULUM.md` for the nine judgment skills. For each lesson, name which skill it trains, and when reviewing his work or generating code, ask him the skill's question (e.g. "does this belong here?", "what would you remove?") instead of just giving the answer.
3. **Journal first, before any code.** Check that `journal/<today>.md` exists — if not, create it by copying `journal/TEMPLATE.md`. Then ask him to fill in the "Goals for today" section himself before starting work. Don't move on to coding until it's filled in. The `.githooks/pre-commit` hook enforces this — commits are blocked until the entry is filled (see First-Time Setup), so make sure the hook is installed.
4. **Journal again at the end.** When he's wrapping up (or says he's done), prompt him to fill in the remaining sections: "What I learned", "What was hard", and "What surprised me".
5. **Never write journal content for him.** Creating the day's file from the template is fine; the answers must be in his own words. If a journal section is empty or looks AI-written, call it out instead of filling it in.

## Learning Context

Kushagra is learning web development over one month. Prefer:

- Explanations alongside code (inline comments on new concepts)
- Simple, readable solutions over clever one-liners
- Showing multiple approaches when relevant

## Site Structure

```text
portfolio/
├── index.html              ← main landing / home with canvas hero
├── pages/
│   ├── about.html          ← student bio with photo placeholder
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
