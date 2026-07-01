---
name: journal-pdf
description: Format the student's daily journal entries into a clean, standardized PDF report. Use when asked to export or print the journal, "make a journal PDF", or produce a journal report (e.g. the report for Tom). It only formats what is already written — it never composes, edits, or fills in journal content.
---

# Journal PDF

Turn the dated entries in `journal/*.md` into one standardized PDF. The Markdown
files are the **source of truth**; the PDF is a build artifact — never hand-edit
the PDF, and never change the journal text to make the report look nicer.

## Steps

1. **Check the entries exist.** The script reads every `journal/YYYY-MM-DD.md`.
   If there are none (or they are still the empty template), stop and tell the
   student to journal first (see the `class-day` skill). Do not write entries
   for them.
2. **Run the generator** from the repo root:

   ```bash
   node .opencode/skills/journal-pdf/scripts/make_journal_pdf.mjs \
     --repo . --name "Kushagra"
   ```

   - Output defaults to `journal/journal-report.pdf` (override with `--out`).
   - Class label defaults to "Summer AI Class" (override with `--class`).
   - Every entry is rendered with its four sections. An empty section shows as
     a muted "— not filled in —" — that is the honest state, not a bug to patch.
3. **Verify — open the PDF and look:**

   ```bash
   open journal/journal-report.pdf
   ```

   Confirm the cover (name, period, entry count), that every real entry is
   present, and that the text matches what the student actually wrote.

## Hard Limits

- **Never write, edit, or "improve" journal content.** This skill only formats.
  If a section is empty, it stays empty in the PDF.
- Do not invent entries or dates. One card per real `journal/*.md` file.
- The `.md` files are the source of truth — fix wording there and re-run.
- If no Chrome/Chromium is found, follow the script's printed fallback
  (`npx playwright install chromium`, or open the temp HTML and Print → Save as
  PDF, Letter, "Background graphics" on).

## Done When

- [ ] `journal/journal-report.pdf` exists.
- [ ] Someone opened it and the entries match the Markdown.
- [ ] No journal text was changed to produce it.
