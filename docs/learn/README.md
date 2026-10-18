# Learn saas-design, in order

Ten short lessons. Each one names the real files involved, so you can open them as you read. Follow them in order: each lesson builds on the one before.

| # | Lesson | You will learn |
|---|---|---|
| 1 | [Tokens](01-tokens.md) | where colors, radius and type come from; package vs app (brand) tokens |
| 2 | [The 8+4 grid](02-grid-8-4.md) | the layout rhythm (step 28 included), the control rhythm, and how ui8px enforces both |
| 3 | [Primitives](03-primitives.md) | codegen 2.0 bricks, recipe overrides, and the generated templ/Svelte/React components |
| 4 | [Retag](04-retag.md) | why apps and blocks never write raw HTML tags, and the lint that checks it |
| 5 | [Blocks](05-blocks.md) | the block DSL and how one def becomes three runtimes |
| 6 | [Contract and fixtures](06-contract-fixtures.md) | Figma → records → views; why copy never lives in components |
| 7 | [Adapter](07-adapter.md) | semantic `ui-*` classes and `@apply` |
| 8 | [Runtimes](08-runtimes.md) | the three apps and DOM parity |
| 9 | [Checks](09-checks.md) | what `bun run check` runs and how to read a failure |
| 10 | [Deploy](10-deploy.md) | the three Vercel projects |

Reference docs: [architecture](../architecture.md), [design settings](../design-settings.md), [checks](../checks.md), [troubleshooting](../troubleshooting.md), [agent rules](../../AGENTS.md).
