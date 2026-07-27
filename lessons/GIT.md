# Git Workflow

Git tracks four relevant states:

```text
working tree -> staging area -> local commits -> remote branch
```

## Inspect

```bash
git status --short --branch
git diff
git diff --cached
git log --oneline -10
```

The two columns in short status distinguish staged and unstaged changes. Review
both before committing.

## Commit one decision

```bash
git add -- path/to/file another/file
git diff --cached --name-status
git diff --cached --check
git diff --cached
git commit -m "fix: describe the change"
```

Stage explicit paths. Split unrelated changes into separate commits. Commit
messages should state what changed and use an imperative conventional prefix.
Do not add AI attribution.

## Synchronize and verify

```bash
git fetch origin
git rev-list --left-right --count HEAD...origin/main
git push
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
git rev-parse HEAD
git rev-parse origin/main
```

`0 0` divergence plus matching SHAs proves local and upstream parity.

## Recovery

`git revert <commit>` creates a new commit that reverses a shared change.
`git restore -- <file>` discards uncommitted changes in one explicit file and
should be used only after confirming those changes are disposable.

Commands such as `git reset --hard`, `git clean -fd`, force push, repository-wide
restore, and history rewriting can destroy or overwrite work. Before using one,
resolve the exact target, ownership, recovery path, and remote effect. Prefer a
narrow reversible operation.

When repository state is unclear, inspect status, diffs, branches, and
divergence before changing it.
