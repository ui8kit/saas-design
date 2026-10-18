# Project status (2026-10-18, after d192afc)

## Done
- **apps/site** — Go templ static export (`apps/site/views/layout.templ`, `cmd/export`, `scripts/build.sh`, `vercel.json`). Builds to `public/` from `fixtures/views/home.json`.
- **packages/ui** — primitives/components in both runtimes (`svelte/`, `templ/`), recipes, generator + `check` (33 bricks, 63 parts) and parity (167 cases × 2 runtimes, 0 mismatches).
- **packages/blocks** — 39 blocks (≤45) in Svelte + templ via DSL, catalog, parity (49 cases, 0 DOM mismatches); `check` clean.
- **packages/icons** — 36 icons, check clean.
- **packages/adapter** — `@apply`-only semantic CSS (`blocks.generated.css`, shared kits), no inline `style=` in svelte/templ sources.
- **ui8px** — `.ui8px/policy` + `tools/ui8px-policy.ts`; `npx ui8px@latest lint`: 0 violations (14 files, 622 class lists).
- **Fixtures** — `fixtures/content` validated against `@ui8kit/contract` (`bun run contract`: 199 records, 0 errors); figma extract, views, media, tokens.
- **Tokens** — `packages/tokens/theme.css` shadcn HSL set; extra brand tokens only at app level (`apps/site/styles/brand.css`, `apps/design/src/lib/styles/brand.css`).
- **/.project/backlog** — 11 feedback files + README.
- **Screenshots** — `/workspace/shots-saas/` (figma vs site full page, 9 sections each, compare/, report.json). Height delta: figma 6288px vs site 6068px.

## Partial
- **Figma exactness of apps/site** — section heights drift (e.g. why −18px, testimonials −35px, cumulative −220px page height). Needs a fidelity pass.
- **Vercel** — `apps/site/vercel.json` present; deploy not verified. No config for apps/design.

## Missing
- **apps/design** — Svelte 5 design-system app (foundations, primitives, components, widgets, blocks pages, Vercel config): only `src/lib/styles/brand.css` exists.
- **Root check script** — root `package.json` has no `check` aggregating ui/blocks/icons check+parity, ui8px lint, contract, site build.
- **.cursor/rules + .cursor/skills** — directory absent.
- **/.manual** — directory exists but empty (no step-by-step guides).
