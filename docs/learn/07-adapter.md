# 7. Adapter

Components emit only semantic classes, for example `class="ui-button ui-button-default ui-button-size-lg"`. The utilities behind them live in CSS, in `@apply`:

- [`packages/adapter/src/index.css`](../../packages/adapter/src/index.css) is the entry. It imports tokens, base and the generated files.
- [`packages/adapter/src/base.css`](../../packages/adapter/src/base.css) is hand-written and uses tokens only.
- [`primitives.generated.css`](../../packages/adapter/src/primitives.generated.css), [`kit.generated.css`](../../packages/adapter/src/kit.generated.css) and [`blocks.generated.css`](../../packages/adapter/src/blocks.generated.css) are generated. Do not edit them.
- The design-app shell classes (`ds-*`) live in [`apps/design-shared/styles/design.css`](../../apps/design-shared/styles/design.css).

Tailwind v4 runs with `source(none)`. It never scans markup, so a utility written in a template would do nothing. Only `@apply` counts. Inline `style=` attributes are rejected by `tools/lint-apps.ts`.

Because styling is one CSS file for every runtime, parity reduces to DOM equality.

[`tools/css-apply.ts`](../../tools/css-apply.ts) is the helper that writes the `@apply` rules. A check step compiles the packages without any app `brand.css`, to prove they stand alone.

Next: [runtimes](08-runtimes.md).
