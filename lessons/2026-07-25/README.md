# Lessons: Reproducible Conda Environments

Date: July 25, 2026

Today is about environments as a skill: knowing where Python lives, what's inside an environment, and how to recreate it from a file so you never depend on "it works on my machine."

Work through these in order:

1. [Gather the starting state](01-starting-state.md) — run the diagnostic commands, record what exists before you change anything
2. [Create the environment](02-create-environment.md) — build `ac-cv` from packages, record the plan before executing
3. [Verify the environment](03-verify-environment.md) — prove Python, NumPy, and OpenCV all resolve inside `ac-cv`
4. [Write the recipe and rebuild](04-recipe-and-rebuild.md) — export `environment.yml`, rebuild from scratch, compare

Rules of engagement:

- Use the Miniforge Prompt; conda commands won't work in a plain PowerShell window unless you ran `conda init`
- One commit per logical step, with what changed in the message
- Run `python machine-profile.py` before and after to get an honest snapshot
- The `environment.yml` is the source of truth — the environment folder stays out of git

## End of day deliverables

- `environment.yml` committed to the repo root
- `machine-profile.json` committed (before and after — show the delta)
- `lessons/2026-07-25/env-check.ipynb` with `sys.executable` proof
- The rebuild environment `ac-cv-rebuild` created and verified, then removed
- Answers to the review questions tracing every claim to recorded output
