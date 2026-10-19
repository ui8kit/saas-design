# 1. Tokens

All colors are shadcn-style HSL tokens (`--background`, `--primary`, `--chart-3`, …). Markup and recipes only use token utilities such as `bg-primary` or `text-muted-foreground`. Hex values and arbitrary colors are never used.

## Where tokens come from

1. [`fixtures/tokens/mapping.json`](../../fixtures/tokens/mapping.json) maps Figma colors (from [`fixtures/tokens/palette.json`](../../fixtures/tokens/palette.json)) to token names, for light and dark.
2. `bun run tokens` runs [`tools/tokens.ts`](../../tools/tokens.ts) and writes:
   - [`packages/tokens/theme.css`](../../packages/tokens/theme.css): the package tokens, plus the `@theme` layout vars (`--radius`, `--text-display`, `--container-page`);
   - the app brand files [`apps/site/styles/brand.css`](../../apps/site/styles/brand.css) and [`apps/design-svelte/src/lib/styles/brand.css`](../../apps/design-svelte/src/lib/styles/brand.css) / [`apps/design-react/src/styles/brand.css`](../../apps/design-react/src/styles/brand.css).
3. `bun run brand:emit && bun run brand:check` validate the brand contract in [`fixtures/tokens/brand.contract.json`](../../fixtures/tokens/brand.contract.json).

## Two rules

- **Brand tokens only at app level.** `--brand-*` and `bg-brand-*` may only appear in an app's `brand.css`. `tools/check.sh` greps `packages/` and fails on any brand token.
- **One corner token.** `--radius: 2.5rem` lives in `@theme`, so plain `rounded` follows it. The derived steps (`sm`, `md`, `lg`, `xl`) are measured from Figma. See [design settings](../design-settings.md).
- **Nested corners are concentric.** inner R = outer R − padding (outer R = inner R + padding), never below 4px. A padded surface declares its padding as a token next to its padding utility (`p-6 surface-pad-6 md:p-8 md:surface-pad-8`); its children take `rounded-nested` (tiles, rows) or `rounded-field` (inputs, textarea), which `theme.css` derives with `calc`/`max`. Pills and circles stay `rounded` / `rounded-full`; tables, alerts, toasts and the cookie banner use the small `rounded-dense`. Details in [design settings](../design-settings.md#nested-corners) and `.cursor/rules/radius.mdc`.

## Try it

Change `--primary` in `mapping.json`, run `bun run tokens`, then rebuild one app. Every runtime picks up the change, because no component knows the color.

Next: [the 8+4 grid](02-grid-8-4.md).
