# Add a runtime

This repo ships **two** runtimes: Go templ (`apps/site`) and Svelte 5 (`apps/design`). [@ui8kit/codegen](https://github.com/ui8kit/codegen) can emit **seven** runtimes for the primitives: `templ`, `react` (19), `svelte` (5), `vue` (3), `solid`, `latte` and `twig`. See its `docs/runtimes.md`, also at `packages/ui/node_modules/@ui8kit/codegen/docs/runtimes.md` after `bun install`.

"Static HTML" is **not** a codegen runtime; codegen builds its static HTML example from React. Here, static HTML comes from the templ export in `apps/site`.

What a new runtime needs, by layer:

| Layer | Reusable as-is | Work needed |
|---|---|---|
| Tokens (`packages/tokens/theme.css`) | ✅ plain CSS | none |
| Adapter (`packages/adapter/src/*.css`) | ✅ plain CSS, same `ui-*` classes | none |
| Behaviours (`packages/ui/behaviors/*.js`) | ✅ framework-free, delegated `data-ui8kit` hooks | load the script; inline `theme-init.js` in `<head>` |
| View models (`fixtures/views/*.json`) | ✅ plain JSON | none |
| Primitives (`packages/ui`) | ✅ codegen has an emitter | add the runtime to `scripts/generate.ts` + parity |
| Blocks (`packages/blocks`) | ❌ the block emitter is this repo's code and knows only templ + Svelte | write an emitter for the new runtime |
| App | — | scaffold, CSS entry, routes, Vercel config |

## 1. Primitives: emit the runtime

`packages/ui/scripts/generate.ts` calls codegen once per runtime:

```ts
for (const [rt, dir] of [["templ", "templ"], ["svelte", "svelte"]] as const) {
  for (const f of await generateFiles(bricks as any, { goModule: GO_MODULE, runtimes: [rt] })) files.set(`packages/ui/${dir}/${f.path}`, f.contents);
}
```

Add your runtime to that list, e.g. `["react", "react"]`. Also add the new directory to the `owned` list in the same file, so that stale files are detected. `bricks` is the full registry: upstream bricks with this repo's token-only recipes and semantic `ui-*` classes, plus the local ThemeToggle and Sheet bricks.

> Verified (2026-10-18): with this repo's `bricks` registry, `generateFiles(bricks, { runtimes: [rt] })` returns files for every runtime:
>
> | Runtime | Files |
> |---|---|
> | react | 122 |
> | vue | 153 |
> | solid | 121 |
> | latte | 109 |
> | twig | 110 |
>
> In every runtime the output includes ThemeToggle and Sheet. Rendering and parity of those outputs were **not** verified, because React, Vue and Solid are not installed in this workspace.

Each runtime's peer dependencies, from codegen's `docs/runtimes.md`:

| Runtime | Peer dependencies |
|---|---|
| React | `react`, `react-dom`, `clsx`, `tailwind-merge` |
| Vue | `vue`, `clsx`, `tailwind-merge` |
| Solid | `solid-js`, `clsx`, `tailwind-merge` |
| Latte | `latte/latte ^3` |
| Twig | `twig/twig ^3` + `UI8Kit\TwigExtension` |

Latte and Twig cover 59 of 63 upstream parts (see codegen `docs/php-complex-parts.md`).

Give the new output a `package.json` `exports` entry like the Svelte one (`"./svelte/*"`), e.g. `"./react/*": "./react/*"`.

## 2. Primitives: extend parity

`packages/ui/scripts/parity.ts` builds one case list: every brick part × (defaults + showcase cases). For each case it renders:

- the canonical HTML: `renderPart()` from `@ui8kit/codegen/src/domain/render`;
- templ, through the Go harness `packages/ui/templ/cmd/parity` (JSON on stdin);
- Svelte, through `svelte/server` `render`.

It then compares `normalizeHtml()` results. To add a runtime, render the same cases and compare them the same way:

| Runtime | How codegen's own tests render it (`tests/parity*.test.ts`) |
|---|---|
| React | `react-dom/server` `renderToStaticMarkup` |
| Vue | `@vue/server-renderer` `renderToString`; the SFC compile plugin is in `tests/preload-bun.ts` |
| Solid | SSR with `babel-preset-solid` (`generate: "ssr"`) |
| Latte / Twig | PHP harnesses `cmd/parity-latte`, `cmd/parity-twig` with Composer |

Map canonical props to the runtime's prop names with `htmlRuntimeProps`/`knownCanonicalProps` from `@ui8kit/codegen/tests/support/props`. React uses camelCase/`className`; Svelte and Vue are HTML-native.

Keep the existing assertion that markup contains only `ui-*` classes. `bun run check` already runs `parity.ts`, so the new runtime is gated automatically.

## 3. Blocks: write an emitter

`packages/blocks/scripts/generate.ts` walks each `BlockDef` tree (`c` / `h` / `each` / `when` / `unless` / `whenEq` / `icon` / `use`, values bound with `$("path")`). It emits:

- templ: `templ/blocks/<id>.templ`, Go models from `schema`, and `registry.go` with `blocks.Render(id, json)`;
- Svelte: `svelte/<Name>.svelte`, `types.ts`, `index.ts`;
- the shared `blocks.generated.css` and `catalog.json`.

It also **reads the generated primitives** to learn component names and props: the Svelte index and Go props structs.

For a new runtime, add a third emitter alongside the templ and Svelte ones:

1. Read the new runtime's primitive index to resolve `c("Button", …)` to an import and prop names.
2. Translate each node kind:

   | Node | Translates to |
   |---|---|
   | `each` | loop |
   | `when` / `unless` / `whenEq` | conditional |
   | `$("a.b")` | data access |
   | `icon` | packages/icons component |
   | `use` | another block |

3. Emit the same `class` strings. They are already computed per node, and the CSS is shared.
4. Emit data types from `schema`, as `types.ts` does for Svelte.
5. Extend `packages/blocks/scripts/parity.ts` to render the same 49 cases (`scripts/cases.ts`) in the new runtime.

Also add `packages/icons` output for the runtime. `packages/icons/scripts/generate.ts` currently writes a Go file (`templ/icons.go`) and a TS module (`src/icons.generated.ts`) from the lucide-static subset.

This is the largest piece of work, and **nothing of it exists yet**. Track it in `.project/backlog/` when you start.

## 4. App scaffold

Reuse the CSS entry pattern from `apps/site/styles/app.css` or `apps/design/src/lib/styles/app.css`:

```css
@import "tailwindcss" source(none);          /* no content scanning: all utilities come from @apply */
@import "<rel>/packages/tokens/theme.css";
@import "./brand.css";                        /* app-level brand tokens, generated by tools/tokens.ts */
@import "<rel>/packages/adapter/src/index.css";
```

- Add the new app's `brand.css` path to `tools/tokens.ts`. Today it writes the site and design copies only, via `emit("apps/site/styles/brand.css", brandCss("apps/site"))` and the design equivalent.
- Render the pages from `fixtures/views/home.json`. Each entry is `{ block, region, data }`; place blocks by `region` (header/main/footer), as `apps/site/cmd/export/main.go` does.
- Behaviours:
  - inline `packages/ui/behaviors/theme-init.js` in `<head>`; it is the only inline script;
  - load `packages/ui/behaviors/ui8kit.js`, with `defer` or an import on mount;
  - do not reimplement sheet or theme logic in components.
- Media: `node tools/copy-media.mjs <public-dir>`.
- Add the app's build to `tools/check.sh`, and its built directory to `tools/test-behaviors.ts` and `tools/shots-modes.ts`.

## 5. Vercel config

Copy the pattern from `apps/design/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "bash scripts/vercel-install.sh",
  "buildCommand": "<your build>",
  "outputDirectory": "<static output dir>",
  "cleanUrls": true
}
```

- Set the Vercel project's Root Directory to `apps/<new-app>`.
- Keep "Include source files outside of the Root Directory" on, because the app reads `packages/` and `fixtures/`.
- The install script must install the bun workspace at the repo root. See `apps/design/scripts/vercel-install.sh` and [deploy-vercel.md](deploy-vercel.md).
- PHP runtimes (Latte, Twig) need a PHP host; that is not covered here.

## Checklist

- [ ] Primitives are emitted and parity is extended, with 0 mismatches.
- [ ] Icons are emitted.
- [ ] The block emitter is written and blocks parity is extended (49 cases, 0 mismatches).
- [ ] The app is built from `fixtures/views`, with no copy in components.
- [ ] The app uses only `ui-*` classes and no inline styles.
- [ ] The app loads `theme-init.js` and `ui8kit.js`, and `bun run test:behaviors` covers it.
- [ ] The app is added to `tools/check.sh` and to the screenshot tools.
- [ ] `vercel.json` is added, and the docs (`README.md`, `AGENTS.md`, this file) are updated.
