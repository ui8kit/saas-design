---
name: figma-to-site
description: Turn a local Figma .fig file into contract fixtures, shadcn tokens, ui8kit primitives/blocks (Svelte 5 + Go templ), the static site (apps/site) and the design-system app (apps/design), with parity, ui8px lint and screenshot checks. Use when asked to rebuild, extend or fix the saas-design pipeline, add a block, retune tokens or close Figma-vs-site drift.
---

# Figma → site (saas-design)

Read first: `.cursor/rules/pipeline.mdc` (order), `grid-8-4.mdc`, `tokens.mdc`, `adapter-no-inline-styles.mdc`, `blocks-retag.mdc`, `fixtures-contract.mdc`, `git-workflow.mdc`, `dark-mode.mdc`, `sheet.mdc`. Repo-level agent guide: `AGENTS.md`. Step-by-step commands: `.manual/`; long-form guides: `docs/` (new Figma file: `docs/replicate-with-new-figma.md`, new runtime: `docs/add-a-runtime.md`).

## Workflow

1. **Baseline.** `git status`, `bun install`, `bun run check`. If check fails, fix that first (smallest change), commit, push.
2. **Extract** (only if the design changed): `FIG=/workspace/fig-fixtures/saas.fig bun run extract` → `fixtures/figma/`. Never copy the `.fig` into the repo.
3. **Content → views.** Edit `tools/content.ts` mapping if Figma text changed → `bun run content && bun run contract && bun tools/views.ts`.
4. **Tokens.** Map Figma colors to shadcn roles in `fixtures/tokens/mapping.json` → `bun run tokens` → `bun run brand:emit && bun run brand:check`. Extra colors become `--brand-*` in app `brand.css` only.
5. **Primitives.** Change recipes in `packages/ui/recipes/*.variants.json` → `cd packages/ui && bun run generate && bun run parity`.
6. **Blocks.** Add/edit a def in `packages/blocks/defs/` (DSL: `c()` primitives, `css:` utilities → @apply, Block retagged as section/header/footer/nav, `aria-labelledby` → Title id), add its data to the views, then `cd packages/blocks && bun run generate && bun run parity`. Keep ≤ 45 blocks.
7. **Policy + lint.** `bun tools/ui8px-policy.ts && npx ui8px@latest lint`. A new utility needs a reviewed entry in `tools/ui8px/allowed.extra.json` (on-grid, token colors, no arbitrary values).
8. **Apps.** `bash apps/site/scripts/build.sh`; `cd apps/design && bun run generate && bun run build`.
9. **Verify visually.** `bun run render:figma && bun run shots` (Figma vs site, `/workspace/shots-saas/`, `report.json` has per-section y/height deltas) and `bun run shots:design` (design app pages → `/workspace/shots-saas/design-*.png`), `bun run shots:modes` (light/dark/390px menu) and `bun run test:behaviors` (Sheet + ThemeToggle). Fix the largest height delta first, in the block def `css:`, staying on the 8+4 grid.
10. **Gate + ship.** `bun run check` → commit (small, descriptive) → push (see git-workflow rule). Log tool problems in `.project/backlog/`, deliverable state in `.project/STATUS.md`.

## Gotchas

- Tailwind runs with `source(none)`: a utility written in markup is not generated. Put it in an `@apply`.
- `templ` must be v0.3.1001 (`go run github.com/a-h/templ/cmd/templ@v0.3.1001 …`), not the one on PATH.
- Generated Go is gofmt'ed after writing; the blocks `--check` compares gofmt'ed output.
- apps/design resolves `@saas-design/*` via Vite aliases (no workspace linking needed); media is copied into `static/` at build time (git-ignored).
- Block previews contain in-page anchors (`#why`, `#pricing`); the design app prerender ignores missing ids on purpose.
