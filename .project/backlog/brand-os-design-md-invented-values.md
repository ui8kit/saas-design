# brand-os: DESIGN.md front matter contains values the contract does not declare

Status: open

## Context
README/AGENTS.md: "The CLI never silently replaces missing brand decisions with ... presets". Our contract
declares `typography.sizes` (85, 60, 36 ... px from Figma) and `radius sm/md/lg`, yet `DESIGN.md` front matter has
`display-lg: 3rem / 700 / 1.1`, `body-md lineHeight 1.55`, `spacing xs..xl 4/8/16/24/48px`,
`button-primary-hover.backgroundColor: {colors.accent}` and `rounded.xl: 2.5rem`. None of these came from the input.
Chart keys are also double-prefixed: `chart-chart-1`.

## Repro
`bun run brand:emit` in this repo, open `fixtures/tokens/brand.generated/DESIGN.md`.

## Impact
Agents reading DESIGN.md (the "human/agent exchange view") get a type scale and hover rule that contradict
the Figma tokens (hero title is 60px/500, not 3rem/700).

## Proposed fix
Derive `typography.*` from `tokens.typography.sizes/weights/lineHeights` when present, omit keys that are
not declared (or mark them `# default` in a comment), and strip the `chart-` prefix when the key already has it.
Other notes: requires Node >= 22 (`EBADENGINE` warning on Node 20, but it works).
