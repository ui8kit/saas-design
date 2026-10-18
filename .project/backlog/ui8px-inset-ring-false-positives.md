# ui8px: `inset-ring` utilities flagged as an inset spacing conflict

Status: worked-around

**Context.** ui8px groups every `inset-*` token into one spacing conflict group. `inset-ring inset-ring-input` (ring width + ring color) is therefore reported as a conflict (UI8PX004), although both are Tailwind v4 inset-ring utilities and do not conflict.

**Workaround.** `tools/css-apply.ts` puts the inset-ring *color* utilities into a second `@apply` on the same selector. The reviewed `inset-ring-*` utilities are listed in `tools/ui8px/allowed.extra.json`.

**Impact.** Generated CSS has two `@apply` rules for some selectors, and the extras list carries ring colors as "inset" entries.

**Proposed fix.** Make ui8px recognise `inset-ring` / `inset-ring-<color>` / `inset-shadow-*` as their own groups, separate from `inset-<n>`.
