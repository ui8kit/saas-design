# Checks

`bun run check` runs `tools/check.sh`: bash with `set -euo pipefail`, which stops at the first failure. Each step is shown as `== <step>` in the output, and the run ends with `all checks passed`. Run it before every commit.

## What `bun run check` runs, in order

| # | Step (as printed) | Command | Verifies | Typical failure → fix |
|---|---|---|---|---|
| 0 | `docs: relative links + anchors` | `bun tools/check-links.ts` (also `bun run docs:links`) | Every relative link in README, AGENTS, CONTRIBUTING, `docs/` (incl. `docs/learn/`), `.manual/`, `.cursor/`, `.project/` points at an existing file and, for Markdown targets, an existing heading anchor (GitHub slug rules). External links are not fetched | Fix the path/anchor; after renaming a heading, update links to it |
| 1 | `fixtures: content, views, tokens (drift)` | `bun tools/content.ts --check`, `bun tools/views.ts --check`, `bun tools/tokens.ts --check` | Committed records, views and token outputs (`theme.css`, app `brand.css`, `tokens.json`…) equal what the generators produce now | Regenerate (`bun run content`, `bun tools/views.ts`, `bun run tokens`) and commit. Never hand-edit outputs. |
| 2 | `contract (@ui8kit/contract)` | `bun tools/validate-content.ts` | Every record passes the @ui8kit/contract schemas and `validateCollectionV04`, plus the local media/section reference checks: `errors 0, warnings 0` | Fix the mapping in `tools/content.ts`, regenerate |
| 3 | `packages/icons` | `(cd packages/icons && bun scripts/generate.ts --check)` | `icons.go` (SVG + `Icon` component) and `icons.generated.ts` are in sync | `bun scripts/generate.ts` in packages/icons |
| 4 | `packages/ui: codegen 2.0 drift + templ/svelte/react parity` | `generate.ts --check`, `showcase.ts --check`, `parity.ts` (packages/ui); `templ generate -path ui` + `go vet` + `go build` + `git diff`; `node --check` on the behaviours | (a) templ/svelte/react output, `primitives.generated.css`, `kit.generated.css`, `classes.json`, `showcase.json` in sync with the pinned codegen + `packages/ui/recipes`. (b) Every part × case: canonical = templ = Svelte = React DOM (`parity(ui): N cases; templ N/N, svelte N/N, react N/N`), only `ui-*` classes. (c) `*_templ.go` current. (d) Behaviour scripts parse | (a) `bun run generate` in packages/ui. (b) The printed case names the runtime and part. (c) `go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path ui` in `packages/ui/templ`. (d) Fix the JS |
| 5 | `packages/blocks: DSL drift + templ/svelte/react parity` | `generate.ts --check` + `parity.ts` (packages/blocks) | Generated blocks (templ, svelte, react, `blocks.generated.css`, `catalog.json`) in sync; Svelte and React DOM = templ for all 49 cases; no unknown `ui-*` class, no `style`, one top-level landmark per block | `bun run generate` in packages/blocks |
| 6 | `ui8px policy drift + lint` | `bun tools/ui8px-policy.ts --check`, `bun tools/ui8px-gate.ts` (runs `npx -y ui8px@latest lint --json`), brand-token grep on `packages/` | Policy matches the sources (spacing = the codegen 2.0 grid ∩ Habitus rhythm, [design-settings.md](design-settings.md#spacing)); no blocking hit (`UI8PX001/003/005`, `GRID`); upstream utilities that ui8px cannot parse are report-only; no `--brand-*` in packages | Policy drift → `bun tools/ui8px-policy.ts`. Blocking hit → an on-grid, token utility, or a reviewed entry in `tools/ui8px/allowed.extra.json`. Brand token → shadcn token, or move it to app CSS |
| 7 | `app-level retag + block rules` | `bun tools/lint-apps.ts` | The codegen 2.0 `rules` detectors (block-root, raw-native-tag, raw-html, dynamic-tag, reactive-aria, literal-text) + `inline-style` on `apps/site/views`, `apps/design-svelte/src`, `apps/design-react/src` and the generated blocks of every runtime: 0 blocking; baselined findings must still exist | Fix the composition ([blocks-retag rule](../.cursor/rules/blocks-retag.mdc)); `--verbose` lists report-only literal text. An accepted exception needs an entry with a reason in `tools/lint-apps.baseline.json` |
| 8 | `packages compile standalone` | `npx --no-install @tailwindcss/cli -i packages/adapter/test/standalone.css` | Packages do not depend on app-level CSS | Emit the var from `tools/tokens.ts` into `packages/tokens/theme.css`, or stop using it |
| 9 | `apps/site: templ generate (no drift) + static build` | `templ generate -path views` + `git diff`, `bash apps/site/scripts/build.sh` | `views/*_templ.go` current (compared with the index: stage or commit first); Go export + Tailwind CLI + media copy succeed | Regenerate templ in apps/site |
| 10 | `apps/design-shared: generated foundations drift` | `(cd apps/design-shared && bun run check)` | `foundations.generated.css` matches the token scales | `bun run generate` in apps/design-shared |
| 11 | `apps/design-svelte: SvelteKit static build` | `(cd apps/design-svelte && bun run build)` | All 49 pages prerender (`handleHttpError: "fail"`) | A broken link or a render error in a page |
| 12 | `apps/design-react: tsc + Vite SSR build + static prerender` | `tsc -p apps/design-react`, `bun run build` | Types of the app and the React outputs; all 49 pages prerender | Fix the type error; for an element-specific attribute in a block see [add-a-runtime.md](add-a-runtime.md#4-blocks-emitter) |
| 13 | `design apps: DOM parity design-react vs design-svelte` | `bun tools/design-parity.ts` | Same page set and `<title>`; every prerendered `<body>` DOM equal (`react 49/49 DOM-identical to svelte`) | `bun tools/design-parity.ts --diff`, change both apps |

The drift checks on `*_templ.go` compare the working tree with the git index (`git diff --quiet`): stage generated files before running `check` on uncommitted work.

Known non-fatal output: React SSR dev warnings for kebab-case SVG attributes of the generated Sheet/ThemeToggle (backlog `codegen2-react-svg-attrs.md`).

## Not in `bun run check`

These need the network or Chrome, or they are slow.

| Command | Verifies | Notes |
|---|---|---|
| `bun run brand:check` | `brand-os@0.3.0 validate` + `verify --strict` of `fixtures/tokens/brand.contract.json` against `fixtures/tokens/brand.generated` | Run after `bun run tokens` + `bun run brand:emit`. |
| `bun run test:behaviors` | Chrome at 390px on the three built apps (site, design-svelte, design-react). Sheet: `aria-expanded`, focus moves in, Tab/Shift+Tab trapped, Esc closes, focus restored, overlay closes. ThemeToggle: flips `.dark` + `aria-pressed`, choice persists over reload. 27 assertions. | Needs built apps and Chrome (`CHROME=/path` to override). Exit code 1 on any `FAIL`. |

### Screenshots (not in check)

Output goes outside the repo, to `/workspace/shots-saas` (`SHOTS_DIR` overrides it for `shots.ts` and `shots-modes.ts`).

| Command | Output |
|---|---|
| `bun run render:figma` | `figma/1-10.html`, an absolutely positioned reference render of the frame (fig2design 0.1.0 does not render) |
| `bun run shots` | `figma-1-10-home.png`, `site-home.png`, `sections/figma-*.png` + `site-*.png`, `compare/*.png`, `report.json` with per-section `figma.y/height`, `site.y/height` and delta |
| `bun run shots:design` | `design-*.png` for design-app pages (`bun tools/shots-design.ts <out> <paths…>` for specific pages) |
| `bun run shots:modes` | `site-light/dark/mobile/mobile-menu/mobile-dark-menu.png`, `design-light/dark/dark-*/mobile/mobile-menu.png`, the same set as `design-react-*.png` |
| `python3 tools/docs-assets.py` | the optimized README screenshots in `docs/assets/` from `/workspace/shots-saas` (needs Pillow) |
| `bun tools/measure.ts '<selector>' …` | x, y, w, h, font-size, line-height and padding for up to 4 matches in the built site at 1440px. Serves `/workspace/saas-design/apps/site/public` (hard-coded path) |

How to use them: fix the largest `|delta.height|` in `report.json` first, in the block def `css:`, staying on the grid. Then **look at** `compare/<section>.png`; a matching height alone does not mean a visual match.
