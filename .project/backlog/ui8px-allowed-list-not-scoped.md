# ui8px: allowed utilities are global, not per scope

Status: worked-around

**Context.** `.ui8px/policy/scopes.json` scopes only spacing (layout vs control). `allowed.json` is one flat list. apps/design needs
app-level brand swatches (`bg-brand-*`) and `bg-sidebar-*`/`bg-input`/`bg-ring` for the color foundations page, so they were added to
`tools/ui8px/allowed.extra.json` — which now also allows them in `packages/`, where brand tokens are forbidden by project rule.

**Repro.** Put `@apply bg-brand-orange` in `packages/adapter/src/base.css` → `npx ui8px@latest lint` reports no violation.

**Impact.** The "extra tokens only at app level" rule is not machine-enforced.

**Proposed fix.** Let scopes carry `allowed`/`denied` utility lists (e.g. deny `*-brand-*` in `packages/**`). Until then, review by grep:
`rg '(bg|text|border|fill|stroke|ring|from|to)-brand-|var\(--brand-' packages/` must stay empty (now part of `bun run check`).
