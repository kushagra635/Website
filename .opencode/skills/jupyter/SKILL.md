---
name: jupyter
description: Load for any work on a `.ipynb` file - opening a lesson notebook, implementing a `TODO`, enabling `RUN_CHECKS`, debugging a kernel or execution-order problem, editing with nbformat, adding widgets, or committing notebook changes.
metadata:
  upstream: jupyter
---

# Jupyter

Use `nbformat` directly for programmatic notebook work. Do not patch raw
notebook JSON with text replacement, and do not build another notebook editing
layer around the library.

## Read, edit, validate, and write

```python
from pathlib import Path

import nbformat

path = Path("lesson.ipynb")
notebook = nbformat.read(path, as_version=4)

# Edit notebook.cells with the nbformat object model.

nbformat.validate(notebook)
nbformat.write(notebook, path)
```

Read first, make all changes in memory, validate, then write once. Preserve
`kernelspec`, `language_info`, outputs, execution counts, and unknown metadata
unless the task explicitly changes them.

Target an existing cell by stable ID, then tag, then unique source text. Require
exactly one match before replacing or deleting anything:

```python
matches = [cell for cell in notebook.cells if cell.get("id") == "lesson-title"]
if len(matches) != 1:
    raise ValueError(f"expected one cell; found {len(matches)}")
matches[0].source = "# Lesson 05 — Feature matching\n"
```

Use `nbformat.v4.new_markdown_cell()` and `new_code_cell()` for new cells. The
library supplies schema-valid cell objects and IDs.

## Start a notebook

Create a notebook with the standard constructors:

```python
from nbformat import v4 as nbf

notebook = nbf.new_notebook(
    cells=[
        nbf.new_markdown_cell("# Experiment: Feature matching"),
        nbf.new_code_cell("# imports and setup"),
        nbf.new_markdown_cell("## Question"),
    ]
)
nbformat.validate(notebook)
nbformat.write(notebook, "feature-matching.ipynb")
```

For the established course structure, read one of the bundled templates through
`nbformat` and change only the title and lesson-specific cells:

- `assets/lesson-template.ipynb`
- `assets/experiment-template.ipynb`

The lesson template contains the course setup, numbered checks and exercises, a
`my_*` function measured against a reference, results, and fixes. The
experiment template starts from a question and plan and ends with an explicit
decision: continue, pivot, or stop.

## Execution

Notebook order is the visible top-to-bottom order, not the sequence recorded in
`In [n]`. Restart the kernel and run every cell before reporting success.

For the OpenCV labs:

1. Read the matching `README.md`.
2. Open the notebook in the `ac-cv` environment.
3. Implement each `TODO`.
4. Enable the notebook checks.
5. Fix the implementation while keeping checks and tolerances intact.
6. Save generated artifacts under `results/`.

Requested help can include implementation, explanation, debugging, or review.
Keep the intended exercise boundary visible in the handoff.

## Outputs and public content

This course keeps notebook outputs and execution counts because the printed
result is part of the evidence. Do not strip them merely to shorten a diff.
Keep the committed outputs reviewable: prefer a short table or a few key
numbers over a long dump, and keep the narrative skimmable with headings and
short bullets.

Because outputs are committed, inspect every rendered cell before committing.
Camera frames, personal photos, local paths, credentials, and private data must
not enter the public notebook. Use `release-check` before publishing.

Do not bypass a failing notebook check by editing the check, loosening a
tolerance, or turning checks off.

## Widgets

Keep computation in ordinary functions and let widgets supply values. Set
`continuous_update=False` for expensive work, route output through one
`widgets.Output`, and avoid duplicate callbacks. Restart-and-run-all must
produce a valid result without manual widget interaction. Details are in
[references/ipywidgets.md](references/ipywidgets.md).

## References

- [notebook-structure.md](references/notebook-structure.md) — cell order and
  narrative shape.
- [git-diff-hygiene.md](references/git-diff-hygiene.md) — keeping diffs
  readable.
- [ipywidgets.md](references/ipywidgets.md) — widget behavior and pitfalls.

## Complete when

- [ ] Programmatic work used `nbformat`, not raw JSON editing or custom wrappers.
- [ ] Existing cells were targeted unambiguously.
- [ ] `nbformat.validate()` passed before the single write.
- [ ] Restart-and-run-all completed without errors.
- [ ] TODOs were implemented and checks pass unchanged.
- [ ] Generated artifacts are in `results/`.
- [ ] Outputs are present, reviewed, and contain nothing that should not be
      public.
