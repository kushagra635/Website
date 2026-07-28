# Lesson Studio 01 — Take Control of Serenity X

This five-session Project Studio turns Serenity X from a large demo into a
system that can be traced, simplified, tested, and explained. The complete
exercise is in `index.html`.

The sequence covers:

- architecture and ownership boundaries;
- Git staging, scoped commits, push verification, and safe recovery;
- window and browser-resource lifecycles;
- a reproduced failure and bounded correction;
- one duplicate-path reduction;
- one incremental extraction;
- product honesty, security, and deletion;
- a final technical walkthrough.

## What to do

1. Open your local `Kush-Website` repository and inspect the current Git state.
2. Fetch the remote and work on `serenity-x-deploy`, the branch that contains
   this checkpoint and your recent work.
3. Read the purpose, objectives, glossary, mental model, and stop conditions.
4. Complete the relevant part of `plan.md` before each mutating action.
5. Resolve ownership of any unrelated staged files before changing Serenity X.
6. Follow one session at a time. Do not combine the sessions into one large
   refactor.
7. Record actual evidence and failures in `results.md`.
8. Complete `answer.md` in your own words and run the final walkthrough with
   the code and recorded evidence available.

```bash
git status --short --branch
git fetch origin
git switch serenity-x-deploy
git pull --ff-only
```

If the branch is not yet available locally, create it from the remote:

```bash
git switch --track -c serenity-x-deploy origin/serenity-x-deploy
```

## Five-session route

| Session | Checkpoints | Outcome |
| --- | --- | --- |
| 1 | 01–03 | Trace Calculator, reproduce launcher search, and land the smallest correction |
| 2 | 04 | Map and remove one duplicate context-menu path |
| 3 | 05 | Prove and correct one resource-cleanup failure |
| 4 | 06 | Extract one stable boundary without changing the build contract |
| 5 | 07–08 | Audit product claims, close out Git, and defend the work |

Each session is a separate evidence cycle: predict in `plan.md`, make one
bounded change, record the observed result in `results.md`, explain it in
`answer.md`, and commit only that decision.

## Use OpenCode without giving away the work

OpenCode may inspect, explain, implement an approved bounded change, run checks,
and review a diff. It must not write your predictions, observations, answers,
or final defense.

Start an investigation with:

```text
Help me reproduce and understand this failure. Do not edit anything yet.
Ask for my console evidence and identify the source locations I should inspect.
```

Before an edit:

```text
Review my proposed change against the recorded evidence. State the exact files,
expected effects, verification, stop condition, and recovery before editing.
```

Before a commit:

```text
Review the staged diff for unrelated files and missing verification. Do not
write my results or explanation, and do not commit until I approve the scope.
```

## Scope

Allowed after the relevant plan checkpoint:

- `serenity-x/`;
- this checkpoint directory;
- explicit Git staging of reviewed Serenity paths.

Not allowed:

- new frameworks, runtime dependencies, or a build step;
- `git add .` while unrelated changes exist;
- destructive or history-rewriting Git commands;
- asking OpenCode to fill `plan.md`, `results.md`, or `answer.md`;
- real passwords or credentials in Serenity X;
- exposing or probing the proxy on a shared network;
- unreviewed claims or results with no recorded evidence.

The journal remains voluntary and is not a commit gate.

## Required files

```text
lesson-directory/
  README.md
  index.html
  plan.md
  results.md
  answer.md
```

## Completion check

The studio is complete when:

- Calculator is traced through open, focus, minimize, restore, and close;
- the launcher failure is reproduced and minimally corrected;
- one duplicate path is removed with before-and-after evidence;
- one timer or media resource has explicit cleanup;
- one architecture boundary is extracted without changing the build contract;
- the feature truth/security inventory is complete;
- each commit contains one reviewed decision and the push is verified;
- the final walkthrough covers one mechanism, failure, limitation, and transfer
  case with direct source references.
