# codegen 2.0: a git dependency does not install the nested xgen workspaces

Status: worked-around (`tools/xgen-link.ts`, root `postinstall`)

**Context.** codegen 2.0 is a Bun workspace monorepo: the engine lives in `xgen/{spec,schema,screens,generator,check,cli,runtimes/*}` as `@ui8kit/xgen-*` packages with `workspace:*` links. Installed as `github:ui8kit/codegen#2309848`, only the root package is installed; none of the `@ui8kit/xgen-*` packages resolve.

**Repro.** `bun -e 'import("@ui8kit/xgen-spec")'` in `packages/ui` → `Cannot find module`. A Bun plugin `onResolve` for bare `@ui8kit/xgen-*` specifiers is not invoked for them, and tsconfig `paths` do not apply to files inside `node_modules`.

**Workaround.** `tools/xgen-link.ts` (run by the root `postinstall`) copies `xgen/` (plus `package.json`, `LICENSE` and the upstream `.ui8px` policy) to `packages/ui/.xgen` (gitignored). It then symlinks every xgen package into `packages/ui/node_modules/@ui8kit/`. External deps (ajv, clsx, tailwind-merge, parse5) resolve from the root `node_modules`.

**Impact.** One more moving part per install. A Vercel/CI install without bun skips the link (the generated files are committed, so builds do not need it).

**Proposed fix.** Publish the engine packages to npm (or one `@ui8kit/xgen` bundle with subpath exports), or add a root `exports` map that points at the workspace sources.
