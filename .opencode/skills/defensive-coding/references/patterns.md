# Good patterns (worked examples)

Each pattern shows the version that hides a bug and the version that exposes it.
Read the bad case first and predict what it does when the input is wrong.

## Boundary validation once

The boundary is where data arrives from outside the program: a fetch response, a
form field, a JSON file, a camera frame, a command-line argument. Validate there,
then trust the result.

```js
// Bad: every function re-checks, and none of them can fix the problem
function drawChart(data) {
  if (!data || !Array.isArray(data.points)) return;   // silently draws nothing
  ...
}
function summarize(data) {
  if (!data || !Array.isArray(data.points)) return 0; // silently reports zero
  ...
}
```

```js
// Good: one boundary, one failure, then a trusted shape
function parseReport(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.points)) {
    throw new Error(`report.points must be an array, got ${typeof data.points}`);
  }
  return data;
}

function drawChart(report) { /* report.points is an array here */ }
function summarize(report) { /* same */ }
```

The bad version renders an empty chart and a zero total for a corrupt file, and
both look like real answers. The good version names the file problem once.

## A fallback must not fabricate data

```python
# Bad: a missing measurement becomes a real-looking zero
def read_fps(path):
    try:
        return json.loads(Path(path).read_text())["fps"]
    except Exception:
        return 0.0
```

A downstream average over these values is now wrong and nothing says so. This is
the failure `science` and `benchmarking` exist to prevent.

```python
# Good: absence stays visible
def read_fps(path):
    payload = json.loads(Path(path).read_text())
    if "fps" not in payload:
        raise KeyError(f"{path} has no 'fps' field")
    return payload["fps"]
```

If some runs legitimately lack the field, return `None` and make every caller
handle it, or filter those runs out explicitly and report how many were dropped.

## Catch a specific error, add context, re-raise

```js
// Bad: the real cause is gone
try {
  const res = await fetch(url);
  const body = await res.json();
  render(body);
} catch (e) {
  console.log("something went wrong");
}
```

```js
// Good: narrow scope, specific handling, preserved cause
const res = await fetch(url);
if (!res.ok) {
  throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
}
const body = await res.json();   // a JSON error here is a real bug worth seeing
render(body);
```

Keep the `try` around only the operation that can fail. A `try` wrapped around
twenty lines catches failures you never considered.

## Retry only transient failures, and bound the retry

A network timeout is transient. A 404, a malformed file, and a
`TypeError` are not — retrying them just delays the error and multiplies the
requests.

```js
// Good: bounded, transient-only, and it eventually gives up loudly
async function fetchWithRetry(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.status >= 500) throw new Error(`server ${res.status}`);
      return res;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
}
```

## Make invalid state hard to construct

```js
// Bad: any caller can build a half-configured run
const run = { label: "resize", warmup: 2 };   // runs is missing; nobody notices
```

```js
// Good: one constructor owns the rule
function createRun({ label, warmup, runs }) {
  if (!label) throw new Error("label required");
  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error(`runs must be a positive integer, got ${runs}`);
  }
  return Object.freeze({ label, warmup: warmup ?? 1, runs });
}
```

Once `createRun` is the only way to make a run, no downstream function needs to
check the fields again.

## An unused switch is not flexibility

```js
// Bad: added "in case we need it", never set anywhere
function render(data, { legacyMode = false, experimental = false } = {}) { ... }
```

Every unused branch is code that is never tested and never true. Delete it; add
the switch when a real caller needs it.

## Do not pre-probe what the platform already handles

```js
// Bad: guessing which fonts exist
const font = fontExists("Inter") ? "Inter" : "Helvetica";
```

```css
/* Good: hand the browser the list and let it substitute */
font-family: Inter, Helvetica, system-ui, sans-serif;
```

The same rule applies to feature detection the runtime already performs and to
availability checks the API raises on anyway.
