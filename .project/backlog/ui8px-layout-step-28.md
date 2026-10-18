# ui8px: layout spacing preset stops at 24 (96px)

Status: worked-around

**Context.** Figma section rhythm is 110px. The ui8px go preset layout steps end at `24` (96px), so sections sat 14px too close
(7 gaps → −98px page height).

**Change.** `tools/ui8px/allowed.base.json` layout spacing gains `28` (112px, still on the 8px grid); sections use `pt-28`.

**Proposed fix.** Preset should include the 8px multiples above 96 that Tailwind ships (`28 32 36 40 …`), or allow extending steps in `allowed.extra.json`.
