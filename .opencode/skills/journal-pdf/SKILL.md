---
name: journal-pdf
description: Render existing dated Markdown entries as a PDF report without changing their text.
---

# Journal PDF

The Markdown files are the source; the PDF is generated output.

From the repository root:

```bash
node .opencode/skills/journal-pdf/scripts/make_journal_pdf.mjs \
  --repo . --name "<name>"
```

Output defaults to `journal/journal-report.pdf`. Use `--out` or `--class` to
override the output path or heading.

If no dated entries exist, report that there is nothing to render. Do not invent
entries or dates. Open the PDF and verify the cover, entry count, dates, section
order, and text against the Markdown source.
