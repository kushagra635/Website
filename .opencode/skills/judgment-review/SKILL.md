---
name: judgment-review
description: Review code, diffs, files, or generated output against repository structure, accessibility, duplication, maintainability, and evidence standards.
---

# Judgment Review

Read:

1. `lessons/CURRICULUM.md`
2. `lessons/FILES.md`
3. `lessons/STRUCTURE.md`

Review the requested scope for misplaced logic, duplication, unnecessary code,
file-boundary violations, magic values, inaccessible markup, missing error
states, and unverified claims.

Report findings in severity order. Each finding should include the file and
location, current behavior, consequence, and a concrete correction. Separate
facts from preferences. Three material findings are more useful than a long
list of style nits.

Implement fixes when requested and verify the result with the repository's
actual checks.
