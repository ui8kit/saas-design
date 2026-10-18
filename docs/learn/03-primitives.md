# 3. Primitives

Primitives (Button, Card, Stack, Title, Sheet, ThemeToggle, …) come from **@ui8kit/codegen 2.0**, pinned in [`packages/ui/package.json`](../../packages/ui/package.json). The package is linked at `packages/ui/.xgen` by [`tools/xgen-link.ts`](../../tools/xgen-link.ts).

## What this repo owns

- **Recipe overrides** in [`packages/ui/recipes/`](../../packages/ui/recipes/button.variants.json). Each one lists the base classes and variants of one brick. For example, `button.variants.json` sets `rounded` (pill, through `--radius`) and the sizes `sm h-8`, `default h-10`, `lg h-12`, `xl h-14`.
- **The registry** [`packages/ui/scripts/registry.ts`](../../packages/ui/scripts/registry.ts), which chooses the bricks and applies the overrides.
- **The generator** [`packages/ui/scripts/generate.ts`](../../packages/ui/scripts/generate.ts), which writes:
  - `packages/ui/templ/ui/*`, `packages/ui/svelte/src/*` and `packages/ui/react/src/*`;
  - [`packages/adapter/src/primitives.generated.css`](../../packages/adapter/src/primitives.generated.css) and [`kit.generated.css`](../../packages/adapter/src/kit.generated.css);
  - [`packages/ui/showcase.json`](../../packages/ui/showcase.json).

## Run it

```bash
cd packages/ui && bun run generate && bun run parity
```

Parity ([`packages/ui/scripts/parity.ts`](../../packages/ui/scripts/parity.ts)) renders 370 cases in each runtime and requires canonical = templ = Svelte = React.

Behaviour (Sheet focus trap, ThemeToggle persistence) is plain JS in [`packages/ui/behaviors/ui8kit.js`](../../packages/ui/behaviors/ui8kit.js). It is shared by every app.

Next: [retag](04-retag.md).
