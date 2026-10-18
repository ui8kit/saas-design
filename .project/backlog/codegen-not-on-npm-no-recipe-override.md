# codegen: not published, no recipe-override / custom-class hook

Status: worked-around (git dependency `github:ui8kit/codegen#2309848` + `packages/ui/scripts/registry.ts` rewrite on `loadSpecs`)

**Context.** `@ui8kit/codegen` is not on npm; we pin `github:ui8kit/codegen#972b492` as a git dependency in `packages/ui`.
Bricks hard-code Tailwind utility strings in recipes *and* in non-recipe places (`staticBase`, `attrStatic("class", …)`,
state classes, inner `class` attr specs). A project that wants semantic classes (`ui-*` + `@apply` adapter) has to deep-rewrite the brick model.

**Repro.** `packages/ui/scripts/registry.ts` — ~150 lines that walk every node and rewrite class strings; e.g. breadcrumb uses
`attrStatic("class", "flex flex-wrap items-center gap-2")` which a recipe override cannot reach.

**Impact.** Fragile: any upstream brick change can add a new place holding utilities. Parity tooling (`tests/support/*`) is only importable via deep paths
(`@ui8kit/codegen/tests/support/normalize`), which are not a public API. Icon emits `icon-<name>` classes (data hook) that look like styling.

**Proposed fix.** Publish to npm; add `generateFiles(bricks, { classMode: "semantic", prefix: "ui" })` that emits class names and a CSS map;
export `normalizeHtml` / `showcaseCases` / `renderPart` from a public `@ui8kit/codegen/testing` entry; use `data-icon` instead of `icon-<name>`.

**Update (codegen 2.0, 2026-10-18).** 2.0 gives a real engine API (`loadSpecs` from `@ui8kit/xgen-spec`, `SvelteEmitter`/`ReactEmitter`/`TemplEmitter`), so the rewrite is now a pure function over the loaded bricks (recipes with compound rows, `staticBase`, `extra`, state, inline class specs). Still not on npm, still no semantic-class / class-prefix option, and the DOM normalizer is only reachable by a deep path (`xgen/check/src/templ/normalize.ts`). See also [codegen2-git-dep-nested-workspaces.md](codegen2-git-dep-nested-workspaces.md).
