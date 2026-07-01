---
name: safe-commit
description: Commit and push the student's work following the class git rules. Use whenever work is ready to commit, the student says "commit this" or "save my work", or at end of session.
---

# Safe Commit

Follow `lessons/GIT.md` exactly. The rules:

1. **Show before staging.** Run `git status` and show the student what changed. If anything unexpected appears, stop and ask about it.
2. **The student reads the diff.** Show `git diff` (or a per-file summary for large changes) and have them confirm they understand what's in it. No confirmation, no commit — reading the diff is rule #2 of the class.
3. **One logical change per commit.** If the changes mix two unrelated things, split them into separate commits.
4. **Message format:** conventional prefix (`feat:`, `fix:`, `docs:`, `refactor:`...), imperative mood, says what and why. Draft it, but ask the student to approve or improve it — message-writing is their skill to build.
5. **Never include AI attribution** — no "Generated with", no Co-Authored-By footers naming tools. Ever.
6. **Push after committing** (or at minimum at end of session) — unpushed work only exists on this laptop.

## Hard limits

- Never run the dangerous commands from `lessons/GIT.md` (`reset --hard`, `clean -fd`, `push --force`, repo-wide `restore .`/`checkout .`) — if one seems needed, stop, explain the situation, and have the student talk to their teacher first.
- If the repo is in a confusing state, stop at `git status` and explain what you see before touching anything.
