# codegen 2.0: changed primitive defaults (Title colour and weight, Stack align, Summary indicator)

Status: worked-around (recipe overrides in `packages/ui/recipes`, block CSS)

**Context.** Moving from 0.1 to 2.0 changed the DOM and classes of primitives that the Figma-matched blocks rely on:
- `Title` got `text-foreground` and a default `font-semibold`. Headings on the inverse hero band went dark, and display titles got heavier.
- `Stack` defaults to `align=start` (`items-start`). In 0.1 the children stretched, so full-width rows inside a stack shrank (plan name + Popular badge, `justify-between`).
- `Summary` renders a `data-slot="summary-indicator"` chevron. The Habitus FAQ blocks already draw their own chevron.
- `Group` gained `gap` / `align` / `justify` props (default `align=center`, as before).

**Workaround.** `recipes/title.variants.json` (base `""`, plus a new `weight.inherit` value as the default) and `recipes/stack.variants.json` (default `align: stretch`). The FAQ blocks hide the indicator in their `extraCss`. With these, the site and design screenshots are pixel-identical to the 0.1 build (0.000 % changed pixels, light/dark/mobile).

**Impact.** Every project that upgrades has to re-check its screenshots. MIGRATION.md lists recipe changes, but not these defaults.

**Proposed fix.** List default changes in MIGRATION.md. Give Summary an `indicator` bool prop and Title an `inherit` weight (Text already has one).
