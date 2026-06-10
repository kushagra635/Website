---
name: html-to-docx
description: Convert an HTML document to Word (.docx) — for job/program applications that require Word uploads. Use when the student needs a Word version of their resume or any HTML document.
---

# HTML to Word (.docx)

Same principle as html-to-pdf: the HTML is the **source of truth**, the .docx is a build artifact. Fix problems in the HTML and re-export; never let the Word copy drift from the source.

## 1. Convert

Primary — pandoc:

```bash
pandoc resume.html -o resume.docx
```

If pandoc is missing: `brew install pandoc` (macOS) or `winget install pandoc` (Windows).

Fallback — LibreOffice, if installed:

```bash
soffice --headless --convert-to docx resume.html
```

## 2. Know what Word conversion loses

Word does not speak modern CSS. Grids, multi-column layouts, custom fonts, background colors, and positioned elements will flatten or vanish. This is why the **source should be structurally simple**: semantic headings, paragraphs, lists, one column. Conveniently, that's also what ATS résumé scanners parse best — a resume that converts cleanly to .docx is usually a resume that machines and humans both read well.

If the conversion mangles the layout, the answer is usually to simplify the HTML structure, not to fight the converter.

## 3. Verify — open it in Word (or LibreOffice/Pages)

The student opens the .docx and checks:

- Headings came through as real heading styles, in the right hierarchy
- Lists are lists, not pasted bullet characters
- No stray artifacts (empty tables, broken images, weird spacing blocks)
- Fonts are readable defaults, nothing rendered as a missing-font fallback mess

If an application portal demands .docx, this converted file is what goes in — after eyes have been on it.
