# @ui8kit/codegen: no extension point for local bricks / showcase cases

Status: worked-around

**Context.** ThemeToggle and Sheet are not upstream bricks. `packages/ui/scripts/registry.ts` concatenates `[...upstream, ...local]` and `showcaseCases(b)` reads `packages/ui/bricks/<name>/data.json` for local ones. The design-app showcase and parity both have to go through this wrapper.

**Impact.** Upgrading codegen can break the merge (it relies on the brick object shape). Expressions can't reference passthrough props (`pPass`), so `aria-label` had to become `pStr`.

**Proposed fix.** Upstream should support `registry.extend(bricks)` with per-brick showcase data, and allow `pPass` values in attribute expressions.
