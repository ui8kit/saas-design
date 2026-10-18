# 5. Apps

## apps/site — Go templ static copy of the Figma frame

```bash
cd apps/site
bun run generate                       # templ@v0.3.1070 generate -path views
bun run build                          # = bash scripts/build.sh → public/ (export + Tailwind CLI + media)
bun run serve                          # http://localhost:4173
```

## apps/design-svelte — Svelte 5 design-system app (SvelteKit, static)

```bash
cd apps/design-svelte
bun run generate                       # foundations.generated.css + showcase.generated.json (from tokens + packages/ui registry)
bun run dev                            # http://localhost:5173
bun run build                          # copy media → static/, vite build → build/ (49 prerendered pages)
```

Pages: overview, foundations (colors, typography, spacing, radius, shadows), primitives, components, widgets, blocks + one page per block.
`@saas-design/ui|blocks|icons` resolve via aliases in `vite.config.ts` (`@saas-design/icons/svelte` before `@saas-design/icons`). Docs-shell classes are `ds-*` in `packages/design-docs/styles/design.css` (@apply only); nav, page data and showcase transforms are shared in `packages/design-docs/src`.

## apps/design-react — React 19 twin of the design app (Vite SSR + static prerender)

```bash
bun run design-react:build             # vite build (client + SSR) → prerender 49 pages into apps/design-react/build
bun tools/design-parity.ts             # every page: normalized DOM identical to apps/design-svelte/build
```

Routes: `src/routes.tsx` + `src/pages/*`; same shared content and `ds-*` classes as the Svelte app. A page added to one design app must be added to the other.
