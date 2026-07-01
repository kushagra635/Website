# Project Structure — Where Files Live

This is Skill #1 from [CURRICULUM.md](CURRICULUM.md) — *"does this belong here?"* — at the folder scale. The same judgment that says "style doesn't belong in HTML" also says "this image doesn't belong at the root."

## Why your root gets crowded

By default, everything lands at the root — every page, stylesheet, script, and image your agent generates piles up in one place, because creating a file there is the path of least resistance. Nobody decides to have a junk drawer; it happens one "I'll just put this here" at a time.

The root is your project's front door. Anyone — including your agent, including future you — should be able to look at it and understand the whole project in five seconds. Twenty mixed files at the root fails that test.

## The standard layout for a static site

```text
project/
├── index.html        ← the front door — must stay at root (servers look for it)
├── about.html …      ← other pages: fine at root for a small site
├── css/              ← all stylesheets
├── js/               ← all scripts
├── assets/           ← things that aren't code
│   ├── images/       ← photos, icons
│   └── files/        ← downloads: resume PDF, etc.
├── lessons/          ← this class
├── journal/          ← your daily entries
├── README.md         ← docs about the project
├── AGENTS.md         ← rules for your AI
└── .git/             ← the history (hidden — see GIT.md)
```

## What earns a place at the root

Only three kinds of things:

1. **`index.html`** — web servers look for it there by name.
2. **Docs and config about the whole project** — `README.md`, `AGENTS.md`, `package.json`. Tools and humans expect these at the top.
3. **Folders.**

Everything else lives in a folder, grouped **by kind**. If you're about to create a file at the root, that's a *"does this belong here?"* moment — the answer is usually no.

## Naming rules

- **Lowercase, hyphens, no spaces:** `profile-photo.jpg`, not `IMG_4032 copy.JPG` or `My Resume FINAL(2).pdf`. Spaces and capitals cause real breakage in URLs and on other people's computers.
- **Folder name carries the category, file name carries the content.** `assets/images/robotics-team.jpg` reads like a sentence; `stuff/img2.jpg` reads like a junk drawer.

## Moving files without breaking the site

Here's the catch: every file you move breaks every link that pointed to it — `<link>` tags, `<script src>`, image paths, download links. So restructuring is a spec-and-verify job, like everything else:

1. **You write the plan:** what moves where, grouped by kind.
2. **The spec includes the constraint:** every page still loads afterward — no missing styles, no broken images, no dead links.
3. Agent executes, **one category per commit** (images, then scripts, then styles).
4. **You verify between commits:** open every page with DevTools console visible — broken paths show up as red 404 errors. A page can *look* mostly fine while quietly failing; the console doesn't lie.

## The test

*Could a stranger — or your agent, starting a fresh session — find any file in this project in ten seconds, just by reading folder names?* If yes, the structure is doing its job.
