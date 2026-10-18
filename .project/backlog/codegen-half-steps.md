# codegen: upstream bricks use fractional spacing steps (`gap-1.5`)

Status: fixed (codegen 2.0)

**Context.** Some upstream `@ui8kit/codegen` brick recipes use fractional Tailwind steps, e.g. `gap-1.5` (6px), which are off the 8 + 4 grid enforced by ui8px.

**Workaround.** `packages/ui/scripts/registry.ts` (`define()`, `SNAP` map) rewrites `gap-1.5` → `gap-2` while turning brick classes into semantic `ui-*` classes. That moves the generated DOM 2px away from the upstream brick.

**Impact.** Every new fractional step that appears upstream needs a new `SNAP` entry. Otherwise ui8px lint fails on the generated `primitives.generated.css`.

**Proposed fix.** Upstream bricks should use on-grid steps only, or codegen should accept a spacing-snap option.

**Resolution (2026-10-18).** codegen 2.0 recipes use on-grid steps only (MIGRATION.md: "no half steps"). The `SNAP` map is gone from `packages/ui/scripts/registry.ts`; the generated DOM matches upstream again.
