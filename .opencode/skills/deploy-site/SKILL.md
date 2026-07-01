---
name: deploy-site
description: Publish or update the live site on GitHub Pages. Use when the student says deploy, publish, go live, ship it, or asks why the live site doesn't show their latest changes.
---

# Deploy the Site

This is a static site — deploying means GitHub Pages serves the repo. After first-time setup, **deploying is just pushing**.

## First-time setup (once)

1. Make sure the latest work is committed and pushed (use the safe-commit skill).
2. The student does this part in the browser: repo on GitHub → **Settings → Pages** → Source: "Deploy from a branch" → branch `main` (or the default branch), folder `/ (root)` → Save.
3. The live URL will be `https://<username>.github.io/<repo-name>/`. Wait a minute or two for the first build.

## Every deploy after that

Push to the default branch. That's it. Pages rebuilds automatically within a couple of minutes — if the live site looks stale, check that the work was actually pushed (`git status`, `git log origin/<branch> -1`) before suspecting anything else.

## Verify — on the live URL, not localhost

The student opens the live site and checks:

- Every page loads — click through the whole nav
- DevTools console shows **no red 404s** (the classic Pages failure is absolute paths like `/css/style.css` that worked locally; paths must be relative — see `lessons/STRUCTURE.md`)
- Images and fonts load; the favicon isn't broken
- One page on a phone, or DevTools mobile view

"Works on my machine" isn't shipped. The live URL is the truth.
