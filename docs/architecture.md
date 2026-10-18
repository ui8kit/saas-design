# Architecture

Six layers, each with **one source of truth** and **one generator**. Every generated artifact is committed and has a `--check` mode, so drift is a CI failure, not a silent change.

```
.fig (outside repo)
  │ fig2design parse                         tools/extract.sh
  ▼
fixtures/figma ──────────────┬─────────────────────────────────────────────┐
  │ tools/content.ts         │ tools/tokens.ts + fixtures/tokens/mapping   │
  ▼                          ▼                                             │
fixtures/content/records     packages/tokens/theme.css (shadcn HSL)        │
  (@ui8kit/contract)         apps/*/brand.css (--brand-*, app only)        │
  │ tools/views.ts           fixtures/tokens/brand.* (brand-os)            │
  ▼                                                                        │
fixtures/views/*.json        packages/ui  ◄── @ui8kit/codegen bricks + recipes + local bricks
  │                          packages/icons ◄── lucide-static subset
  │                          packages/blocks ◄── block DSL (packages/blocks/defs)
  │                               │ all emit semantic ui-* classes …
  │                               ▼
  │                          packages/adapter/src/*.css  (… whose utilities live here, in @apply)
  ▼                               ▼
apps/site  (Go templ → static HTML)     apps/design-svelte (SvelteKit, Svelte 5, static)
```

## Layers

### 1. Fixtures and contract (`fixtures/`)

| Path | Source of truth | Generator |
|---|---|---|
| `fixtures/figma/` | the `.fig` | `bun run extract` (fig2design 0.1.0) |
| `fixtures/content/source/*.json` | hand-authored content **not** in Figma (FAQ answers, showcase data) | — |
| `fixtures/content/records/` | Figma texts/images (by node id) + authored source | `bun run content` (`tools/content.ts`) |
| `fixtures/views/{home,blocks}.json` | records | `bun tools/views.ts` |
| `fixtures/media/` | vector assets from the frame | `bun run content` |

- **Records** are [@ui8kit/contract](https://github.com/ui8kit/contract) entries, dictionaries, menus, settings and a manifest. `tools/validate-content.ts` checks them in three ways: against the package's JSON Schemas (ajv), with `validateCollectionV04`, and with local reference checks (media ids, section item ids).
- **Views** are the props of each block, with the shapes defined by the block `schema` in `packages/blocks/defs`. Both runtimes render from these same JSON files, so copy never lives in components.
  - `home.json` is the site page: a list of `{ block, region, data }`.
  - `blocks.json` holds one data set per block, for the design-app previews.

### 2. Tokens (`packages/tokens`, app `brand.css`)

- `fixtures/tokens/mapping.json` is the **only hand-edited token file**. It maps each shadcn role (light and dark, plus `brand` and `brand.dark`) to a Figma variable name or a hex value.
- `tools/tokens.ts` writes:
  - `packages/tokens/theme.css` with the shadcn token set as `hsl()`:
    - light under `:root, [data-theme="light"]`;
    - dark under `.dark, [data-theme="dark"]`;
    - `@custom-variant dark`;
    - an `@theme` block with `--text-display*` and `--container-page`.
  - `apps/site/styles/brand.css` and `apps/design-shared/styles/brand.css`: colors without a shadcn role (`--brand-*`). These are **app level only**.
  - `fixtures/tokens/{palette,tokens}.json` and `brand.contract.json` for [brand-os](https://github.com/ui8kit/brand-os) (`bun run brand:emit`, `bun run brand:check`).

### 3. Adapter (`packages/adapter/src`)

The semantic class layer. Markup in every runtime carries only `ui-*` classes. Their Tailwind utilities live here, inside `@apply`:

- `base.css`: hand-written, covering document base, scheme, ThemeToggle/Sheet internals and `[aria-expanded]` icon switching.
- `primitives.generated.css`: from `packages/ui/scripts/generate.ts`.
- `blocks.generated.css`: from `packages/blocks/scripts/generate.ts`.
- `index.css`: imports all three. Apps import Tailwind (`source(none)`), then `packages/tokens/theme.css`, then their `brand.css`, then the adapter. See `apps/site/styles/app.css`.

**Why a middle layer?**
- **Runtime-neutral markup.** A Svelte, templ, React or Twig component only has to emit `class="ui-button ui-button-default ui-button-size-lg"`. Styling is the same CSS file for every runtime, so parity reduces to DOM equality.
- **No content scanning.** Tailwind runs with `source(none)`, so it never parses `.templ`, `.svelte` or `.go` files. All utilities come from `@apply`, and utilities in markup are impossible by construction.
- **Linting in one place.** ui8px lints the adapter and the generated class maps (`.ui8px/policy/patterns.json`) against the 8 + 4 grid and token-only colors, instead of linting each runtime's syntax.
- **Re-skinning.** A different brand changes token values (and app `brand.css`), never markup or class names.
- **Readable DOM.** Class names tell you which brick or block and which variant you are looking at, for example `ui-pricing-two-plans-plan-theme-dark`.

### 4. UI primitives (`packages/ui`)

- **Source.**
  - The [@ui8kit/codegen](https://github.com/ui8kit/codegen) brick registry, codegen 2.0 (xgen), pinned as `github:ui8kit/codegen#2309848` and linked by `tools/xgen-link.ts`.
  - Token-only recipes in `packages/ui/recipes/*.variants.json` replace the upstream recipes. The keys must match upstream; the generator fails otherwise.
- **Generator** (`bun run generate`, in `packages/ui`):
  - rewrites every class string a brick can emit into a semantic `ui-*` class;
  - writes the utilities into `primitives.generated.css`;
  - calls codegen's `generateFiles(bricks, { runtimes: ["templ"] })` and `["svelte"]`;
  - writes `packages/ui/templ` (Go module `github.com/ui8kit/saas-design/packages/ui/templ`) and `packages/ui/svelte`.
- **templ step.** `*_templ.go` files are produced by `templ generate` (v0.3.1070). The check fails if they drift.
- **Behaviours.** `packages/ui/behaviors/ui8kit.js` holds framework-free, delegated `data-ui8kit` hooks for the theme toggle and the sheet. `theme-init.js` is the head script that prevents a flash of the wrong theme.

### 5. Blocks (`packages/blocks`)

- **Source.** `packages/blocks/defs/{figma,catalog}.ts`, written in a small DSL (`packages/blocks/scripts/dsl.ts`):
  - `block({ id, title, category, description, figma, schema, root, extraCss })`;
  - `c(Component, opts, ...children)` for a packages/ui primitive, `h(tag, …)` only for tags no primitive owns;
  - `each`, `when`, `unless`, `whenEq`, `icon`, `use` (embed another block);
  - `$("path")` for data bindings;
  - options: `css:` (utilities → `@apply` on a `ui-<block>-<ui>` class), `kit:` (shared compositions in `scripts/kits.ts`), and `variants` (data-driven class switch).
- **Generator** (`bun run generate`). It reads the **generated** packages/ui (Svelte index and Go props structs) and writes:
  - `templ/blocks/<id>.templ`, `models.go`, `registry.go` (`blocks.Render(id, json)`);
  - `svelte/<Name>.svelte`, `types.ts`, `index.ts`;
  - `blocks.generated.css`, `catalog.json` and `classes.json`.
- **Emitter scope.** The block emitter is **this repo's own code** and supports templ and Svelte only. See [add-a-runtime.md](add-a-runtime.md).

### 6. Apps

| App | Runtime | Entry | Output |
|---|---|---|---|
| `apps/site` | Go + templ | `cmd/export/main.go` renders `fixtures/views/home.json` through `blocks.Render` into `views.Page` (`views/layout.templ`) | `apps/site/public` (index.html, `/assets/app.css` via Tailwind CLI, `/assets/ui8kit.js`, media) |
| `apps/design-svelte` | SvelteKit 2, Svelte 5, adapter-static | `src/routes/**` | `apps/design-svelte/build` (49 prerendered pages) |

- **Site.** One page for now (`pages = {"home.json": "index.html"}` in `cmd/export`). Each block's `region` (`header`/`main`/`footer`) places it.
- **Design app.** Imports `@saas-design/ui|blocks|icons` through Vite aliases, `packages/blocks/catalog.json`, and `fixtures/views/blocks.json`. It generates its own data:
  - `scripts/foundations.ts` → `foundations.generated.css` (one `ds-*` class per swatch or sample);
  - `scripts/showcase.ts` → `showcase.generated.json` (every brick part, recipe variant and showcase case).
- **Theme script.** `src/hooks.server.ts` injects `theme-init.js` in place of `%theme-init%` in `app.html`.

## Data flow for one change

| Change | Edit | Rerun | Checked by |
|---|---|---|---|
| Copy text | `tools/content.ts` mapping or `fixtures/content/source/*.json` | `bun run content && bun tools/views.ts` | content/views `--check`, contract |
| Color | `fixtures/tokens/mapping.json` | `bun run tokens` | tokens `--check`, brand guard |
| Primitive style | `packages/ui/recipes/*.variants.json` | `cd packages/ui && bun run generate` + templ generate | ui `--check`, ui parity, ui8px |
| Block layout | `packages/blocks/defs/*.ts` | `cd packages/blocks && bun run generate` | blocks `--check`, blocks parity, ui8px |
| New utility | the def/recipe + `tools/ui8px/allowed.extra.json` | `bun tools/ui8px-policy.ts` | policy `--check`, `ui8px lint` |
| Behaviour | `packages/ui/behaviors/ui8kit.js` | rebuild apps | `node --check`, `bun run test:behaviors` |

## Parity

- **Primitives.** `packages/ui/scripts/parity.ts` takes every brick part with its defaults and showcase cases (182 cases). It renders each case three ways: codegen's canonical renderer, the generated templ (Go harness `packages/ui/templ/cmd/parity`) and the generated Svelte (`svelte/server`). It compares normalized DOM and asserts the markup has only `ui-*` classes.
- **Blocks.** `packages/blocks/scripts/parity.ts` renders the 49 block cases in templ and Svelte and compares them. It also rejects unknown `ui-*` classes.
