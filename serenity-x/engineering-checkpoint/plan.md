# Plan — Lesson Studio 01

Complete this before the first mutating action. Use an agent to inspect and
question the plan, but make the decisions yourself.

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
- Scope allowed to change after each approval:
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
- Hard stop or safety boundary:

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
- Proposed commit boundary and message in my own words:

## Product and security decision

- Real features:
- Simulated features:
- Placeholders:
- Unsafe or misleading features:
- Candidate deletion:
- Public claim I will verify or narrow:
- Reason for the decision:

## Agent check

Before approving a mutating action, confirm that the agent has stated:

- [ ] the current state and evidence;
- [ ] the exact target;
- [ ] the proposed action and expected direct and indirect effects;
- [ ] the scope allowed to change;
- [ ] the verification, stop condition, and recovery;
- [ ] the claims I must verify myself.
- [ ] no unrelated staged files will enter my commit;
- [ ] no real credential, unsafe proxy test, dependency, or build step is involved.

## Ready to proceed

Explain the target, prediction, evidence, risk, and recovery aloud.

- [ ] I understand the existing source of truth.
- [ ] I can explain why each proposed action is needed.
- [ ] The agent's authority is bounded.
- [ ] The evidence can distinguish success from a convincing-looking failure.
- [ ] I can describe the next commit as one decision.
- [ ] I can name every file the next commit will contain.

Do not begin while any box is unchecked.
