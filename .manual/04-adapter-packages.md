# 4. Packages and the adapter

All markup carries semantic `ui-*` classes; every utility lives in `@apply` in `packages/adapter/src/`.

```bash
# primitives (Svelte 5 + Go templ via @ui8kit/codegen, recipes in packages/ui/recipes)
cd packages/ui && bun run generate && bun run parity && cd -
# icons (lucide subset → svelte + templ)
cd packages/icons && bun run generate && cd -
# blocks (DSL in packages/blocks/defs → svelte + templ + adapter/src/blocks.generated.css + catalog.json)
cd packages/blocks && bun run generate && bun run parity && cd -
# ui8px policy from the generated class maps, then lint
bun tools/ui8px-policy.ts
npx ui8px@latest lint                  # → Violations: 0
```

Adapter files: `base.css` (hand-written, tokens only), `primitives.generated.css`, `blocks.generated.css` (generated; do not edit).
Adding a block: new def in `packages/blocks/defs/`, register it in `defs/index.ts`, add data in `tools/views.ts`, regenerate, ≤ 45 blocks.
New utility rejected by ui8px → reviewed entry in `tools/ui8px/allowed.extra.json` (on the 8+4 grid, token colors), then `bun tools/ui8px-policy.ts`.
Local bricks (not in upstream @ui8kit/codegen): `packages/ui/bricks/<name>/` (def + variants + data.json), registered in `bricks/index.ts`; see [09](09-dark-mode-behaviors.md).
