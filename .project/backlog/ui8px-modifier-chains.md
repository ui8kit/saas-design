# ui8px: modifier chains it cannot parse (`checked:`, `group-open:`, `[&>svg]:`)

Status: worked-around (`tools/ui8px-gate.ts`: report-only for upstream codegen 2.0 utilities)

**Context.** The codegen 2.0 recipes use Tailwind v4 variants and arbitrary properties that ui8px reports as `UI8PX002 Unsupported modifier chain` or `Unknown utility class`, even when listed in `allowed.json`. Examples: `checked:bg-primary`, `group-open:rotate-180`, `in-aria-expanded:hidden`, `last:border-b-0`, `motion-reduce:animate-none`, `[&>svg]:size-4`, `[--knob:12px]`, `disabled:cursor-not-allowed`.

**Repro.** `npx ui8px@latest lint` → 43 UI8PX002 hits, all in `packages/adapter/src/primitives.generated.css`, all from non-overridden upstream recipes.

**Workaround.** The codegen repo itself treats UI8PX002 as report-only (`.ui8px/gate.json`). `tools/ui8px-gate.ts` does the same, but only for utilities that `packages/ui/scripts/registry.ts` recorded as verbatim from the pinned specs (`packages/ui/upstream-utilities.json`). Our recipes, blocks, base.css and apps stay blocking for every rule.

**Proposed fix.** Teach the ui8px grammar the Tailwind v4 state variants, `group-*` / `peer-*` / `in-*`, and arbitrary variants / properties.
