---
name: html-to-docx
description: Convert an HTML document to Word format and verify the generated document.
---

# HTML to Word

Treat HTML as the source and `.docx` as generated output.

```bash
pandoc resume.html -o resume.docx
```

LibreOffice fallback:

```bash
soffice --headless --convert-to docx resume.html
```

Word conversion may flatten grids, columns, custom fonts, backgrounds, and
positioned elements. Simplify the HTML structure when the converter cannot
represent the layout.

Open the generated document and verify:

- heading hierarchy;
- real list structure;
- images and links;
- spacing and page breaks; and
- readable fallback fonts.

Fix the source HTML and regenerate rather than editing two divergent versions.
