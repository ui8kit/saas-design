# brand-os: malformed `tokens.color.categories` pass validation and emit `#000000`

Status: worked-around (we now pass `{ light, dark }`)

## Context
`AliasColorToken` is `{ light, dark, aliases?, referenceAliases? }`. We first passed `{ value: "hsl(...)" }`.
`brand-os validate` returned `ok: true`, and `emit` wrote `category-brandPink: "#000000"` (8 entries) into
`DESIGN.md` front matter.

## Repro
Contract with `tokens.color.categories = { pink: { value: "hsl(359 97% 88%)" } }`
-> `npx brand-os@0.3.0 validate --schema c.json --json` (ok) -> `emit` -> `grep category DESIGN.md`.

## Impact
Silent wrong colors in the agent-facing DESIGN.md; violates "validate unknown JSON at runtime before typed use"
from brand-os AGENTS.md.

## Proposed fix
Validate `categories.*.light` (required string, parseable color) and `dark`; fail with `required_string`.
