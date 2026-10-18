# 8. Runtimes

| App | Runtime | Renders |
|---|---|---|
| [`apps/site`](../../apps/site/cmd/export/main.go) | Go + templ, static | `fixtures/views/home.json` through `blocks.Render` into [`views/layout.templ`](../../apps/site/views/layout.templ) |
| [`apps/design-svelte`](../../apps/design-svelte/vite.config.ts) | SvelteKit 2, Svelte 5, adapter-static | 49 docs pages: foundations, primitives, components, blocks |
| [`apps/design-react`](../../apps/design-react/README.md) | React 19, Vite SSR + static prerender ([`scripts/build.mjs`](../../apps/design-react/scripts/build.mjs)) | the same 49 pages ([`src/routes.tsx`](../../apps/design-react/src/routes.tsx)) |

The two design apps share their nav, page data, showcase transforms and `ds-*` CSS through [`packages/design-docs`](../../packages/design-docs/package.json).

## Parity, three levels

1. **Primitives:** `packages/ui` parity, 370 cases, templ = Svelte = React = canonical.
2. **Blocks:** `packages/blocks` parity, 49 cases, Svelte = templ and React = templ.
3. **Pages:** [`tools/design-parity.ts`](../../tools/design-parity.ts) checks that each prerendered design-react page has the same normalized DOM as its design-svelte page (49/49).

To add a runtime (Vue, Solid, Twig…), see [add a runtime](../add-a-runtime.md); React is the worked example.

Next: [checks](09-checks.md).
