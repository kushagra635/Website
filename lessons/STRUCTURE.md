# Repository Structure

Folder names should make the location of a file predictable.

```text
/
├── index.html
├── pages/
├── css/
├── js/
├── images/
├── projects/
├── lessons/
├── journal/
├── README.md
└── AGENTS.md
```

Keep at the root:

- the primary entry point;
- repository-wide documentation and configuration; and
- files required at root by the runtime or hosting platform.

Place page-specific content, styles, scripts, images, and project artifacts in
named directories. Use lowercase hyphenated filenames unless the existing
project has a different established convention.

When moving files:

1. inventory every reference;
2. move one category at a time;
3. update links, imports, asset URLs, and documentation;
4. open every affected page with the console and network panel visible; and
5. commit the move separately from behavioral changes.

Structure is successful when a new file has one obvious location and an existing
file can be found from its name and responsibility.
