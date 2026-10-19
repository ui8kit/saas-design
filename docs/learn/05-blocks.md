# 5. Blocks

A block (navbar, hero, pricing, …) is one def written in a small DSL:

- the DSL: [`packages/blocks/scripts/dsl.ts`](../../packages/blocks/scripts/dsl.ts);
- the 10 Figma blocks: [`packages/blocks/defs/figma.ts`](../../packages/blocks/defs/figma.ts);
- the catalog blocks: [`packages/blocks/defs/catalog.ts`](../../packages/blocks/defs/catalog.ts);
- the registry: [`defs/index.ts`](../../packages/blocks/defs/index.ts). The limit is 45 blocks.

A def has a `schema` (its props), a `root` tree of primitives built with `c("Button", {…})`, and helpers: `$("path")` for props, `each`, `when`, `unless`, and `icon`. Each `css` string is a list of utilities that becomes a semantic class `ui-<block>-<part>`.

## One def → three runtimes

```bash
cd packages/blocks && bun run generate && bun run parity
(cd templ && go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path blocks)
```

[`scripts/generate.ts`](../../packages/blocks/scripts/generate.ts) writes:

- `packages/blocks/svelte/*.svelte`, `react/*.tsx` and `templ/blocks/*.templ`;
- [`packages/adapter/src/blocks.generated.css`](../../packages/adapter/src/blocks.generated.css);
- [`packages/blocks/catalog.json`](../../packages/blocks/catalog.json) and [`classes.json`](../../packages/blocks/classes.json).

[`scripts/parity.ts`](../../packages/blocks/scripts/parity.ts) renders 49 cases (from [`scripts/cases.ts`](../../packages/blocks/scripts/cases.ts)) and requires Svelte = templ and React = templ.

## Checklist: add a block

Verified on 2026-10-19 in a clean clone in `/tmp`: adding a `quote-band` block gave 40 blocks, block parity 50/50, 51 design pages, and `bun run check` plus the behaviour tests passed.

1. **Def.** Write `export const myBlock = block({ id: "my-block", title, category, description, schema, root })` in [`defs/catalog.ts`](../../packages/blocks/defs/catalog.ts), using tokens and 8+4 steps only. Put it **above** the `export const catalogBlocks = [...]` line. A def declared after the array fails with `Cannot access 'myBlock' before initialization`.
2. **Register.** Add `myBlock` to `catalogBlocks` (or to `figmaBlocks` in `figma.ts`). The total limit is 45.
3. **Generate.** Run `cd packages/blocks && bun scripts/generate.ts`, then `(cd templ && go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path blocks)`.
4. **Preview data.** Add `"my-block": { … }` matching the schema to `catalogData` in [`tools/views.ts`](../../tools/views.ts), then run `bun tools/views.ts`. Without it, views fails with `no catalog data for block my-block`. The design apps then get `/blocks/my-block` automatically.
5. **Policy.** Run `bun tools/ui8px-policy.ts` (new `ui-my-block-*` classes → allowed utilities). Without it, check fails on policy drift.
6. **Check.** Run `bun run check && bun tools/test-behaviors.ts`.

`bun run regen` runs steps 3–5 (and every other generator) in the right order: tokens → content → icons → ui → blocks (+templ) → views → ui8px policy → design-docs → site templ → contract. After a change to defs, tokens or content, run `bun run regen && bun run check`.

Next: [contract and fixtures](06-contract-fixtures.md).
