# codegen 2.0: React output uses kebab-case SVG attributes (`stroke-width`)

Status: open

**Context.** The React emitter writes the inline SVG of Sheet, SheetTrigger, SheetClose and ThemeToggle with HTML attribute names (`stroke-width="2"`, `stroke-linecap`, `stroke-linejoin`) in JSX. The `LucideIcon.tsx` runtime asset spreads the registry attributes the same way.

**Repro.** `cd packages/ui && bun --preload ../../tools/svelte-preload.ts scripts/parity.ts` without the console filter → `Invalid DOM property \`stroke-width\`. Did you mean \`strokeWidth\`?` per render.

**Impact.** The markup is still correct (React passes them through, and parity is 368/368), but every SSR render logs dev warnings, and React may drop them in a future version. Both parity scripts filter the warning (see the comment in `packages/ui/scripts/parity.ts`).

**Proposed fix.** Map SVG attributes to their React names in the React emitter (`strokeWidth`, `strokeLinecap`, `strokeLinejoin`, `fillRule`, `clipRule`) and in `LucideIcon.tsx`.
