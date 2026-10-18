# ui8px: layout spacing preset stops at 24 (96px)

Status: fixed (codegen 2.0)

**Context.** Figma section rhythm is 110px. The ui8px go preset layout steps end at `24` (96px), so sections sat 14px too close
(7 gaps → −98px page height).

**Change.** `tools/ui8px/allowed.base.json` layout spacing gains `28` (112px, still on the 8px grid); sections use `pt-28`.

**Proposed fix.** Preset should include the 8px multiples above 96 that Tailwind ships (`28 32 36 40 …`), or allow extending steps in `allowed.extra.json`.

**Resolution (2026-10-18).** The ui8px policy of codegen 2.0 (`packages/ui/.xgen/.ui8px/policy/allowed.json`) allows every 8px layout step 0–160, so `28` is an ordinary grid step. `tools/ui8px-policy.ts` takes the 2.0 grid and narrows it to the Habitus rhythm of `tools/ui8px/allowed.base.json` (layout `0 2 4 6 8 10 12 16 20 24 28`); a rhythm step off the 2.0 grid fails the policy step. See `docs/design-settings.md`.
