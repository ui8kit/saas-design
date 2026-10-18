# 5. Apps

## apps/site — Go templ static copy of the Figma frame

```bash
cd apps/site
bun run generate                       # templ@v0.3.1001 generate -path views
bun run build                          # = bash scripts/build.sh → public/ (export + Tailwind CLI + media)
bun run serve                          # http://localhost:4173
```

## apps/design — Svelte 5 design-system app (SvelteKit, static)

```bash
cd apps/design
bun run generate                       # foundations.generated.css + showcase.generated.json (from tokens + packages/ui registry)
bun run dev                            # http://localhost:5173
bun run build                          # copy media → static/, vite build → build/ (49 prerendered pages)
```

Pages: overview, foundations (colors, typography, spacing, radius, shadows), primitives, components, widgets, blocks + one page per block.
`@saas-design/ui|blocks|icons` resolve via aliases in `vite.config.ts`. Docs-shell classes are `ds-*` in `src/lib/styles/design.css` (@apply only).
