# Wuthering Waves — Endstate Matrix Team Builder

A team-planning tool for Wuthering Waves. Lay out up to 20 teams at once, see real DPR numbers pulled straight from a community damage-calc spreadsheet, and keep track of how many copies of your limited supports (Shorekeeper, Verina, Mornye, Baizhi, Buling, Chisa, Suisui) you have left to hand out.

**Live site:** https://rmr2121.github.io/wuwa-matrix-builder/

---

## Features

### Team Builder
- **20 team slots**, 3 characters each (Main DPS / Sub DPS / Support)
- **Drag & drop** on desktop, **tap-to-assign** on mobile
- **Auto-scroll while dragging** — drag a character near the top/bottom edge of the teams panel and it scrolls automatically, so filling out teams further down the list doesn't require letting go mid-drag
- **Support usage tracker** in the header — shows at a glance how many of your 2×-usable supports (SK, Verina, Mornye, Baizhi, Buling, Chisa, Suisui) are still free
- **Zoom controls** (70%–130%) for fitting more on screen
- Progress is saved automatically to your browser (`localStorage`) — refresh and your teams are still there

### DPR — sheet data only
- When a team's exact 3-character combination exists in the source spreadsheet, the **DPR is shown directly** — no estimates, no simulation, just the number from the sheet.
- If a team isn't in the sheet, no fake number is shown. Instead, a **"Simulate on phro.love"** button appears: one click copies the team's internal character names to your clipboard and opens phro.love's team simulator in a new tab, so you can drop them in and get a result from the real calculator.

### Best Teams tab
- One entry per **Main DPS** character in the game, listed in release order
- Ranked list of their best known team compositions, sourced from the sheet, with DPR and % relative to their best setup
- Characters without sheet data yet show a plain "no data" message rather than a guess

### Roster filters
- Search by name
- Filter by role: Main DPS / Sub DPS / Support
- **Owned Only** — mark which characters you actually own (small toggle badge on each portrait) and filter the roster down to just those, so it's obvious who's actually available to fill your 3 slots
- **Show Leaks** — toggle visibility of characters that aren't officially confirmed/released yet (currently: Hsin, Suoming)

---

## Tech

- React 18 + Vite
- No backend — character portraits and element icons are embedded as base64, all data (DPR table, character roster, weapon lists) lives in the bundle
- Deployed as a static site to GitHub Pages

## Updating character/team data

All the DPR numbers and "Best Teams" rankings come from a community-maintained damage calculation spreadsheet (`DPR_Calc_Results.xlsx`). When the sheet gets new data:

1. Export/share the updated `.xlsx`
2. Team totals live in the `DPR_DATA` object in `src/App.jsx`, keyed by the three character names sorted alphabetically and joined with `|` (e.g. `"Chisa|Hiyuki|Lucilla": 2531925`)
3. Per-character rankings for the Best Teams tab live in `BEST_TEAMS`, keyed by character name

## Adding a new character

1. Add an entry to the `CHARACTERS` array (`name`, `element`, `stars`)
2. Add the character to `ROLES.main_dps` or `ROLES.sub_dps` (anything not in either list defaults to `support`)
3. Add their position to the `ORDER` array to control where they appear in the roster (kept in release order)
4. If they're 2×-usable (like a support), add them to `DOUBLE_USABLE`
5. If they're not officially released yet, add them to `UPCOMING_CHARS` so the "Show Leaks" toggle can hide them
6. Add their portrait to `CHAR_ICONS` (base64 PNG) — until then they'll show as colored initials
7. Add their internal phro.love identifier to `PHRO_NAMES` if you want the "Simulate" button to work for their teams

---

## Deploying

```
npm install
npm run build
```

This produces a `dist/` folder. Push its **contents** (not the folder itself) to the root of the GitHub Pages branch, along with `.nojekyll` and a `404.html` (a copy of `index.html`, needed for client-side routing on refresh).
