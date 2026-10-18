# apps/design-react

React 19 port of the design-system docs app. It has the same 49 pages as [`apps/design-svelte`](../design-svelte) (overview, five foundations pages, primitives, components, widgets, the block index and 39 block pages), the same tokens and adapter CSS, the same fixtures, dark mode and the Sheet mobile nav. It renders the **codegen 2.0 React output**: `packages/ui/react` (primitives) and `packages/blocks/react` (blocks).

```bash
bun install                                   # once, at the repo root
bun run design-react:build                    # → apps/design-react/build (49 .html pages)
npx --no-install vite preview --outDir build  # from apps/design-react; or any static server
```

## Why Vite SSR + a prerender script (and not Next.js)

The app is a static site, so this setup is the smallest one that gives plain HTML files per route on Vercel:

1. **Same toolchain as design-svelte.** Vite 6 + `@tailwindcss/vite` with the same CSS entry ([`src/styles/app.css`](src/styles/app.css)). The emitted stylesheet is byte-identical to the one design-svelte ships.
2. **No framework runtime in the output.** [`scripts/build.mjs`](scripts/build.mjs) runs a Vite SSR build of [`src/entry-server.tsx`](src/entry-server.tsx) and renders each route with `react-dom/server` `renderToStaticMarkup` into a small document shell. No React reaches the browser. Interactivity (theme toggle, Sheet) comes from the shared vanilla behaviors `packages/ui/behaviors/ui8kit.js`, and `theme-init.js` is inlined in `<head>`, exactly as in `apps/site` and `apps/design-svelte`.
3. **Vercel needs nothing special:** `framework: null`, `outputDirectory: build`, `cleanUrls` ([`vercel.json`](vercel.json)), plain Node in the build image.

Next.js static export was rejected. It would add a second build system and CSS pipeline, a client router and hydration that this site doesn't need, and `next/*` conventions that the codegen output doesn't use.

## Structure

| Path | Role |
| --- | --- |
| `src/routes.tsx` | Route table (path, `<title>`, page element). Block routes come from `packages/blocks/catalog.json`. |
| `src/pages/*.tsx` | One page per route. Every page opens on `PageHeader`, the page's one `Block` (block-root rule). |
| `src/components/*.tsx` | App frame (`Layout`, `Topbar`, `Sidebar`, `NavTree`), `Section`, `Showcase`/`ShowcasePart`, `BlockPreview`, `Pager`. |
| `src/entry-server.tsx` | `render(path)`: page in `Layout`, rendered to static markup. |
| `scripts/build.mjs` | CSS client build, SSR build, prerender, behaviors copy. The document shell is the only hand-written raw HTML. |
| `../design-shared` | Framework-neutral content shared with design-svelte: nav, block data, foundation scales, the docs stylesheet. |

Composition follows the retag and block rules of codegen 2.0. Pages use primitives only (`Block`, `Container`, `Box`, `Title`, `Text`, `Inline`, `List`, `LinkPlain`, `Table*`, `Form`, …) with `tag`/`as`. There are no raw native tags and no `dangerouslySetInnerHTML`. There is one `Block` per render path (a page's header, the frame's `<header>`/`<aside>`/`<nav>` in their own files). The current nav link gets a static `aria-current` in its own branch.

`tools/design-parity.ts` compares the prerendered `<body>` DOM of every page with design-svelte.

## Deploy

Vercel project with Root Directory `apps/design-react`: install `bash scripts/vercel-install.sh` (bun workspace at the repo root), build `node ../../tools/copy-media.mjs public && node scripts/build.mjs`, output `build`. See [docs/deploy-vercel.md](../../docs/deploy-vercel.md).
