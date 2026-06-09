# AGENTS.md — Kushagra's Portfolio

This file guides AI coding assistants working on this project.

## Project Stack
- Plain HTML + CSS (no frameworks)
- Vanilla JavaScript for interactivity, canvas animations, and scroll effects
- Shared `style.css` for common styles across pages
- Page-specific styles in each page's `<style>` block
- No build step — files open directly in the browser
- Google Fonts: Dancing Script (cursive for hero headings) loaded via `<link>` in each page's `<head>`

## Code Conventions
- Use semantic HTML (`<header>`, `<section>`, `<footer>`, `<nav>`)
- CSS custom properties for colors (`:root` variables) in `style.css`
- Shared styles go in `style.css`, one-off styles stay inline in `<style>`
- Primary font: Georgia, 'Times New Roman', serif (set on `body`)
- Hero `<h1>` uses `font-family: 'Dancing Script', cursive` for a cursive accent
- Google Fonts CDN links are allowed — only Dancing Script needed

## Navigation
- All pages share the same `<nav>` bar at the top
- The current page's link gets `.active` class
- Navbar links: Home, About, Accomplishments, Activities

## Components

### Canvas Hero
- `.hero` with `min-height: 90vh` (`.hero-sm` for 50vh on Accomplishments page)
- Contains a `.hero-bg` with a `<canvas>` for particle network animation
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

## Learning Context
Kushagra is learning web development over one month. Prefer:
- Explanations alongside code (inline comments on new concepts)
- Simple, readable solutions over clever one-liners
- Showing multiple approaches when relevant

## Site Structure
```
portfolio/
├── index.html              ← main landing / home with canvas hero
├── about.html              ← student bio with photo placeholder
├── accomplishments.html    ← all awards and recognitions
├── activities.html         ← skills, clubs, volunteering, FRC, projects
├── style.css               ← shared styles for all pages
├── README.md               ← project docs
└── AGENTS.md               ← agent instructions
```

## When Adding New Features
1. Check existing patterns in the code first
2. Propose the approach before writing a lot of code
3. Add the feature description to README.md
4. Update this file if new conventions or tools are introduced
