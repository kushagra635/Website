# File Anatomy

Consistent file structure reduces search time and makes diffs easier to review.

## HTML

Use semantic landmarks:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page title</title>
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <header>...</header>
    <nav>...</nav>
    <main>
      <h1>...</h1>
    </main>
    <footer>...</footer>
    <script type="module" src="js/main.js"></script>
  </body>
</html>
```

Check one `<h1>`, logical heading order, labeled controls, useful image text,
keyboard access, and repository-relative asset paths.

## CSS

Keep this order:

1. custom properties and design tokens;
2. reset and base elements;
3. layout;
4. components;
5. utilities;
6. responsive and print rules.

Reuse tokens instead of scattering literal colors and sizes. Keep selectors
local enough that changing one component does not alter unrelated pages.

## JavaScript

Give each module one clear responsibility:

1. imports and constants;
2. state;
3. pure helpers;
4. DOM or external effects;
5. event wiring;
6. initialization.

Name thresholds and durations. Keep external input validation at the boundary.
Keep setup and cleanup adjacent or clearly linked.

## Review

- Does the filename match its responsibility?
- Can the main state and entry point be found quickly?
- Is behavior duplicated?
- Are unrelated concerns coupled?
- Does the diff change only the intended contract?
