# fig2design: `lh.units: "PERCENT"` is percent of the font's intrinsic line height, not of the font size

Status: worked-around

**Context.** `fixtures/figma/frames/1-10.json` text nodes carry `"lh": {"value": 100, "units": "PERCENT"}`. Reading that as CSS
`line-height: 100%` (= 1 × font-size) makes every such heading too short: "What our users say" (60px) is 73px tall in Figma
(= Inter's normal line height ≈ 1.21), 60px on the site. Box heights in the dump confirm it (`h` 73 for one line, 146 for two,
309 for three lines of 85px).

**Repro.** `jq '.. | objects | select(.text?) | [.text.resolved.size, .text.resolved.lh, .h]' fixtures/figma/frames/1-10.json`.

**Impact.** -13px per section title, -54px for the CTA title; it was the main source of the Figma-vs-site page height drift.

**Workaround (this repo).** Section titles `leading-tight` (1.25), `--text-display--line-height: 1.2` in tools/tokens.ts.

**Proposed fix.** Document the unit in the fig2design schema, or emit a resolved `lhPx` / CSS-ready `lineHeight` ("normal" for 100% PERCENT).
