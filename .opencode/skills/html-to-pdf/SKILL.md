---
name: html-to-pdf
description: Convert an HTML page to PDF and verify layout, pagination, links, and print styling.
---

# HTML to PDF

Treat HTML as the source and PDF as generated output.

Minimum print CSS:

```css
@page { size: letter; margin: 0.6in; }
@media print {
  nav, footer, .no-print { display: none; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

Headless Chromium example:

```bash
chrome \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="output.pdf" "file:///absolute/path/to/source.html"
```

Browser fallback: Print → Save as PDF, select Letter, and enable background
graphics when required.

Open the PDF and verify page count, clipping, orphaned lines, colors, images,
links, and readable text. Fix the HTML or print CSS and regenerate.
