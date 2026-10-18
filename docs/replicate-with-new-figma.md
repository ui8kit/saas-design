# Replicate with a new Figma file

How to run this pipeline on a **different** `.fig` file. The repo was built for one frame (`Home`, node `1:10`, of the Habitus landing page). Some scripts hard-code that frame and its node ids; the [table below](#file-specific-code-you-must-change) lists exactly where. Everything else is generic.

> Verified in this repo: every command on this page runs on the current file. Untested: actually swapping in a second `.fig`; the steps below follow from reading the scripts. When you do it, log what breaks in `.project/backlog/`.

## 0. Start green

```bash
bun install && bun run check        # "all checks passed"
```

Work on a branch or in a fork. The committed `fixtures/figma` will be replaced.

## 1. Inspect and extract

Keep the `.fig` **outside** the repo.

```bash
cd /tmp && npx -y fig2design@0.1.0 list /abs/path/new.fig     # pages + top-level frames with ids
# e.g.  FRAME  Home  1440×6288  (1:10)
cd -
FIG=/abs/path/new.fig bun run extract                         # → fixtures/figma (frames/<id-with-dash>.json, images/, variables.json …)
```

- `tools/extract.sh` always runs `fig2design@0.1.0 parse "$FIG" --out fixtures/figma --no-config`.
- To limit the dump, use the fig2design option `--frames <id|name,…>` (or `--page`). `extract.sh` does **not** pass extra flags, so run `npx -y fig2design@0.1.0 parse "$FIG" --out "$PWD/fixtures/figma" --no-config --frames 1:10` yourself, from `/tmp`. Running npx inside a checkout named fig2design fails (see backlog `fig2design-npx-inside-source.md`).
- Check `fixtures/figma/manifest.json` (`source.sha256`, `counts`) and `git diff --stat fixtures/figma`.

List the sections of the frame. The direct children with their y and height become your blocks:

```bash
bun -e 'const f=await Bun.file("fixtures/figma/frames/1-10.json").json(); console.table(f.sections.map(s=>({k:s.k,name:s.name,y:s.y,w:s.w,h:s.h})))'
```

The frame JSON also has `layoutDigest.typeScale`, `radii` and `roles`, and `root` (a tree of `{k, name, type, x, y, w, h, fills, children, abs, text?}`). `fixtures/figma/outline.txt` is a human-readable tree, but **no script in this repo generates it**; it was committed with the initial dump. Regenerate it by hand if you want it.

Reference render for later comparison (writes HTML outside the repo):

```bash
bun tools/figma-render.ts --frame <id-with-dash> --out /workspace/shots-saas
```

## 2. Map the palette to shadcn tokens

1. Look at the colors. `fixtures/figma/variables.json` holds named variables, if the file has any. `bun run tokens` also writes `fixtures/tokens/palette.json` with usage counts from the frame. Run it once, even though it will initially map the wrong colors.
2. Edit **`fixtures/tokens/mapping.json`**, the only hand-edited token file:
   - `light` / `dark`: every shadcn role (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar-*`). Each value is a Figma variable name or a hex.
   - `brand` / `brand.dark`: colors with **no** shadcn role (e.g. an extra accent used only for decoration). These become `--brand-*` in the **app** `brand.css` only, never in packages.
   - `radius.base`, `font.sans`.
   - Dark values: derive them from the dark surfaces of the design. Make pastel tiles that carry text deep tones, so white text keeps ≥ 4.5:1 contrast.
3. Regenerate and check:

```bash
bun run tokens            # theme.css, app brand.css, tokens.json, palette.json, brand.contract.json
bun run brand:emit && bun run brand:check
```

**Brand tokens or not?** Prefer a shadcn role whenever a color has a UI meaning (surface, text, action, border, chart). Use `--brand-*` only for decoration that packages never need. `bun run check` fails if `packages/` references a brand token.

## 3. Map frames to blocks

For each section of the frame:

1. **Reuse** a block from `packages/blocks/defs/` (`figma.ts` = blocks copied from this design, `catalog.ts` = generic blocks) if the structure matches, or
2. **Write a new block** with the DSL (see [architecture.md → Blocks](architecture.md#5-blocks-packagesblocks)):
   - `block({ id, title, category, description, figma: "<node id> <name>", schema, root })`;
   - `root` is a `c("Block", { tag: "section" | "header" | "footer" | … })`, never nested in another Block;
   - compose from primitives (`Container`, `Stack`, `Group`, `Grid`, `Card`, `Title`, `Text`, `Button`, `List`, `Image` …);
   - `css:` takes utilities **on the 8 + 4 grid with token colors** (snap Figma px to the nearest step and log deliberate deviations);
   - use `kit:` for repeated compositions; bind data with `$("path")`.
3. Register it in `packages/blocks/defs/index.ts`, keeping the catalog at 45 blocks or fewer.

```bash
(cd packages/blocks && bun run generate && bun run parity)
bun tools/ui8px-policy.ts && npx -y ui8px@latest lint
```

Lint rejects a utility? Pick an on-grid one, or add a **reviewed** entry to `tools/ui8px/allowed.extra.json`.

## 4. Write fixtures and views

- **Content records.** `tools/content.ts` reads texts by **Figma node id** (`txt("1:91")`), images by **hash**, and vectors by node. Rewrite its mapping section for the new frame. Content that is not in Figma (FAQ answers, demo data) goes into `fixtures/content/source/authored.json`. The block catalog metadata goes into `fixtures/content/source/blocks.json`.
- **Views.** `tools/views.ts` turns records into block props (`fixtures/views/home.json` = page block list with `region`; `blocks.json` = preview data per block). Each view must match the block's `schema`.

```bash
bun run content && bun run contract && bun tools/views.ts
```

## 5. Regenerate everything and build

Follow the [pipeline order in AGENTS.md](../AGENTS.md#pipeline-order):

```bash
(cd packages/ui && bun run generate && bun run parity)
(cd packages/blocks && bun run generate && bun run parity)
bun tools/ui8px-policy.ts && npx -y ui8px@latest lint
bun run site:build
(cd apps/design-svelte && bun run generate && bun run build)
bun run check
```

## 6. Measure drift and iterate

```bash
bun run render:figma                  # NOTE: package script uses the default frame 1-10; call tools/figma-render.ts --frame <id> otherwise
bun run shots                         # report.json: per section figma y/height vs site y/height, compare/*.png
bun tools/measure.ts '.ui-<block>-title' '.ui-<block>-card'   # exact box/typography of built elements at 1440px
```

Loop:
1. Pick the largest `|delta.height|` in `report.json`.
2. Compare `compare/<section>.png` by eye.
3. Measure the elements involved with `tools/measure.ts`.
4. Fix the block `css:` on the grid, regenerate, rebuild, and rerun `shots`.

Stop when the remaining deltas come only from grid snapping. Log those in `.project/backlog/`.

Then check dark mode and mobile with `bun run shots:modes` and `bun run test:behaviors`.

## File-specific code you must change

| File | What is specific to the current design |
|---|---|
| `tools/content.ts` | reads `fixtures/figma/frames/1-10.json`; text node ids (`"1:91"` …), image hashes → media ids, section ↔ node map, page title |
| `tools/tokens.ts` | reads `frames/1-10.json` for usage counts and type scale; brand-os `meta` (`name: "Habitus"`, `slug`, description, image-treatment notes) |
| `tools/shots.ts` | reads `frames/1-10.json` and `figma/1-10.html`; `SECTIONS` table maps Figma section names → slugs → block ids |
| `tools/figma-render.ts`, `package.json` `render:figma` | default `--frame 1-10` |
| `tools/extract.sh` | default `FIG=/workspace/fig-fixtures/saas.fig` (always pass `FIG=`) |
| `tools/measure.ts`, `tools/shots*.ts`, `tools/test-behaviors.ts` | Chrome at `/usr/bin/google-chrome` (`CHROME=` overrides it, except in `measure.ts`). `measure.ts` serves the hard-coded path `/workspace/saas-design/apps/site/public` |
| `packages/blocks/defs/figma.ts` | blocks copied from this design (keep as examples or remove) |
| `fixtures/content/source/*.json` | authored copy and block catalog for this design |
| `tools/views.ts` | the "Figma home page" part: which `section-*` records become which blocks on `home.json`, and per-block view builders (e.g. `planView`). The block-preview part (`blocks.json`) is per block id |
| `apps/site/cmd/export/main.go` | `pages = {"home.json": "index.html"}`; add entries for more pages |
| `apps/design-svelte` nav / overview copy | `src/lib/nav.ts`, `src/routes/+page.svelte` |

Generic, no change needed: `tools/check.sh`, `tools/ui8px-policy.ts`, `tools/validate-content.ts`, `tools/copy-media.mjs`, the packages/ui and packages/blocks generators, the adapter, and the behaviours.
