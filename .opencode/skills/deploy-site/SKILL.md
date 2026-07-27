---
name: deploy-site
description: Publish or update the static site on GitHub Pages and verify the live output.
---

# Deploy the Site

## First setup

1. Commit and push the intended files.
2. In GitHub, open **Settings → Pages**.
3. Select “Deploy from a branch,” the default branch, and `/ (root)`.
4. Save and wait for the first build.

The URL is normally `https://<username>.github.io/<repo-name>/`.

## Updates

Push to the configured Pages branch. If the site appears stale, compare local
`HEAD`, the upstream branch, and the latest Pages deployment before changing
code.

## Verify the live URL

- Open every navigation target.
- Check the browser console and network panel for errors and missing assets.
- Confirm images, fonts, and favicon load.
- Check one narrow mobile viewport.
- Confirm repository-relative paths work under the project subdirectory.

The deployed URL, not localhost, is the release artifact.
