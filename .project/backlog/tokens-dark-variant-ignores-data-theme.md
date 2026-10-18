# tokens: `dark:` variant does not match `[data-theme="dark"]` scopes

Status: open (documented in .cursor/rules/dark-mode.mdc)

**Context.** `@custom-variant dark (&:where(.dark, .dark *))`. Token blocks honour `[data-theme=dark|light]`, but the `dark:` variant only follows `.dark` on `<html>`. A `data-theme="light"` island in a dark page still gets `dark:` utilities, and a `data-theme="dark"` island in a light page doesn't.

**Impact.** Today only the raster logos use `dark:` (`dark:brightness-0 dark:invert`, which is outside any island), so nothing renders wrong. A future block that mixes `dark:` with an island would.

**Proposed fix.** `@custom-variant dark (&:where(.dark, .dark *, [data-theme=dark], [data-theme=dark] *):not(:where([data-theme=light], [data-theme=light] *)))`. Needs a test with nested islands.
