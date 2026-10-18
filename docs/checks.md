# Checks

`bun run check` runs `tools/check.sh`: bash with `set -euo pipefail`, which stops at the first failure. Each step is shown as `== <step>` in the output, and the run ends with `all checks passed`. Run it before every commit.

## What `bun run check` runs, in order

| # | Step (as printed) | Command | Verifies | Typical failure → fix |
|---|---|---|---|---|
| 0 | `docs: relative links + anchors` | `bun tools/check-links.ts` (also `bun run docs:links`) | Every relative link in README, AGENTS, CONTRIBUTING, `docs/`, `.manual/`, `.cursor/`, `.project/` points at an existing file and, for Markdown targets, an existing heading anchor (GitHub slug rules). External links are not fetched | Fix the path/anchor; after renaming a heading, update links to it |
| 1 | `fixtures: content, views, tokens (drift)` | `bun tools/content.ts --check`, `bun tools/views.ts --check`, `bun tools/tokens.ts --check` | Committed records, views and token outputs (`theme.css`, app `brand.css`, `tokens.json`…) equal what the generators produce now | You changed a source (`mapping.json`, `tools/content.ts`, defs schema…) but did not regenerate → run `bun run content`, `bun tools/views.ts`, `bun run tokens`, commit the outputs. Never hand-edit outputs. |
| 2 | `contract (@ui8kit/contract)` | `bun tools/validate-content.ts` | Every record passes the @ui8kit/contract JSON Schemas, `validateCollectionV04` (strict keys, uniqueness, references, manifest) and the local media/section reference checks; prints `errors 0, warnings 0` | Fix the mapping in `tools/content.ts` (missing required field, unknown key, dangling media id), regenerate. `--json` gives machine-readable output. |
| 3 | `packages/icons` | `(cd packages/icons && bun scripts/generate.ts --check)` | Generated icon components are in sync | Run `bun scripts/generate.ts` in packages/icons. |
| 4 | `packages/ui: codegen drift + templ/svelte parity` | `bun scripts/generate.ts --check` and `parity.ts` (packages/ui); then `templ generate -path ui` in `packages/ui/templ` + `git diff` on it; `node --check` on `packages/ui/behaviors/*.js` | (a) The brick registry validates and generated templ/svelte/`primitives.generated.css`/`classes.json` are in sync. (b) Canonical, templ and Svelte renders match for every part and case, and markup has only `ui-*` classes. (c) `*_templ.go` is up to date. (d) Behaviour scripts parse. | (a) `bun run generate` in packages/ui. (b) A mismatch prints the case. Usually a recipe or local brick def changed in a way one emitter handles differently; fix the def (e.g. use `pStr`, not a passthrough prop, in expressions). (c) `cd packages/ui/templ && go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path ui`, commit. (d) Fix the JS syntax. |
| 5 | `packages/blocks: DSL drift + templ/svelte parity` | `bun scripts/generate.ts --check` + `parity.ts` (packages/blocks) | Generated blocks (templ, svelte, `blocks.generated.css`, `catalog.json`) are in sync; templ and Svelte DOM equal for all 49 cases; no unknown `ui-*` classes | `bun run generate` in packages/blocks. Parity "unknown ui-* class" → a class in markup that no generator or `base.css` defines. Go output is gofmt'ed before comparing. |
| 6 | `ui8px policy drift + lint` | `bun tools/ui8px-policy.ts --check`, `npx -y ui8px@latest lint`, brand-token grep on `packages/` | Policy in `.ui8px/policy/` matches the sources; every utility in `@apply` is allowed (8 + 4 grid by scope, token colors, no arbitrary values); no `--brand-*` / `*-brand-*` in packages | Policy drift → `bun tools/ui8px-policy.ts`. Lint violation → change the utility to an on-grid, token-color one; if it is legitimately needed, add it to `tools/ui8px/allowed.extra.json` (reviewed) and regenerate the policy. Brand token in packages → use a shadcn token, move the brand color to app CSS. |
| 7 | `packages compile standalone (tokens + adapter, no app brand.css)` | `npx --no-install @tailwindcss/cli -i packages/adapter/test/standalone.css -o /tmp/saas-design-standalone.css` | Packages do not depend on app-level CSS | A package uses a theme var or utility that only an app defines → move the var into `tools/tokens.ts` output (`packages/tokens/theme.css`) or stop using it. |
| 8 | `apps/site: templ generate (no drift) + static build` | `templ generate -path views` + `git diff`, `bash apps/site/scripts/build.sh` | `views/*_templ.go` is current; Go export + Tailwind CLI + media copy succeed | Regenerate templ in apps/site, commit. Go compile errors usually come from block models changed in packages/blocks. |
| 9 | `apps/design: generated data drift + SvelteKit static build` | `(cd apps/design && bun run check && bun run build)` | `foundations.generated.css` and `showcase.generated.json` are in sync; all pages prerender | `cd apps/design && bun run generate`. Missing in-page anchor ids (`#pricing` inside block previews) are ignored on purpose (`handleMissingId: "ignore"`); any HTTP error during prerender fails the build (`handleHttpError: "fail"`) and is a real broken link. |

Known non-fatal output: the Svelte warning `a11y_no_noninteractive_tabindex` from the generated `Link.svelte` (backlog `codegen-svelte-link-a11y-tabindex.md`).

## Not in `bun run check`

These need the network or Chrome, or they are slow.

| Command | Verifies | Notes |
|---|---|---|
| `bun run brand:check` | `brand-os@0.3.0 validate` + `verify --strict` of `fixtures/tokens/brand.contract.json` against `fixtures/tokens/brand.generated` | Run after `bun run tokens` + `bun run brand:emit`. |
| `bun run test:behaviors` | Chrome at 390px on both built apps. Sheet: `aria-expanded`, focus moves in, Tab/Shift+Tab trapped, Esc closes, focus restored, overlay closes. ThemeToggle: flips `.dark` + `aria-pressed`, choice persists over reload. 18 assertions. | Needs built apps and Chrome (`CHROME=/path` to override). Exit code 1 on any `FAIL`. |

### Screenshots (not in check)

Output goes outside the repo, to `/workspace/shots-saas` (`SHOTS_DIR` overrides it for `shots.ts` and `shots-modes.ts`).

| Command | Output |
|---|---|
| `bun run render:figma` | `figma/1-10.html`, an absolutely positioned reference render of the frame (fig2design 0.1.0 does not render) |
| `bun run shots` | `figma-1-10-home.png`, `site-home.png`, `sections/figma-*.png` + `site-*.png`, `compare/*.png`, `report.json` with per-section `figma.y/height`, `site.y/height` and delta |
| `bun run shots:design` | `design-*.png` for design-app pages (`bun tools/shots-design.ts <out> <paths…>` for specific pages) |
| `bun run shots:modes` | `site-light/dark/mobile/mobile-menu/mobile-dark-menu.png`, `design-light/dark/dark-*/mobile/mobile-menu.png` |
| `bun tools/measure.ts '<selector>' …` | x, y, w, h, font-size, line-height and padding for up to 4 matches in the built site at 1440px. Serves `/workspace/saas-design/apps/site/public` (hard-coded path) |

How to use them: fix the largest `|delta.height|` in `report.json` first, in the block def `css:`, staying on the grid. Then **look at** `compare/<section>.png`; a matching height alone does not mean a visual match.
