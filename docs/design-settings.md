# Design settings (Habitus on codegen 2.0)

How the Habitus corner, spacing and control settings map onto the mechanisms of `@ui8kit/codegen` 2.0, and why each
local value exists. Measurements come from the Figma frame (`fixtures/figma/frames/1-10.json`) and from the built site
(`bun tools/measure.ts <selector>`); the Figma/site comparison is `bun tools/shots.ts` (`/workspace/shots-saas/report.json`).

## Corners

| Setting | Value | Where | Why |
|---|---|---|---|
| `--radius` | `2.5rem` (40px) | `@theme` in [packages/tokens/theme.css](../packages/tokens/theme.css), from `radius.base` of [fixtures/tokens/mapping.json](../fixtures/tokens/mapping.json) | The one corner token of 2.0: plain `rounded` reads it. The frame has 40px on 23 cards and bands. |
| `rounded-md` | `calc(var(--radius) * 0.5)` = 20px | `@theme inline` | Phone screens in the frame (9 nodes at 20px). |
| `rounded-sm`, `rounded-xl` | 0.25× / 1.5× | `@theme inline` | Kept for the foundations page; the frame does not use them. |
| pills | `rounded` on controls, `rounded-full` on circles | recipes | 40px on a control of 32–56px clamps to a pill, so the button, input and select recipes use plain `rounded` like upstream (no `rounded-full` override). |

Before this, `--radius` sat only in `:root`. Plain `rounded` then compiled to Tailwind's `0.25rem`, so every upstream
primitive that relies on the corner token (textarea, alert, dialog, disclosure, fieldset card, meter, progress, range,
skeleton, theme toggle, sheet trigger) had 4px corners. Now they follow the Habitus corner, as 2.0 intends.

The 2.0 multipliers (`sm` 0.6, `md` 0.8, `xl` 1.4 in `xgen/runtimes/core/assets/styles/theme.css`) are tuned for a 10px
corner. On a 40px corner they give 24/32/56px, sizes the frame never uses, so the derived steps stay on the measured values.

The per-element tokens of 2.0 (`--radius-card|button|badge|alert|media`, `--shadow-*`, `data-density-*`, in `kit.css`)
match `[data-slot].<utility>` selectors, and this repo's markup carries only `ui-*` classes. They are copied into
`packages/adapter/src/kit.generated.css` but never apply. See backlog
[codegen2-kit-css-layering.md](../.project/backlog/codegen2-kit-css-layering.md).

## Spacing

- **Grid.** The policy starts from the codegen 2.0 ui8px grid (`packages/ui/.xgen/.ui8px/policy/allowed.json`): layout =
  every 8px step 0–160, controls = 4px steps up to 16, then 8px steps.
- **Rhythm.** [tools/ui8px/allowed.base.json](../tools/ui8px/allowed.base.json) narrows that grid to the steps Habitus
  uses: layout `0 2 4 6 8 10 12 16 20 24 28`, controls `0–8 10 12 14`.
  [tools/ui8px-policy.ts](../tools/ui8px-policy.ts) writes the intersection and fails if a rhythm step is off the 2.0 grid.
- **Section gap `28`** (112px, Figma 110px) is an ordinary 2.0 layout step. It is no longer a local extension of the old
  ui8px preset (backlog [ui8px-layout-step-28.md](../.project/backlog/ui8px-layout-step-28.md), fixed).

## Responsive spacing

Desktop (Figma) values sit at `lg:` / `xl:`, so the 1440 page is unchanged; tablet and mobile step down on the same rhythm.

| Where | base (390) | `md:` (768) | `lg:` (1024+) |
|---|---|---|---|
| Block gutter (root of every block) | `px-6` | `px-10` | `px-12` |
| Content container | `mx-auto w-full max-w-page`, no padding | | |
| Section padding (kit `section`) | `py-16` | `py-20` | `py-24` |
| Figma section top step | `pt-16` | `pt-20` | `pt-28` |
| Container gaps | `gap-8` | `gap-10` | `gap-12` |
| Card recipe | `p-6` | `p-8` | `p-12` |
| Card grids (kit `grid-3`) | 1 column, `gap-6` | 2 columns | 3 columns, `gap-10` |

- Every bordered or filled surface keeps at least 8px (`2`) of padding around its content at every width; `bun tools/audit-layout.ts` (in check) enforces it.
- Media boxes use aspect ratios (`aspect-video`, `aspect-square`), not fixed heights; the image inside takes a share of the width (`w-1/2`).
- Meta rows (badge + date) are `flex-wrap gap-x-4 gap-y-2` with a `whitespace-nowrap` date.
- The navbar sizes by its own width (`@container`, `@5xl:`), show/hide still by the viewport (burger below `lg`). Container-query variants are report-only in the ui8px gate ([backlog](../.project/backlog/ui8px-container-queries.md)).
- Design apps: the sidebar is a sheet below `xl` (1280px), so previews get the full width on tablets and small laptops.

## Controls

| Control | sm / default / lg / xl | Upstream 2.0 | Why it differs |
|---|---|---|---|
| Button | `h-8 px-3` / `h-10 px-6` / `h-12 px-6` / `h-14 px-10` | `h-8 px-3` / `h-10 px-4` / `h-12 px-6` | default `px-6`: Figma nav button 113×40 (site 111×40). `xl` is added to the upstream `size` key (allowed: values, not keys). It matches the Figma hero, CTA and pricing buttons (56–58px tall, 40px side padding). It was `lg` = `h-12 px-10`, 10px short of the frame. |
| Badge | `h-6 px-2` / `h-7 px-3` / `h-8 px-4` | `h-5` / `h-6` / `h-8` | Figma pricing badge is 28px (site 28) and the hero badge is 32px (site 32). |
| Input, select | `h-8` / `h-10 px-6` / `h-12 px-6` | `h-8 px-3` … | Figma footer input 285×42 with pill padding (site 268×40). |

The 2.0 control heights `h-8 / h-10 / h-12` stay the shared scale. `h-14` exists only as the extra `xl` value of Button.

## Effect on fidelity (1440px, `bun tools/shots.ts`)

| | before | after |
|---|---|---|
| page height (Figma 6288) | 6269 | 6277 |
| pricing Δh | −23 | −15 |
| hero / CTA buttons | 48px | 56px (Figma 58) |

Other sections are unchanged: hero −9, why −3, social proof 0, inside +15, testimonials −16, CTA −9, FAQ +24, footer −7.
