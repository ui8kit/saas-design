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

Next: [contract and fixtures](06-contract-fixtures.md).
