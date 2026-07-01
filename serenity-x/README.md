# Serenity X

A fully client-side web operating system demo built with vanilla HTML, CSS, and JavaScript. It boots into a polished desktop environment with draggable windows, a top bar, taskbar, app drawer, widgets, and a handful of mini apps.

## Live Demo

**[https://kushagra635.github.io/Website/serenity-x/](https://kushagra635.github.io/Website/serenity-x/)**

> Copy and share the link above.

## What It Is

Serenity X simulates a modern desktop OS inside the browser. Everything runs in a single `index.html` file — no build step, no external UI frameworks. Open the demo link, wait for the boot animation, and you land on a desktop with icons, a searchable launcher, system tray widgets, and resizable windows.

## Features

- **Boot screen** — animated logo, loading bar, and status text
- **Desktop environment** — animated wallpaper, desktop icons, context menu
- **Window manager** — open, close, minimize, maximize, drag, and resize windows
- **Top bar** — power menu, music widget, signal/battery indicators, clock/calendar, notifications
- **Taskbar + app drawer** — running apps, search, and an expandable app launcher
- **Mini apps** — Browser, VS Code-like editor, Terminal, Calculator, File Manager, Settings, System Monitor, App Market, Phone, Pac-Man, and About
- **Control panel** — quick toggles and sliders from the right edge
- **Sleep overlay** — lock screen with time, weather, music, and notifications

## Tech Stack

- Plain HTML5, CSS3, and vanilla JavaScript
- Canvas-based particle background
- Express server (`server.js`) for local development and an optional `/proxy` endpoint
- No frameworks or build tools

## Run Locally

1. Open `index.html` directly in a modern browser for the static experience.

2. Or run the Node server for the full experience (includes the in-app browser proxy):

   ```bash
   npm install
   npm start
   ```

   Then visit `http://localhost:3000`.

## Notes

- On GitHub Pages the OS UI runs entirely in the browser, so the desktop, apps, and animations work right away.
- The in-app browser's `/proxy` route requires the Node.js server and cannot run on static GitHub Pages hosting.
- The project is self-contained in `index.html`; `package.json` and `server.js` are only needed for the local/proxy server.
