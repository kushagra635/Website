---
name: release-check
description: Load before anything becomes public - `git push`, deploying or updating the GitHub Pages site, sharing a repository link, adding a resume or contact detail, or committing a file that came from somewhere else. Check the exact files that will be published for credentials, generated files, and unsupported claims.
metadata:
  upstream: publish-safety-check
---

# Release Check

Review the exact files that will become public.

## Run

```bash
python .opencode/skills/release-check/scripts/scan_publish_safety.py . --strict
git status --short --branch
git diff --check
git diff --cached --name-status
```

Resolve every `BLOCKER`. Review each `WARN` against the intended artifact.

Check for:

- API keys, access tokens, passwords, `.env` files, and credentials;
- generated outputs, caches, logs, archives, and scratch files;
- files outside the declared commit scope;
- merge markers, broken links, and missing assets; and
- claims that exceed the evidence included with the artifact.

The scanner checks current files, not the complete Git history. Report its scope
accurately.

The scanner is limited to the technical checks listed above. It checks current
files rather than Git history, rendered output, or linked resources.

## Complete when

- [ ] Scanner blockers are resolved.
- [ ] Warnings have an explicit disposition.
- [ ] The staged file list matches the intended scope.
- [ ] The public output was opened and checked.
- [ ] Claims trace to included evidence.
