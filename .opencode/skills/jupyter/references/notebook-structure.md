# Notebook Structure

Jupyter notebooks are JSON documents with this high-level shape:

- `nbformat` and `nbformat_minor`
- `metadata`
- `cells` (a list of markdown and code cells)

When editing `.ipynb` files programmatically:

- Preserve `nbformat` and `nbformat_minor` from the template.
- Keep `cells` as an ordered list; do not reorder unless intentional.
- For code cells, set `execution_count` to `null` when unknown.
- For code cells, set `outputs` to an empty list when scaffolding.
- For markdown cells, keep `cell_type="markdown"` and `metadata={}`.
- For nbformat 4.5 and newer, give every cell a unique schema-valid `id`.
- Do not stamp `language_info.version` unless it was verified against the kernel
  that will execute the notebook; the field is optional.

Prefer reading a bundled template with `nbformat` or constructing cells with
`nbformat.v4` instead of hand-authoring raw notebook JSON.
