# Notebook Git Diff Hygiene

Use this reference to keep `.ipynb` diffs small, reviewable, and reproducible.

## 1) Pick one output policy per repo

- `clear` policy: commit notebooks without code outputs or execution counts.
- `preserve` policy: keep outputs intentionally for demos/reports.
- Decide once and document it in repo docs to prevent mixed conventions.

## 2) Enforce policy before commit

Read, edit, validate, and write through `nbformat`. For a repository that clears
outputs:

```python
from pathlib import Path

import nbformat

for path in sorted(Path("notebooks").glob("*.ipynb")):
    notebook = nbformat.read(path, as_version=4)
    for cell in notebook.cells:
        if cell.cell_type == "code":
            cell.outputs = []
            cell.execution_count = None
    nbformat.validate(notebook)
    nbformat.write(notebook, path)
```

This course uses the preserve policy, so do not run the clearing loop on lesson
notebooks. Validate them and inspect the rendered outputs instead.

## 3) Keep metadata churn intentional

- Keep `kernelspec` and `language_info` stable unless the environment intentionally changed.
- Avoid persisting widget state blobs unless the notebook is explicitly an interactive demo.
- Avoid broad notebook-wide metadata rewrites when only one cell changed.

## 4) Keep repeated edits explicit

For repeated edits, use one short task-local Python script that calls
`nbformat`, targets cells by ID or tag, validates, and writes once. Review or
delete that script after the migration; do not create a second notebook-editing
framework.

## 5) Optional tooling

If the repo uses notebook-specific git helpers, keep them explicit and documented:

- `nbstripout` to normalize outputs automatically on commit hooks.
- `nbdime` for notebook-aware diff rendering in code review workflows.
