# 4. Retag

*Retag* means app and block markup is built **from primitives**, never from raw HTML tags. A `<nav>` becomes `Block tag="nav"`, a `<blockquote>` becomes `Text tag="blockquote"`, a `<span>` becomes `Inline`. The element is still the right semantic tag, but its classes and ARIA come from one recipe, so all three runtimes agree.

## The lint

[`tools/lint-apps.ts`](../../tools/lint-apps.ts) runs the codegen 2.0 `rules` detectors (block-root, raw-native-tag, raw-html, dynamic-tag, reactive-aria, literal-text) plus an inline-style detector. It covers these zones:

- [`apps/site/views`](../../apps/site/views/layout.templ)
- [`apps/design-svelte/src`](../../apps/design-svelte/src)
- [`apps/design-react/src`](../../apps/design-react/src)
- the generated blocks in `packages/blocks/{svelte,react,templ}`

Known exceptions are listed in [`tools/lint-apps.baseline.json`](../../tools/lint-apps.baseline.json), matched by file + detector + message. An entry that no longer matches fails the check, so the baseline can only shrink. `literal-text` is report-only.

Examples of retagged app parts: [`apps/design-svelte/src/lib/Section.svelte`](../../apps/design-svelte/src/lib/Section.svelte) and [`Sidebar.svelte`](../../apps/design-svelte/src/lib/Sidebar.svelte).

The editor rule is [`.cursor/rules/blocks-retag.mdc`](../../.cursor/rules/blocks-retag.mdc).

Next: [blocks](05-blocks.md).
