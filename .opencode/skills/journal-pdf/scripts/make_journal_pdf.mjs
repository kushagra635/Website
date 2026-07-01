#!/usr/bin/env node
// Standardized journal -> PDF report generator.
// Pure formatting: it lays out exactly what the student wrote, nothing added.
//
// Usage:
//   node make_journal_pdf.mjs --repo <path> --name "Student Name" \
//        [--class "Summer AI Class"] [--out file.pdf]
//
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";

// ---- args -----------------------------------------------------------------
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const repo = args.repo;
const studentName = args.name || "Student";
const className = args.class || "Summer AI Class";
if (!repo) { console.error("--repo is required"); process.exit(1); }

const journalDir = join(repo, "journal");
if (!existsSync(journalDir)) { console.error("No journal/ dir in", repo); process.exit(1); }

const SECTIONS = [
  { key: "Goals for today", label: "Goals for today" },
  { key: "What I learned", label: "What I learned" },
  { key: "What was hard", label: "What was hard" },
  { key: "What surprised me", label: "What surprised me" },
];

// ---- parse ----------------------------------------------------------------
const dateFile = /^(\d{4}-\d{2}-\d{2})\.md$/;
const files = readdirSync(journalDir).filter((f) => dateFile.test(f)).sort();
if (files.length === 0) { console.error("No journal/YYYY-MM-DD.md entries found"); process.exit(1); }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderBody(lines) {
  const out = [];
  let para = [], bullets = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${para.map(esc).join("<br>")}</p>`); para = []; } };
  const flushBullets = () => {
    if (bullets.length) { out.push(`<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`); bullets = []; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    const isBullet = /^[-*]\s*\S/.test(line);
    if (isBullet) { flushPara(); bullets.push(line.replace(/^[-*]\s*/, "")); }
    else { flushBullets(); para.push(line); }
  }
  flushPara(); flushBullets();
  return out.join("\n");
}

function parseEntry(md) {
  const sections = {};
  let cur = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*?)\s*$/);
    if (h) { cur = h[1]; sections[cur] = []; continue; }
    if (cur == null) continue;
    const t = line.trim();
    if (t === "" || t === "-" || t.startsWith("<!--") || t.startsWith("#")) continue;
    sections[cur].push(line);
  }
  return sections;
}

const entries = files.map((f) => ({
  iso: f.replace(/\.md$/, ""),
  sections: parseEntry(readFileSync(join(journalDir, f), "utf8")),
}));

const fmtLong = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });

const filledCount = entries.filter((e) =>
  SECTIONS.every((s) => (e.sections[s.key] || []).length > 0)
).length;

const dateRange = entries.length === 1
  ? fmtLong(entries[0].iso)
  : `${fmtLong(entries[0].iso)} – ${fmtLong(entries.at(-1).iso)}`;

const generated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// ---- html -----------------------------------------------------------------
const entriesHtml = entries.map((e) => {
  const secs = SECTIONS.map((s) => {
    const content = e.sections[s.key] || [];
    const body = content.length ? renderBody(content) : `<p class="empty">— not filled in —</p>`;
    return `<div class="section"><div class="seclabel">${s.label}</div><div class="secbody">${body}</div></div>`;
  }).join("\n");
  return `<article class="entry"><header class="entryhead"><h2>${fmtLong(e.iso)}</h2><span class="iso">${e.iso}</span></header>${secs}</article>`;
}).join("\n");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<style>
  @page { size: Letter; margin: 22mm 20mm 20mm 20mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; color: #1c1b22; font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; font-size: 11pt; line-height: 1.55; }
  .cover { border-bottom: 3px solid #3b3a6b; padding-bottom: 14px; margin-bottom: 26px; }
  .kicker { font-size: 9pt; letter-spacing: .22em; text-transform: uppercase; color: #6f6d86; font-weight: 700; }
  .cover h1 { font-size: 26pt; margin: 6px 0 2px; color: #16151c; font-weight: 800; letter-spacing: -.01em; }
  .repo { font-size: 11pt; color: #4a4860; margin-bottom: 12px; }
  .meta { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 9.5pt; color: #6f6d86; }
  .meta b { color: #3b3a6b; font-weight: 700; }
  .entry { margin: 0 0 22px; padding: 16px 18px; border: 1px solid #e7e6ee; border-radius: 10px; background: #fbfbfd; break-inside: avoid; }
  .entryhead { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #ececf3; padding-bottom: 8px; margin-bottom: 12px; }
  .entryhead h2 { font-size: 13.5pt; margin: 0; color: #16151c; font-weight: 700; }
  .entryhead .iso { font-size: 8.5pt; color: #9a98ad; font-variant-numeric: tabular-nums; letter-spacing: .04em; }
  .section { margin-bottom: 12px; }
  .section:last-child { margin-bottom: 0; }
  .seclabel { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: #3b3a6b; font-weight: 700; margin-bottom: 3px; }
  .secbody { font-family: Georgia, "Times New Roman", serif; font-size: 10.5pt; color: #2a2933; }
  .secbody p { margin: 0 0 6px; }
  .secbody p:last-child { margin-bottom: 0; }
  .secbody ul { margin: 0 0 6px; padding-left: 18px; }
  .secbody li { margin: 0 0 3px; }
  .secbody .empty { color: #b3b1c2; font-style: italic; font-family: -apple-system, sans-serif; font-size: 9.5pt; }
  .foot { position: fixed; bottom: 8mm; left: 0; right: 0; font-size: 8pt; color: #b3b1c2; display: flex; justify-content: space-between; }
</style></head>
<body>
  <div class="cover">
    <div class="kicker">Daily Journal</div>
    <h1>${esc(studentName)}</h1>
    <div class="repo">${esc(className)}</div>
    <div class="meta">
      <span><b>Period</b> ${dateRange}</span>
      <span><b>Entries</b> ${entries.length}</span>
      <span><b>Complete</b> ${filledCount} of ${entries.length}</span>
      <span><b>Generated</b> ${generated}</span>
    </div>
  </div>
  ${entriesHtml}
  <div class="foot"><span>${esc(studentName)} · Daily Journal</span><span>${esc(className)}</span></div>
</body></html>`;

// ---- render ---------------------------------------------------------------
const htmlPath = join(tmpdir(), `journal-${Date.now()}.html`);
const outPath = args.out || join(journalDir, "journal-report.pdf");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(htmlPath, html);

function findChromium() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  // Playwright's cached browsers (mac + linux locations).
  const caches = [
    join(homedir(), "Library/Caches/ms-playwright"),
    join(homedir(), ".cache/ms-playwright"),
  ];
  for (const root of caches) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root)
      .filter((d) => d.startsWith("chromium_headless_shell-") || d.startsWith("chromium-"))
      .sort().reverse();
    for (const d of dirs) {
      for (const rel of [
        "chrome-mac/headless_shell",
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        "chrome-linux/headless_shell",
        "chrome-linux/chrome",
      ]) {
        const p = join(root, d, rel);
        if (existsSync(p)) return p;
      }
    }
  }
  // Installed desktop browsers (macOS app bundles).
  const apps = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    // common linux paths
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge",
  ];
  for (const p of apps) if (existsSync(p)) return p;
  return null;
}

const chrome = findChromium();
if (!chrome) {
  console.error(`No Chromium-based browser found to render the PDF.

Fix one of these, then re-run:
  • install Google Chrome, or
  • run:  npx playwright install chromium, or
  • set CHROME_BIN=/path/to/chrome

Manual fallback: open this file in a browser and Print → Save as PDF
(Letter, "Background graphics" on):
  ${htmlPath}`);
  process.exit(1);
}

const headlessFlag = /headless_shell/.test(chrome) ? "--headless" : "--headless=new";
execFileSync(chrome, [
  headlessFlag, "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
  "--run-all-compositor-stages-before-draw", "--virtual-time-budget=3000",
  `--print-to-pdf=${outPath}`, `file://${htmlPath}`,
], { stdio: "inherit" });

console.log("PDF:", outPath);
console.log("Entries:", entries.length, "| Complete:", filledCount, "| Browser:", chrome);
