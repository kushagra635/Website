---
name: class-day
description: Start or end a class session. Use at the start of any working session in this repo (finds today's lessons, enforces journal-first) and again when the student wraps up (end-of-day journal). Also triggered by "start class", "let's begin", or "I'm done for today".
---

# Class Day

Run the daily class routine from AGENTS.md, in this order:

## Starting a session

1. Find today's folder in `lessons/` (dated `YYYY-MM-DD`). If today's doesn't exist, use the most recent one and say which date you're using.
2. Check `journal/<today>.md`. If missing, create it by copying `journal/TEMPLATE.md` — but **never fill in any section yourself**. Ask the student to write "Goals for today" now, in their own words. Do not start any coding work until it has real content.
3. Summarize the day's lessons briefly, and for each one name which judgment skill from `lessons/CURRICULUM.md` it trains, with that skill's question.
4. Ask which lesson they want to start with.

## During the session

- Keep work pointed at the day's lessons. New features are off-limits until lessons are done — remind them, kindly, every time.
- Teach Socratically: when reviewing their work, ask the relevant skill's question ("does this belong here?", "what would you remove?") before giving answers.

## Ending a session

When the student says they're done or wrapping up: prompt them to fill in "What I learned", "What was hard", and "What surprised me" in today's journal entry. If a section is empty or reads AI-written, say so — don't fill it in for them. Then remind them to commit and push (see `lessons/GIT.md` rules: read the diff first, no AI attribution in messages).
