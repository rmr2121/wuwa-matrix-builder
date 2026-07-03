# WuWa Endstate Matrix Team Builder

Rebuilt from the compiled bundle actually referenced by `index.html`
(`index-Ai7O84mb.js`), not `index-DMPJM-W3.js` — the two are identical except
that `Ai7O84mb.js` has the corrected elements for Luuk Herssen, Lynae,
Qiuyuan, Rebecca, and Zani. Those corrections are preserved here.

Note: no build in the uploaded repo actually contained a "Best Teams" tab —
only the single team-builder view shown here. This rebuild matches what was
actually shipped.

## What changed in this pass

- Added Xuanling (Havoc, main DPS), Suisui (Glacio, support), and
  Rover: Electro (Electro, sub DPS) to the roster.
- Chisa moved into the 2x-usable support pool alongside Shorekeeper, Verina,
  Mornye, Baizhi, Buling.
- Updated `src/data/dprData.js` with the new/changed team values you listed
  (Xuanling pairings, Sigrika, Aemeath Rupture, Lucy/Rebecca, Luuk Herssen),
  cross-checked against the rows in `DPR_Calc_Results.xlsx` where possible.
- Replaced the element badge icons with the 6 PNGs you provided (chroma-keyed
  to transparent, resized to 96x96).
- Xuanling, Suisui, and Rover: Electro have no portrait art yet, so they use
  the same initials-fallback tile as any unknown character. Drop PNGs into
  `src/data/portraits.js` (same base64 data-URL format as the rest) whenever
  you have art for them.

## Scope note on DPR_DATA

`DPR_DATA` only includes the specific team values you listed, not a full
re-scan of all ~40 character tabs. The "Team damage with different setups"
tables use inconsistent shorthand across tabs (SK, SRover, Moryne, etc.) and
a fully automated pass risked silently mis-mapping teams. If you want the
whole sheet re-synced, it's doable as a follow-up with your review of the
parsed team names before they go in.

## Dev

```
npm install
npm run build
```

The repo root (`assets/`, `index.html`, `404.html`, `.nojekyll`) is the
built, ready-to-push GitHub Pages output. `src/` is the source if you want to
keep developing.
