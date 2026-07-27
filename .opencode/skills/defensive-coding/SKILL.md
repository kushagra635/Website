---
name: defensive-coding
description: Load when writing or reviewing error handling, fallback values, retry loops, input guards, or configuration switches. Keep recovery at real boundaries and expose invalid states instead of hiding them.
---

# Defensive Coding

Validate untrusted data where it enters, then rely on that validated contract.

## Review sequence

1. Identify the boundary: files, forms, camera input, network responses,
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

## Complete when

- [ ] Untrusted input is validated at its boundary.
- [ ] Internal failures do not become plausible but false output.
- [ ] Every catch names a specific failure and recovery.
- [ ] Retries apply only to transient failures and have a bound.
- [ ] Remaining guards have a traced input and a clear purpose.
