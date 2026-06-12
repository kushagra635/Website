# Skills Guide

This guide teaches agents how to create and improve high-quality skills for
this class repo.

A skill is not a random note. A skill is a reusable instruction package that
helps a future agent do one repeated workflow well.

Skills live here:

```text
.opencode/skills/<skill-name>/SKILL.md
```

Optional supporting resources live beside `SKILL.md`:

```text
.opencode/skills/<skill-name>/
|-- SKILL.md
|-- scripts/
|-- references/
`-- assets/
```

## What Makes A Good Skill

A good skill is:

- **Triggered clearly:** the description tells the agent exactly when to use it.
- **Small enough to load:** the body gives essential workflow guidance, not a
  textbook.
- **Reusable:** it solves a workflow that will happen again.
- **Procedural:** it tells the agent what to do, in order.
- **Opinionated where it matters:** it has guardrails for risky or repeated
  tasks.
- **Flexible where it should be:** it leaves room for the student, repo, and
  current task.
- **Tested on a real task:** the author used it once and improved it from that
  friction.

A weak skill usually does one of these:

- repeats generic advice the model already knows;
- tries to cover every possible task;
- hides trigger rules inside the body instead of the frontmatter description;
- creates lots of extra docs nobody will load;
- gives slogans instead of steps;
- forgets the class rules about student ownership, journaling, and safe git.

## When To Create A Skill

Create a new skill only when at least one condition is true:

- the same workflow will repeat across class sessions;
- the workflow has important safety rules;
- the workflow needs a checklist agents keep forgetting;
- the workflow needs reusable scripts, references, templates, or assets;
- the workflow has a clear trigger phrase or situation.

Do not create a skill for:

- a one-time feature;
- a one-off bug;
- ordinary facts that belong in `README.md`;
- notes the student should write in their own journal;
- broad advice like "write good code".

If the workflow already has a matching skill, improve that skill instead of
creating a duplicate.

## Required Skill Shape

Every skill must have exactly one required file:

```text
SKILL.md
```

`SKILL.md` starts with YAML frontmatter:

```markdown
---
name: short-skill-name
description: Clear trigger description. Use when...
---
```

Only use these frontmatter fields:

- `name`
- `description`

The `description` is the main trigger. Put "when to use this skill" there. Do
not bury trigger rules lower in the document, because the body is only read
after the skill has already triggered.

## Naming Rules

Use:

- lowercase names;
- hyphenated words;
- clear nouns or verbs;
- names that describe the workflow.

Good:

```text
safe-commit
class-day
deploy-site
a11y-check
judgment-review
```

Weak:

```text
helper
misc
do-stuff
awesome-mode
coding
```

## Write The Description First

The description should answer:

1. What does this skill do?
2. When should an agent use it?
3. What phrases or situations trigger it?
4. What important constraints make it different from generic help?

Good example:

```markdown
description: Commit and push the student's work following the class git rules.
Use whenever work is ready to commit, the student says "commit this" or "save my
work", or at end of session.
```

Weak example:

```markdown
description: Helps with git.
```

The weak version is too vague. It does not say when to use the skill or what
class-specific rules matter.

## Keep The Body Procedural

After frontmatter, write the body as a workflow.

Good body structure:

```markdown
# Skill Name

Do this task in this order:

1. First step.
2. Second step.
3. Third step.

## Hard Limits

- Never do the dangerous thing.
- Stop and ask if this condition happens.

## Done When

- The output exists.
- The student can explain it.
- The repo is clean.
```

Avoid:

- long motivational intros;
- generic coding advice;
- huge copied documentation;
- hidden assumptions;
- instructions that conflict with `AGENTS.md`.

## Progressive Disclosure

The agent does not need every detail all the time. Keep `SKILL.md` lean and move
large details into optional resources.

Use `references/` for detailed material the agent should read only when needed:

```text
references/rubric.md
references/github-pages.md
references/form-validation.md
```

Use `scripts/` for repeatable code that should run reliably:

```text
scripts/check_links.js
scripts/export_resume.py
```

Use `assets/` for files the agent copies or uses as output material:

```text
assets/resume-template.html
assets/report-template.md
```

Do not add extra files just to look organized. A small skill with only
`SKILL.md` is usually better than a bloated skill with unused folders.

## Class-Specific Standards

Skills in this repo must preserve the teaching model.

That means:

- do not write journal answers for the student;
- do not skip the student's plan step;
- ask the judgment question before giving the fix when the lesson calls for it;
- keep student-facing explanations simple and concrete;
- never include AI attribution in commit messages;
- never use dangerous git commands;
- keep changes scoped to the lesson or approved task.

If a skill would make the agent do all the thinking for the student, rewrite it.
The goal is not faster copying. The goal is better ownership.

## Skill Quality Rubric

Score a new or edited skill before committing it.

### 1. Trigger Quality

- 0: vague description, unclear trigger.
- 1: says what it does but not when to use it.
- 2: clear trigger situations and phrases.

### 2. Scope Control

- 0: covers too many unrelated tasks.
- 1: mostly focused, with some extras.
- 2: one clear workflow.

### 3. Workflow Usefulness

- 0: generic advice.
- 1: some concrete steps.
- 2: ordered steps that would change agent behavior.

### 4. Resource Design

- 0: unnecessary files or missing needed files.
- 1: resources are useful but not clearly routed.
- 2: scripts, references, and assets are used only when they earn their place.

### 5. Safety And Class Fit

- 0: conflicts with class rules.
- 1: mostly safe, with unclear edges.
- 2: explicitly preserves journal, review, git, and student-ownership rules.

### 6. Testability

- 0: no way to tell if the skill worked.
- 1: vague done state.
- 2: clear "done when" checks.

A good skill should score at least 10 out of 12.

## Skill Creation Workflow

Use this order:

1. **Capture the friction.** What did the agent repeat, forget, or handle badly?
2. **Decide new or update.** Improve an existing skill if the scope already
   fits.
3. **Write examples.** List two or three user requests that should trigger the
   skill.
4. **Write frontmatter.** Make the description specific enough to trigger.
5. **Write the workflow.** Use ordered steps, hard limits, and done checks.
6. **Add resources only if needed.** Prefer none until a real task proves they
   help.
7. **Replay one task.** Ask whether the skill would have improved the agent's
   behavior.
8. **Review with the rubric.** Fix weak spots before committing.

## Template

Use this as the starting point:

```markdown
---
name: skill-name
description: What this skill does. Use when the student or repo needs...
---

# Skill Name

Do this workflow in order:

1. Inspect the relevant file or state.
2. Ask for student input if the lesson requires it.
3. Make the smallest scoped change.
4. Verify the result.
5. Report what changed and what was not verified.

## Hard Limits

- Do not ...
- Stop if ...

## Done When

- [ ] The required artifact exists.
- [ ] The student can explain the change.
- [ ] The repo status is understood.
```

## Review Checklist

Before committing a skill, answer:

- Does the `description` say exactly when to use it?
- Would this skill trigger for the right request?
- Would it avoid triggering for unrelated requests?
- Is the workflow specific enough to change behavior?
- Is anything just generic advice?
- Are class rules preserved?
- Are references, scripts, or assets truly needed?
- Did you remove unused generated folders or placeholder files?
- Is there a clear done state?
- Can the student explain why this skill exists?

If the answer to any question is no, revise before committing.
