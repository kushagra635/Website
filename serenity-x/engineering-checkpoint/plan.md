# Plan — Lesson Studio 01

Record the starting state before the first mutating action. Review and revise
the plan as new evidence appears.

## Target

- Repository: `/home/alif/Documents/Summer_AI_Class/Kush-Website`
- Project: `serenity-x/`
- System: Serenity X app registry, window lifecycle, and one resource-owning app
- Intended outcome: Trace, simplify, test, and defend one complete app lifecycle
- Working location and branch:
- Browser, Node, npm, and Git versions:
- Chosen vertical slice:
- Chosen duplicate or unnecessary path:
- Chosen resource-owning app:
- Chosen architecture boundary:
- Scope allowed to change after each checkpoint:
- Scope that must not change:

## Starting state

- Exact output of `git status --short --branch`:
- What the first and second status columns mean:
- Exact output of `git diff --cached --name-status`:
- Which staged paths are unrelated to Serenity:
- Who owns those staged paths and how they will be resolved:
- Current Calculator lifecycle behavior:
- Current launcher-search behavior and console state:
- Existing source of truth: `serenity-x/index.html`, `server.js`, and `README.md`
- Existing run contract:
- Current app-count evidence:
- Safety boundary:

## Proposed change

- Function trace from entry point to close:
- Window-state owner:
- App-state owner:
- Resource owner:
- Invariant after each lifecycle transition:
- Session 1 actions and predicted evidence:
- Session 2 actions and predicted evidence:
- Session 3 actions and predicted evidence:
- Session 4 actions and predicted evidence:
- Session 5 actions and predicted evidence:
- Exact files expected to change in the next decision:
- Deliberate failure and predicted symptom:
- Lifecycle smoke checklist:
- Evidence that will count:
- Stop condition:
- Recovery plan using a reviewed commit or safe revert:
- Proposed commit boundary and message:

## Product and security decision

- Real features:
- Simulated features:
- Placeholders:
- Unsafe or misleading features:
- Candidate deletion:
- Public claim I will verify or narrow:
- Reason for the decision:

## Change check

Before a mutating action, confirm:

- [ ] the current state and evidence;
- [ ] the exact target;
- [ ] the proposed action and expected direct and indirect effects;
- [ ] the scope allowed to change;
- [ ] the verification, stop condition, and recovery;
- [ ] the claims that still require verification.
- [ ] no unrelated staged files will enter my commit;
- [ ] no real credential, unsafe proxy test, dependency, or build step is involved.

## Ready to proceed

State the target, prediction, evidence, risk, and recovery.

- [ ] The existing source of truth is identified.
- [ ] Each proposed action has a stated reason.
- [ ] The authorized scope is bounded.
- [ ] The evidence can distinguish success from a convincing-looking failure.
- [ ] The next commit represents one decision.
- [ ] Every file in the next commit is named.

Unchecked items identify missing evidence or unresolved scope.
