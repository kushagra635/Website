# ipywidgets Guidance for Notebook Workflows

Use this reference when notebook tasks require interactive controls.

## When widgets help

- Repeatedly re-running analysis with small parameter changes.
- Visual QC loops where rapid adjustment is more important than script purity.
- Demonstration notebooks where users should explore parameter space safely.

## Default widget pattern

Prefer explicit widget wiring for non-trivial notebooks:

```python
import ipywidgets as widgets
from IPython.display import display

out = widgets.Output()

sigma = widgets.FloatSlider(
    description="sigma",
    min=0.1,
    max=5.0,
    step=0.1,
    value=1.0,
    continuous_update=False,  # avoid expensive recompute on every drag
)

def render(change=None):
    with out:
        out.clear_output(wait=True)
        # run compute/plot code with sigma.value
        print(f"sigma={sigma.value}")

sigma.observe(render, names="value")
display(widgets.VBox([sigma, out]))
render()
```

## Performance and callback hygiene

- Set `continuous_update=False` for expensive computations.
- Use one `Output` area and `clear_output(wait=True)` to prevent output spam.
- Avoid stacking duplicate callbacks:
  - if rebuilding UI in the same kernel, call `widget.unobserve(handler, names="value")` before re-registering.
- Keep compute logic in plain functions that also run without widgets.

## Reproducibility rules

- Keep a non-interactive fallback path:
  - define defaults in plain Python variables/config objects.
  - ensure results can be reproduced by running cells top-to-bottom without manual UI actions.
- Do not rely on implicit widget state as the only source of truth.
- For git-friendly notebooks, avoid persisting large widget state blobs unless explicitly required.

## Widget state and metadata

Some environments store widget state in notebook metadata. This can create noisy diffs.

- This course commits cell outputs; that does not require widget state. Do not
  save widget state just because outputs are saved.
- Persist widget state only when a demo needs it, and say so in the notebook
  text.

## Common failure cases

- Widgets do not render:
  - ensure `ipywidgets` is installed in the active kernel environment.
- Callback runs but no visible output:
  - route display/print calls through a `widgets.Output()` context.
- Notebook hangs/slows:
  - reduce callback frequency, disable continuous updates, and cache heavy intermediate results.
