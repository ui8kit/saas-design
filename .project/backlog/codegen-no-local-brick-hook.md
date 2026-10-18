# @ui8kit/codegen: no extension point for local bricks / showcase cases

Status: fixed (codegen 2.0 ships ThemeToggle and Sheet)

**Context.** ThemeToggle and Sheet are not upstream bricks. `packages/ui/scripts/registry.ts` concatenates `[...upstream, ...local]` and `showcaseCases(b)` reads `packages/ui/bricks/<name>/data.json` for local ones. The design-app showcase and parity both have to go through this wrapper.

**Impact.** Upgrading codegen can break the merge (it relies on the brick object shape). Expressions can't reference passthrough props (`pPass`), so `aria-label` had to become `pStr`.

**Proposed fix.** Upstream should support `registry.extend(bricks)` with per-brick showcase data, and allow `pPass` values in attribute expressions.

**Resolution (2026-10-18).** codegen 2.0 has `xgen/specs/ui/themetoggle.json` and `sheet.json` with the same `data-ui8kit` hooks as our local bricks. `packages/ui/bricks/` was deleted; the registry is upstream only. A general extension point is still missing, but this repo no longer needs one.
