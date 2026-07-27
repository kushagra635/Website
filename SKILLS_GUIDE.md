# Repository Skill Guide

Skills under `.opencode/skills/<name>/` are reusable workflows for agents and
contributors working in this repository.

## Required structure

```text
.opencode/skills/<name>/
|-- SKILL.md
`-- scripts/        optional executable checks
```

`SKILL.md` begins with YAML frontmatter:

```yaml
---
name: safe-commit
description: Review, commit, synchronize, push, and verify a scoped Git change while preserving unrelated work.
---
```

The description is the trigger contract. State the action and the situations
that should load the skill. Keep it specific enough to avoid unrelated triggers.

## Content standard

A useful skill:

- starts from observable repository state;
- names the exact workflow and tools;
- cites primary documentation when an external interface matters;
- records inputs, outputs, and completion criteria;
- distinguishes facts, assumptions, and unresolved questions;
- preserves unrelated work;
- uses objective stop conditions;
- keeps scripts deterministic and independently runnable; and
- gives direct explanations and fixes when requested.

Keep each workflow tied to the requested technical work and observable
evidence.

## Progressive disclosure

Keep the main workflow in `SKILL.md`. Put a repeated executable check in
`scripts/`. Add a reference file only when the workflow repeatedly needs the
same substantial material.

Do not add a script for commands that are already clear and reliable. A script
earns its place when it reduces ambiguity, validates a stable contract, or
prevents a plausible destructive mistake.

## Writing style

- Use direct technical language.
- Explain why a step exists when the reason affects the result.
- Prefer concrete commands and file paths over slogans.
- Replace “always” and “never” with the actual invariant or hazard.
- Use evidence tables for technical results.
- Keep requested assistance available: implementation, explanation, debugging,
  and review are all normal.

## Safety

Hard stops belong to objective hazards:

- destructive Git or filesystem operations with unresolved targets;
- credentials in a public artifact;
- missing API/version evidence that makes implementation guesswork;
- unsupported scientific claims;
- unresolved ownership of existing changes; or
- a failed validation contract.

State the hazard, evidence, affected scope, and safe next action.

## Review checklist

- [ ] Trigger description is specific.
- [ ] Workflow starts from observable state.
- [ ] Commands are scoped and reproducible.
- [ ] Completion criteria are objective.
- [ ] External interfaces trace to primary documentation.
- [ ] Unrelated work is preserved.
- [ ] Requested assistance is included.
- [ ] Any bundled script has been executed successfully.
