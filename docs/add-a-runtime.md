# Add a runtime

This repo ships **three** runtimes in DOM parity:

| Runtime | Primitives | Blocks | App |
|---|---|---|---|
| Go templ | `packages/ui/templ` | `packages/blocks/templ` | `apps/site` (static HTML export) |
| Svelte 5 | `packages/ui/svelte` | `packages/blocks/svelte` | `apps/design-svelte` (SvelteKit, adapter-static) |
| React 19 | `packages/ui/react` | `packages/blocks/react` | `apps/design-react` (Vite SSR + static prerender) |

[@ui8kit/codegen](https://github.com/ui8kit/codegen) 2.0 (xgen, pinned `github:ui8kit/codegen#2309848`, linked as
`packages/ui/.xgen`) has emitters for eight runtimes: `templ`, `svelte`, `react`, `vue`, `solid`, `twig`, `latte` and
`jinja2` (`xgen/runtimes/*`; guide: `xgen` `docs/runtimes.md`). React was the last runtime added here. The steps below
are what that took, in order. Repeat them for Vue, Solid or a PHP/Python template runtime.

| Layer | Reusable as-is | Work needed |
|---|---|---|
| Tokens (`packages/tokens/theme.css`) | plain CSS | none |
| Adapter (`packages/adapter/src/*.css`) | plain CSS, the same `ui-*` classes | none |
| Behaviours (`packages/ui/behaviors/*.js`) | framework-free, delegated `data-ui8kit` hooks | load the script, inline `theme-init.js` in `<head>` |
| View models (`fixtures/views/*.json`) | plain JSON | none |
| Primitives (`packages/ui`) | codegen 2.0 has an emitter | add it to `scripts/generate.ts`, extend parity |
| Icons (`packages/icons`) | one registry | a component for the runtime |
| Blocks (`packages/blocks`) | the DSL | an emitter in `scripts/generate.ts`, extend parity |
| App | `packages/design-docs` (nav, block data, docs CSS) | scaffold, routes, Vercel config |

## 1. Primitives

`packages/ui/scripts/generate.ts` loads the semantic registry (`scripts/registry.ts`). That is the upstream specs with
this repo's recipe overrides, every class rewritten to a `ui-*` class. It runs one xgen emitter per runtime
(`SvelteEmitter`, `ReactEmitter`, `TemplEmitter`). For React:

```ts
import { ReactEmitter } from "@ui8kit/xgen-runtime-react";
const emitter = r === "svelte" ? new SvelteEmitter() : new ReactEmitter();
```

Add the output directory to the `owned` list in the same file, so stale files are detected. Give it a `package.json`
`exports` entry (`"./react": "./react/src/index.ts"`). Peer dependencies: React `react` + `react-dom`; Vue `vue`;
Solid `solid-js`; all three also need `clsx` and `tailwind-merge`.

## 2. Primitive parity

`packages/ui/scripts/parity.ts` builds one case list: every part × (defaults, every enum value and boolean, every recipe
value). For each case it compares the normalized DOM of:

- the canonical renderer (`renderPart` of `@ui8kit/xgen-spec`);
- templ (Go harness `packages/ui/templ/cmd/parity`);
- Svelte (`svelte/server`);
- React (`react-dom/server` `renderToStaticMarkup`).

Props are mapped with `htmlPropName` / `reactPropName` (`className`, camelCase). Add the new runtime the same way; the
xgen check renders Vue with `@vue/server-renderer` and Solid with `babel-preset-solid` SSR. The assertion "only `ui-*`
classes" applies to every runtime.

## 3. Icons

The icon registry (`packages/icons/scripts/generate.ts`, a Lucide subset plus brand marks) has one component per runtime:

| Runtime | Component |
|---|---|
| Go | `icons.Icon(name, class)` |
| Svelte | `src/Icon.svelte` |
| React | `src/react.tsx` `Icon` |

Blocks render the component, so raw HTML stays inside `packages/icons`. Add a component for the new runtime.

## 4. Blocks emitter

`packages/blocks/scripts/generate.ts` walks each `BlockDef` tree (`c` / `h` / `each` / `when` / `unless` / `whenEq` /
`icon` / `use`, values bound with `$("path")`). For every node it returns one string per runtime (`{ go, sv, rx }`), and
it reads the generated primitives (Go props structs, part props) to resolve component and prop names. To add a runtime:

1. Add a field to the returned triple and translate each node kind:

   | Node | Translates to |
   |---|---|
   | `each` | a loop with a key |
   | `when` / `unless` / `whenEq` | a conditional |
   | `$("a.b")` | data access |
   | `icon` | the icons component |
   | `use` | another block |

2. Emit the same `class` strings. They are computed once per node, and the CSS is shared.
3. Emit data types from `schema` (`types.ts`) and a `registry` index.
4. Extend `packages/blocks/scripts/parity.ts`: the same 49 cases (`scripts/cases.ts`) must match templ.

React detail: attributes that are not in the generic `HTMLAttributes` of a part (`dateTime` on `Text tag="time"`) are
emitted as a spread (`ELEMENT_ATTRS`). They produce the same DOM attribute, and the part keeps its own types.

## 5. App

Reuse `packages/design-docs` (nav, block data, foundations, the docs stylesheet) and the CSS entry pattern:

```css
@import "tailwindcss" source(none);          /* no content scanning: all utilities come from @apply */
@import "<rel>/packages/tokens/theme.css";
@import "./brand.css";                 /* written by tools/tokens.ts (add your app there) */
@import "<rel>/packages/adapter/src/index.css";
```

- **Composition.** Use primitives only, following the retag and block rules ([.cursor/rules/blocks-retag.mdc](../.cursor/rules/blocks-retag.mdc)). Add the app as a zone in `tools/lint-apps.ts`.
- **Behaviours.**
  - Inline `packages/ui/behaviors/theme-init.js` in `<head>`; it is the only inline script.
  - Load `ui8kit.js`.
  - Do not reimplement sheet or theme logic.
- **Media.** `node tools/copy-media.mjs <public-dir>`.
- **Gates.** Add the build to `tools/check.sh`. Add a DOM comparison like `tools/design-parity.ts` (every prerendered page vs design-svelte). Add the build directory to `tools/test-behaviors.ts` and `tools/shots-modes.ts`.
- **Why React uses Vite SSR + prerender instead of Next.js:** [apps/design-react/README.md](../apps/design-react/README.md).

## 6. Vercel config

Copy [apps/design-react/vercel.json](../apps/design-react/vercel.json): `framework: null`, `installCommand: bash
scripts/vercel-install.sh` (installs the bun workspace at the repo root), the build command, `outputDirectory`,
`cleanUrls`. Set the Root Directory to `apps/<new-app>` and keep "Include source files outside of the Root Directory"
on. See [deploy-vercel.md](deploy-vercel.md). PHP and Python runtimes need their own host; that is not covered here.

## Checklist

- [ ] Primitives are emitted and parity is extended (every case, 0 mismatches).
- [ ] Icons have a component; blocks are emitted, and block parity is extended (49 cases, 0 mismatches).
- [ ] The app is built from `fixtures/views` / `packages/design-docs`, with no copy in components.
- [ ] Composition uses primitives only and is a zone of `tools/lint-apps.ts` (0 blocking).
- [ ] Only `ui-*` / `ds-*` classes, no inline styles.
- [ ] `theme-init.js` and `ui8kit.js` are loaded, and `bun run test:behaviors` covers the app.
- [ ] The app is in `tools/check.sh` (build + DOM parity) and the screenshot tools.
- [ ] `vercel.json` is added. `README.md`, `AGENTS.md` and this file are updated.
