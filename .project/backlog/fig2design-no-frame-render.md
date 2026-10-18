# fig2design: no raster/HTML render of a frame

Status: worked-around (`tools/figma-render.ts`)

## Context
To compare `apps/site` with the design we need a picture of the Figma frame at 1440 px. fig2design 0.1.0
writes JSON + images only; the `.fig` zip only carries a 92x400 `thumbnail.png`.

## Repro
`npx fig2design@0.1.0 parse saas.fig -o out` then look for a PNG of frame `1:10`: there is none
(`help parse` lists manifest/document/variables/styles/components/frames/images only).

## Impact
Every consumer has to write its own rasterizer (we wrote a 120-line absolute-position HTML renderer +
Chrome screenshot). Results depend on that renderer (text metrics, rotation, strokes).

## Proposed fix
Add `fig2design render <file.fig> --frames <id> --out <dir> [--scale 1]` (or `parse --preview`) that
emits a reference HTML/SVG per frame, optionally rasterised when a browser is available. Document
that it is approximate (no effects/blend modes), like our script.
