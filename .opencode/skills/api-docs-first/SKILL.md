---
name: api-docs-first
description: Load before writing or reviewing code that uses an external API, SDK, library, framework, browser API, CLI, model API, webhook, or unfamiliar interface. Verify primary documentation and the exact repository version before using methods, options, events, or result fields.
---

# API Docs First

Treat the installed interface and its primary documentation as the contract.

## Workflow

1. Inspect imports, package and lock files, CDN URLs, vendored bundles, type
   declarations, model files, and runtime version output.
2. Record the exact version or source. Write `unknown` when it cannot be
   identified.
3. Read local declarations or source for the pinned version, followed by the
   vendor's versioned reference. Use search results and examples only to locate
   or corroborate primary sources.
4. Record the minimum contract:

   ```text
   API and task:
   Local version or source:
   Primary documentation:
   Import or entry point:
   Constructor or factory:
   Call signature:
   Sync, async, callback, or event behavior:
   Result shape used:
   Lifecycle and cleanup:
   Errors, permissions, and capability fallback:
   Remaining uncertainty:
   ```

5. Trace the current import, initialization, execution, rendering, error, and
   cleanup paths.
6. Implement the smallest change that uses only verified symbols.
7. Test the success path and the relevant failure, denial, unsupported, or
   empty-result path.
8. Link the documentation used and state anything that remains unverified.

Do not guess an API name, silently use documentation for a different version,
or change a dependency version as a side effect. If the exact contract is
unavailable, report what evidence is missing before writing API-specific code.

## Complete when

- [ ] The exact local version or source is recorded.
- [ ] Primary documentation and relevant local declarations were read.
- [ ] Every used symbol traces to the recorded contract.
- [ ] Success and relevant failure behavior were checked.
- [ ] Remaining uncertainty is explicit.
