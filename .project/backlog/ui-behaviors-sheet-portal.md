# ui8kit.js: sheet is moved to <body> on open (portal)

Status: open (works, verified by `bun run test:behaviors`)

**Context.** The site sheet lives inside the hero `header` (`isolate`, `overflow-hidden`, `data-theme="light"`). Left in place, a `fixed` sheet is clipped and stacked inside the hero, and it inherits the forced-light scope. The behaviour script appends the sheet to `<body>` on open and leaves it there.

**Impact.** In the design app (Svelte) the DOM node moves out of the component tree. Svelte still holds the reference, so it works, but any future `{#if}` around the Sheet would try to remove it from a different parent. In dark mode on the site, the sheet takes the page theme, not the hero's light theme (intended).

**Proposed fix.** Render the Sheet outside isolated containers in the block DSL (a `portal` slot at block root level), then drop the move.
