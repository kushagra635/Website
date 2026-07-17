---
name: api-docs-first
description: Load before writing or reviewing code that uses any external API, SDK, library, framework, browser or platform API, CLI, model/task API, webhook, or unfamiliar or possibly changed interface. Verify primary documentation and the exact repository version so methods, options, and result fields are not guessed.
---

# API Docs First

Treat documentation as evidence. Complete this preflight before writing
API-specific code.

## Workflow

1. Preserve the class gates.
   - Read `AGENTS.md`, today's lesson, and the student's plan first.
   - Do not write plan predictions or journal answers for the student.
   - If the lesson requires a student-written plan, pause implementation until it
     exists.

2. Identify the interface actually present in the repository.
   - Inspect imports, package and lock files, CDN URLs, vendored bundles, type
     declarations, model files, and runtime or CLI version output.
   - Record the exact version or source. If it cannot be identified, label it
     unknown instead of assuming the latest release.

3. Open and read primary documentation.
   - Prefer local type declarations, vendored documentation, and source for the
     pinned version, then the vendor's versioned official reference and guides.
   - For a browser or platform API, read the standards or vendor documentation and
     check current compatibility guidance.
   - Use search results, examples, forums, and generated snippets only to locate or
     corroborate primary sources. Open the source pages; do not rely on snippets.
   - Record direct documentation URLs and relevant local paths.

4. State the minimum API contract before coding:

   ```text
   API and task:
   Local version or source:
   Primary documentation:
   Import or entry point:
   Constructor or factory:
   Call signature:
   Sync, async, callback, or event behavior:
   Result shape used by this feature:
   Lifecycle and cleanup:
   Errors, permissions, and capability fallback:
   Remaining uncertainty:
   ```

   Ask the student: **Which documentation or local declaration proves that this
   method, option, and result field exist?** Do not move to implementation until
   the answer is traceable.

5. Compare the contract with the current code.
   - Trace the existing import, initialization, execution, rendering, error, and
     cleanup paths.
   - Reuse the repository's established patterns where they match the verified
     contract.
   - Explain any mismatch between current online documentation and the pinned local
     version. The local version's declarations and behavior control the code.

6. Make the smallest lesson-scoped change.
   - Use only verified names, options, result fields, and lifecycle calls.
   - Preserve accessible status and error feedback.
   - Add an explicit capability or initialization failure path when the API can be
     unavailable.
   - Do not upgrade a package, switch a CDN URL, replace a model, or change API
     versions unless the instructor or student explicitly approves that change.

7. Verify against the contract.
   - Confirm every used symbol exists in the pinned dependency, local declarations,
     or runtime.
   - Test the success path and at least one relevant failure, denial, unsupported,
     or empty-result path.
   - Check the browser console, network requests, and resource cleanup when relevant.
   - In the handoff, link the primary documentation used and state what was not
     verified.

## Hard Limits

- Do not invent API methods, options, events, response fields, or return types.
- Do not treat model memory, a search snippet, or a third-party tutorial as the API
  contract.
- Do not silently code against the newest documentation when the repo pins an older
  version.
- Do not copy large sections of documentation into the repo; cite and summarize the
  parts the feature depends on.
- If the exact contract cannot be verified, stop API-specific implementation and
  report the missing version, documentation, permission, or runtime evidence.

## Done When

- [ ] The exact local version or source is recorded.
- [ ] Primary documentation and relevant local declarations were actually read.
- [ ] The minimum API contract is stated before implementation.
- [ ] Every used API symbol traces to that contract.
- [ ] Success and relevant failure behavior were checked.
- [ ] The student can explain which source proves the integration is valid.
