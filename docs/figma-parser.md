# The Figma parser (fig2design)

[`fig2design`](https://www.npmjs.com/package/fig2design) is an npm CLI and library. Its npm description: "Parse a Figma .fig file fully offline into a framework-neutral design dump (JSON + images/)". This repo pins `0.1.0` (MIT) and runs it with `npx`, so nothing is installed. It needs no Figma API token and no network access to Figma.

The package's `repository` field points to `github.com/codegen-x/figma-cli`, which is **not public**, so there is no source link here. This page is written from the package metadata (`npm view fig2design`), the call in [`tools/extract.sh`](../tools/extract.sh) and the committed dump in [`fixtures/figma/`](../fixtures/figma). Anything about the parser's internals or options beyond what appears here is **unverified**.

## Run it

```bash
FIG=/path/to/file.fig bun run extract     # default FIG: figma.fig in fixtures/site.config.json
```

`tools/extract.sh` runs `npx -y fig2design@0.1.0 parse "$FIG" --out fixtures/figma --no-config` from `/tmp` (see [the backlog note](../.project/backlog/fig2design-npx-inside-source.md)) and refuses a `.fig` inside the repo. The `.fig` is never committed. Only `parse`, `--out` and `--no-config` are used here; other subcommands and flags are unverified.

## Dump layout

Every JSON file has a `schema` string of the form `fig2design/<kind>@1`.

| File | `schema` | Contents (as found in this dump) |
|---|---|---|
| `manifest.json` | `manifest@1` | `tool {name, version}`, `source {file, path, format, sha256, bytes, figVersion, fileKey}`, `generatedAt`, `filters {page, frames}`, `counts`, `files`, `notice` |
| `document.json` | `document@1` | `name`, `figVersion`, `pages[] {id, name, type, visible, frames[]}`, `figMeta` |
| `frames/<id>.json` | `frame@1` | one file per top-level frame; the id uses a dash (`1-10` = node `1:10`) |
| `images/index.json` + `images/<hash>.<ext>` | `images@1` | the image fills |
| `variables.json` | `variables@1` | colour variables |
| `components.json` | `components@1` | `sets[]`, `components[]` (both empty in this file) |
| `styles.json` | `styles@1` | `styles[]` (empty in this file) |
| `outline.txt` | — | a human-readable tree. It was committed with the first dump, and nothing here regenerates it |

### `frames/<id>.json`

Top level:

| Field | Example (`1-10.json`) |
|---|---|
| `id`, `name`, `type`, `pageId`, `pageName` | `"1:10"`, `"Home"`, `"FRAME"`, `"0:1"`, `"Page 1"` |
| `size` | `{ "w": 1440, "h": 6288 }` |
| `modes` | `{}` |
| `stats` | `{ nodes: 268, texts: 84, images: 12, icons: 35, vectors: 0 }` |
| `sections[]` | direct children `{ k, name, type, y, w, h }` (9 here: Navbar … Footer) |
| `layoutDigest` | `sections`, `typeScale[] {size, weight, family, count}`, `radii[] {value, count}` (40×23, 9999×9, 20×9, 100×4), `roles` |
| `components`, `usedVariables` | `[]` here |
| `images` | image hashes used in the frame |
| `fonts[]` | `{ family, style, weight, fontStyle, lineHeightRatio, digest }` |
| `vectorAssets` | `{ <asset id>: "<svg …>" }`: flattened icons and logos as SVG strings |
| `root` | the node tree |

Each node in `root`:

- `k` (node id), `name`, `type` (`FRAME`, `TEXT`, `VECTOR`, `ROUNDED_RECTANGLE`, `ELLIPSE` in this file);
- `x`, `y`, `w`, `h` relative to the parent, and `abs: [x, y]` on the page;
- `clip`, `radius`, `layout`, `constraints {h, v}`;
- `fills[]` / `strokes[]`: paints such as `{ type: "solid", color: "#rrggbb", a? }` or `{ type: "image", … }`;
- `stroke`;
- `text` on TEXT nodes: `{ chars, font {family, style, weight}, size, lh {value, units}, align, valign, resolved }`;
- `asset` and `flatten {reason, asset}` on vector icons, keyed into `vectorAssets`;
- `children[]`.

### `images/index.json`

`images[]`: `{ hash, file: "images/<hash>.<ext>", ext, bytes, source: "zip", width, height, usedBy[] {nodeId, name, field: "fillPaints"} }`. `width` and `height` are `null` for some images, and so is `usedBy`.

### `variables.json`

- `collections[] {id, name, modes[] {id, name}, variables[]}`.
- `orphans[]`: variables outside a collection. In this file there are 7 colours: Dark, Grey Text, Pink, Light Purple, Orange, Light Blue and Light Grey.
- Each variable: `{ id, name, type: "COLOR", valuesByMode: { default: { hex, rgba, chain[] } }, collectionId }`.

## Consumers in this repo

| Script | Reads | Produces |
|---|---|---|
| [`tools/content.ts`](../tools/content.ts) | `frames/<frame>.json` (text by node id: `txt("1:91")`; `vectorAssets` → SVG media), `images/index.json` (hash → media record, width/height) | contract records in `fixtures/content/records/` |
| [`tools/tokens.ts`](../tools/tokens.ts) | `variables.json` (named colours), every `frames/*.json` (`fills`/`strokes` usage counts), `layoutDigest.typeScale` | `fixtures/tokens/*`, `packages/tokens/theme.css`, the app brand CSS |
| [`tools/shots.ts`](../tools/shots.ts) | `frames/<frame>.json` (`root.children` rects by section name) plus the HTML from `tools/figma-render.ts` | Figma-vs-site section crops and `report.json` |

The `<frame>` comes from `figma.frame` in [`fixtures/site.config.json`](../fixtures/site.config.json).

## Not generated from the dump

[`packages/blocks/defs/figma.ts`](../packages/blocks/defs/figma.ts) contains the 10 blocks copied from this design. They are **hand-written** in the block DSL by reading the frame (sizes, gaps, radii), and no script turns frames into block defs. The same goes for `fixtures/tokens/mapping.json`, which assigns shadcn roles by hand.
