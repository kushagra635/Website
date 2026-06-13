# Git hooks

Version-controlled hooks for this repo. Git does **not** enable these
automatically on clone (for security), so run this once per clone:

```sh
git config core.hooksPath .githooks
```

## pre-commit

Blocks a commit unless there's a journal entry for today
(`journal/YYYY-MM-DD.md`) with all four sections filled in — not the `-`
template placeholders. See `journal/README.md` for the why.

It can be bypassed with `git commit --no-verify` (true of any client-side
hook). For enforcement that can't be skipped, add a server-side check.
