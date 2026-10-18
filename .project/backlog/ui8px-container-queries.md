# ui8px: container-query variants (`@container`, `@5xl:`) are not parsed

Status: worked-around (`tools/ui8px-gate.ts`: report-only when the utility behind the variant passes the policy)

**Context.** The Figma navbar shows or hides its menu by viewport (burger below `lg`, user decision), but its sizes
(link `text-lg`, menu `gap-8`, CTA `px-8`) only fit when the nav itself is about 1100px wide. In a design-app preview next to
the sidebar the nav is narrower than the viewport, so viewport breakpoints overflow. Tailwind v4 container queries
(`@container` on the nav, `@5xl:text-lg` on the links) size it by its own width.

**Impact.** `ui8px lint` reports UI8PX002 "Unsupported modifier chain: @5xl" and "Unknown utility class: @container".

**Proposed fix.** ui8px: accept `@container`, `@container/<name>` and `@<size>:` / `@max-<size>:` variants, and lint the
utility behind them with the normal scope rules (spacing grid, colors).
