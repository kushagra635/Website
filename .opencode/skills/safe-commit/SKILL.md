---
name: safe-commit
description: Review, commit, synchronize, push, and verify a scoped Git change while preserving unrelated work.
---

# Safe Commit

1. Run `git status --short --branch`.
2. Review unstaged and staged diffs.
3. Resolve the ownership of unexpected paths before touching them.
4. Stage explicit files for one logical change.
5. Review `git diff --cached --name-status`, `git diff --cached --check`, and
   the complete staged diff.
6. Use a clear conventional commit message with no AI attribution.
7. Push only when authorized.
8. Fetch and verify local/upstream SHA equality and `0 0` divergence.

Do not use `reset --hard`, `clean -fd`, force push, or repository-wide restore
as routine cleanup. When recovery is needed, identify the exact target and use
the narrowest reversible operation.
