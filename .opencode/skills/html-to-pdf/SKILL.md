---
name: html-to-pdf
description: Convert an HTML page to a clean PDF — resume, one-pager, report. Use when the student asks to export or print HTML to PDF, especially resume.html → resume.pdf.
---

# HTML to PDF

The HTML file is the **source of truth**; the PDF is a build artifact. Never hand-edit the PDF — fix the HTML and re-export.

## 1. Make the page print-ready first

Check the HTML has print CSS before converting. Minimum:

```css
@page { size: letter; margin: 0.6in; }
@media print {
  nav, footer, .no-print { display: none; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

For a resume: no nav, no animations, system-safe fonts or embedded Google Fonts, single column converts most reliably.

## 2. Convert with headless Chrome

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="resume.pdf" "file:///absolute/path/to/resume.html"
```

(On Windows, `chrome.exe` with the same flags; any installed Chromium works.)

**Fallback** if headless conversion misbehaves: have the student open the page in their browser → Print → Save as PDF, paper size Letter, "Background graphics" checked. Same engine, manual trigger — completely legitimate.

## 3. Verify — the student looks at the PDF

Open the result. Check together:

- **Resume: exactly one page.** If it spills, the fix is cutting content or tightening `@page` margins — in the HTML, not the PDF.
- Nothing clipped at page edges; no orphaned single lines.
- Colors/backgrounds rendered (if missing, the `print-color-adjust` rule is absent).
- Links visible as readable text — a printed "click here" is dead weight.

An export nobody opened is an export that's broken. Always look.
