# codegen 2.0: kit.css mixes a document base layer and unlayered component rules

Status: worked-around (`packages/ui/scripts/generate.ts` writes `packages/adapter/src/kit.generated.css`)

**Context.** `xgen/runtimes/core/assets/styles/kit.css` carries four kinds of rules: an `@layer base` with document defaults (`text-rendering: geometricPrecision`, body colours, `color-scheme: light`), the glyph `@utility` rules the recipes need (checkbox-glyph, radio-glyph, switch-knob, progress-bar), an unlayered focus ring, and an unlayered `[data-slot="summary-indicator"]` rule. It also has per-element token rules that match utility classes in markup (`[data-slot="button"].rounded`, `.px-4.h-10`).

**Repro.** Import kit.css as-is: every text run of the Figma-matched site renders differently (text-rendering). The FAQ blocks cannot hide the indicator from `@layer components`, because unlayered rules beat any layer.

**Workaround.** The copy drops the `@layer base` block (`packages/adapter/src/base.css` owns the document) and moves the summary-indicator rule into `@layer components`. The focus ring stays unlayered on purpose: it must sit above the inset-ring box-shadows. The per-element token rules are kept but never match, because markup carries only `ui-*` classes.

**Impact.** The skin and density tokens of 2.0 (`--radius-button`, `data-density-*`) do not reach semantic-class markup.

**Proposed fix.** Split kit.css into `base.css` / `utilities.css` / `components.css` (each in its layer), and key the per-element tokens on `data-slot` only (not on utility classes).
