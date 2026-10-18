# Troubleshooting and known gaps

The first part covers common failures and their fixes. The second part summarizes every open or worked-around item in [`.project/backlog/`](../.project/backlog); each item links to its file, which has context, repro and proposed fix.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| `drift: … (run: …)` in `bun run check` | A source changed but its generated output was not regenerated, or the output was hand-edited | Run the generator named in the message and commit the output. See [checks.md](checks.md). |
| `drift: packages/ui/templ *_templ.go` or `apps/site/views` | `templ generate` not rerun after a `.templ` change | `go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path ui` (in `packages/ui/templ`) or `-path views` (in `apps/site`) |
| `undefined: templ.ResolveAttributeValue` | A templ CLI newer than the runtime generated the code | Always use the pinned `go run …templ@v0.3.1070` ([templ-version-pin.md](../.project/backlog/templ-version-pin.md)) |
| A utility "does nothing" | Tailwind runs with `source(none)`: utilities in markup are never generated | Put it in an `@apply`: block def `css:`, recipe, or `base.css` |
| ui8px `Unknown utility class` / violation | Off-grid step, palette color or arbitrary value, or a new utility not reviewed yet | Use an on-grid/token utility, or add a reviewed entry to `tools/ui8px/allowed.extra.json`, then `bun tools/ui8px-policy.ts` |
| `brand tokens used in packages/` | `--brand-*` or `*-brand-*` in a package | Use a shadcn token; brand colors belong to app CSS |
| `packages depend on app-level CSS` | A package uses a theme var only an app defines | Emit the var from `tools/tokens.ts` into `packages/tokens/theme.css` |
| Parity mismatch (ui) | A brick def renders differently in one emitter | Read the printed case. Expressions cannot reference passthrough props (`pPass`); use `pStr`. |
| Parity `unknown ui-* class` (blocks) | A class in markup that no generator or `base.css` defines | Define it via `css:`/`base.css`, or fix the typo |
| Codegen error about an expression on a passthrough prop | Same as above | Switch the prop to `pStr` |
| `npx fig2design` "command not found" inside a checkout | npx does not link the bin inside a directory named like the package | Run from `/tmp`, as `tools/extract.sh` does ([fig2design-npx-inside-source.md](../.project/backlog/fig2design-npx-inside-source.md)) |
| `refusing: keep the .fig outside the repo` | `FIG` points inside the repo | Move the `.fig` out (e.g. `/workspace/fig-fixtures/`) |
| `bun run serve` in apps/site loops with `E2BIG` | (fixed) `bunx serve` resolved to the script named `serve` itself | The script is now `npx -y serve@14 public -l 4173` |
| A light island turns dark, or the reverse | A variant value `light`/`dark` ended up in `data-theme` and forced a token scope | Name variant keys differently (e.g. `default`); see [dark-mode rule](../.cursor/rules/dark-mode.mdc) |
| Sheet clipped or painted under content | A parent has `overflow-hidden`/`isolate` | `ui8kit.js` moves the sheet to `<body>` on open ([ui-behaviors-sheet-portal.md](../.project/backlog/ui-behaviors-sheet-portal.md)) |
| Chrome not found (shots, tests) | Chrome is not at `/usr/bin/google-chrome` | Set `CHROME=/path` (`shots*.ts`, `test-behaviors.ts`). `measure.ts` has the path hard-coded |
| Svelte warning `a11y_no_noninteractive_tabindex` (Link) | Upstream codegen Svelte Link emitter | Known, non-fatal ([codegen-svelte-link-a11y-tabindex.md](../.project/backlog/codegen-svelte-link-a11y-tabindex.md)) |

## Known gaps (from `.project/backlog`)

### fig2design 0.1.0

| Item | Status | File |
|---|---|---|
| No raster/HTML render of a frame; `tools/figma-render.ts` is a reference rasterizer | worked-around | [fig2design-no-frame-render.md](../.project/backlog/fig2design-no-frame-render.md) |
| `lh.units: "PERCENT"` is a percent of the font's intrinsic line height, not of the font size | worked-around | [fig2design-line-height-percent-semantics.md](../.project/backlog/fig2design-line-height-percent-semantics.md) |
| Named colors land in `orphans`; counts say `variables: 0` | open | [fig2design-unbound-color-variables.md](../.project/backlog/fig2design-unbound-color-variables.md) |
| Paint order of `children` is undocumented (z-order guessed) | open | [fig2design-children-order-undocumented.md](../.project/backlog/fig2design-children-order-undocumented.md) |
| Manifest carries host path and timestamp (non-reproducible dump) | open | [fig2design-non-reproducible-manifest.md](../.project/backlog/fig2design-non-reproducible-manifest.md) |
| 7 of 14 images have empty `usedBy` | open | [fig2design-unused-images.md](../.project/backlog/fig2design-unused-images.md) |
| `npx` fails inside the source checkout | open (minor) | [fig2design-npx-inside-source.md](../.project/backlog/fig2design-npx-inside-source.md) |

### @ui8kit/codegen

| Item | Status | File |
|---|---|---|
| Not on npm; no recipe-override or custom-class hook (`registry.ts` rewrites classes) | worked-around | [codegen-not-on-npm-no-recipe-override.md](../.project/backlog/codegen-not-on-npm-no-recipe-override.md) |
| No extension point for local bricks or showcase cases | worked-around | [codegen-no-local-brick-hook.md](../.project/backlog/codegen-no-local-brick-hook.md) |
| Upstream fractional steps (`gap-1.5`) snapped to the grid | worked-around | [codegen-half-steps.md](../.project/backlog/codegen-half-steps.md) |
| Svelte Link a11y warning | open | [codegen-svelte-link-a11y-tabindex.md](../.project/backlog/codegen-svelte-link-a11y-tabindex.md) |

### ui8px

| Item | Status | File |
|---|---|---|
| Layout preset stops at step 24; `28` added locally | worked-around | [ui8px-layout-step-28.md](../.project/backlog/ui8px-layout-step-28.md) |
| Allowed utilities are global, not per scope (hence the brand-token grep) | worked-around | [ui8px-allowed-list-not-scoped.md](../.project/backlog/ui8px-allowed-list-not-scoped.md) |
| `inset-ring` flagged as an inset spacing conflict | worked-around | [ui8px-inset-ring-false-positives.md](../.project/backlog/ui8px-inset-ring-false-positives.md) |

### brand-os 0.3.0 and @ui8kit/contract 0.2.0

| Item | Status | File |
|---|---|---|
| Malformed `tokens.color.categories` pass validation and emit `#000000` | worked-around | [brand-os-category-shape-not-validated.md](../.project/backlog/brand-os-category-shape-not-validated.md) |
| DESIGN.md front matter contains values the contract does not declare | open | [brand-os-design-md-invented-values.md](../.project/backlog/brand-os-design-md-invented-values.md) |
| Media ids and id lists in metadata are not reference-checked (checked locally) | worked-around | [contract-media-references-not-checked.md](../.project/backlog/contract-media-references-not-checked.md) |

### templ, tokens, behaviours, blocks, site

| Item | Status | File |
|---|---|---|
| Generated code must match templ runtime v0.3.1070 | worked-around | [templ-version-pin.md](../.project/backlog/templ-version-pin.md) |
| `dark:` variant ignores `[data-theme]` islands | open | [tokens-dark-variant-ignores-data-theme.md](../.project/backlog/tokens-dark-variant-ignores-data-theme.md) |
| Sheet is moved to `<body>` on open | open (works) | [ui-behaviors-sheet-portal.md](../.project/backlog/ui-behaviors-sheet-portal.md) |
| Hero: badge star color, logo glyph, phone tilt | open | [blocks-hero-star-color-logo-glyph.md](../.project/backlog/blocks-hero-star-color-logo-glyph.md) |
| `text-display` / `max-w-page` were app-level | fixed | [blocks-text-display-app-token.md](../.project/backlog/blocks-text-display-app-token.md) |
| Site burger below `lg`, not `md` | decided: keep lg (user, 2026-10-18) | [site-navbar-collapse-lg-not-md.md](../.project/backlog/site-navbar-collapse-lg-not-md.md) |

### Not tracked in a backlog file

- **Vercel.** A real deploy is not verified ([deploy-vercel.md](deploy-vercel.md#known-risks)).
- **Design-specific scripts.** `tools/content.ts`, `tokens.ts`, `views.ts`, `shots.ts` and `figma-render.ts` are tied to frame `1-10` ([replicate-with-new-figma.md](replicate-with-new-figma.md#file-specific-code-you-must-change)).
- **Block emitter.** It supports only templ and Svelte ([add-a-runtime.md](add-a-runtime.md#3-blocks-write-an-emitter)).
- **Contrast.** Contrast in dark mode was checked visually, not with an automated tool.
