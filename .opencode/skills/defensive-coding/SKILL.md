---
name: defensive-coding
description: Load when adding or reviewing a `try`/`except`/`catch`, a retry loop, a fallback default, an input guard, or a config flag, and whenever reviewing generated code, which adds these by reflex. Keep recovery at real boundaries and expose invalid states instead of hiding them.
metadata:
  upstream: defensive-coding
---

# Defensive Coding

Validate untrusted data where it enters, then rely on that validated contract.
A guard that hides a broken assumption is worse than no guard: the program keeps
running and reports something false.

## Review sequence

1. Identify the boundary: files, forms, `fetch` responses, camera input,
   command-line arguments, or hardware.
2. Validate the input once at that boundary.
3. Raise or throw when an internal assumption breaks.
4. Catch a specific error only when the code can recover, add useful context,
   or return an explicitly incomplete result.
5. Keep the `try` block limited to the operation that can fail.
6. Trace every fallback value to its downstream effect.

Inspect blanket exception handlers, empty catches, invented defaults, retries
for non-transient failures, unused configuration switches, and repeated guards.
Remove one only after tracing the input and confirming it does not protect a
real boundary.

Error-handling cleanup should be scoped so the diff shows exactly what changed.

## Reject these

- `catch (e) {}` and `except Exception:` in ordinary logic.
- A fallback that returns `0`, `[]`, or `""` where the real value is missing.
- A retry loop with no bound, or one that retries a 404 or a `TypeError`.
- A config flag or mode with no current caller.
- The same shape check repeated in every function down the call stack.
- A guard against a state that the code above it already made impossible.

Worked before-and-after examples for each:
[references/patterns.md](references/patterns.md).

## Scan

For Python code, including lesson notebooks exported to `.py`:

```bash
python .opencode/skills/defensive-coding/scripts/check_bloat_patterns.py . --exclude-dir node_modules --fail-on warning
```

It flags broad exception handlers, `# type: ignore` comments, and
`cast(Any, ...)`. It does not guess whether a specific exception handler should
recover or re-raise; inspect that against the boundary contract. The scan is
heuristic and reads Python only.

There is no equivalent scanner for JavaScript here, and writing one is not the
move: ESLint already covers it. Configure `no-empty`, `no-unused-vars`, and
`no-constant-condition` in the project rather than building a substitute, as
`standard-methods-first` requires.

## Complete when

- [ ] Untrusted input is validated at its boundary.
- [ ] Internal failures do not become plausible but false output.
- [ ] Every catch names a specific failure and recovery.
- [ ] Retries apply only to transient failures and have a bound.
- [ ] Remaining guards have a traced input and a clear purpose.
- [ ] The scanner ran on changed Python and its findings are resolved or
      explained.
