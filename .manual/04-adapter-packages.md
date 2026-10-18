# 4. Packages and the adapter

All markup carries semantic `ui-*` classes; every utility lives in `@apply` in `packages/adapter/src/`.

```bash
# primitives (Go templ + Svelte 5 + React 19 via @ui8kit/codegen 2.0, recipes in packages/ui/recipes)
cd packages/ui && bun run generate && bun run parity && cd -
# icons (lucide subset → TS registry + Icon.svelte + React + Go icons.Icon)
cd packages/icons && bun run generate && cd -
# blocks (DSL in packages/blocks/defs → svelte + react + templ + adapter/src/blocks.generated.css + catalog.json)
cd packages/blocks && bun run generate && bun run parity && cd -
# ui8px policy from the generated class maps, then lint
bun tools/ui8px-policy.ts
bun tools/ui8px-gate.ts                # → blocking 0
bun tools/lint-apps.ts                 # app-level retag + block rules → 0 blocking
```

Adapter files: `base.css` (hand-written, tokens only), `primitives.generated.css`, `blocks.generated.css` (generated; do not edit).
Adding a block: new def in `packages/blocks/defs/`, register it in `defs/index.ts`, add data in `tools/views.ts`, regenerate, ≤ 45 blocks.
New utility rejected by ui8px → reviewed entry in `tools/ui8px/allowed.extra.json` (on the 8+4 grid, token colors), then `bun tools/ui8px-policy.ts`.
ThemeToggle and Sheet are upstream codegen 2.0 bricks; local changes are recipe overrides in `packages/ui/recipes/`; see [09](09-dark-mode-behaviors.md).
