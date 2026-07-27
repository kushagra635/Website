---
name: jupyter
description: Load for work on a .ipynb notebook, including TODO implementation, debugging, nbformat edits, widgets, execution checks, and clean commits.
---

# Jupyter

Use Jupyter for interactive work and `nbformat` for programmatic notebook edits.
Do not patch raw notebook JSON with text replacement.

## Safe programmatic edits

Read, edit, validate, and write once:

```python
from pathlib import Path
from notebook_utils import read_notebook, write_notebook_atomic

path = Path("lesson.ipynb")
notebook = read_notebook(path)
# edit notebook.cells
write_notebook_atomic(notebook, path)
```

Target cells by stable ID, then tags, then unique source text. Treat ambiguous
matches as errors. Preserve `kernelspec` and `language_info` unless the kernel is
deliberately changing.

Every cell in notebook format 4.5 needs a unique ID matching
`[A-Za-z0-9_-]{1,64}`. Use the bundled `ensure_unique_cell_ids()` helper before
validation; avoid random IDs that churn every diff.

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

## Widgets

Keep computation in ordinary functions and let widgets supply values. Set
`continuous_update=False` for expensive work, route output through one
`widgets.Output`, and avoid registering duplicate callbacks. Restart-and-run-all
must produce a valid result without manual widget interaction.

## Before committing

```bash
python3 .opencode/skills/jupyter/scripts/check_notebooks.py <notebook-or-dir> \
  --output-policy clear
```

Review the notebook diff. Use a consistent output policy across every code cell.
Do not bypass a failing check by editing the check, loosening a tolerance, or
turning checks off.

## Complete when

- [ ] Restart-and-run-all completes without errors.
- [ ] TODOs are implemented and checks pass unchanged.
- [ ] Programmatic edits use `nbformat` and validate before writing.
- [ ] Cell IDs are valid and unique.
- [ ] Generated artifacts are in `results/`.
- [ ] The notebook diff is reviewed and outputs follow one policy.
