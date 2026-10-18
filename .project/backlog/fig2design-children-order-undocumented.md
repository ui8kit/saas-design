# fig2design: paint order of `children` is not documented

Status: open

## Context
In `frames/<id>.json` the children of `Home` are listed Footer ... Hero, and inside `Hero` the
background `Rectangle 6` comes first. So `children` is back-to-front paint order (the reverse of the
Figma layers panel). The JSON Schema (`fig2design schema dump`, `$defs.node.children`) says only
`array of node`.

## Repro
`fig2design schema dump | grep -n children` -> no description. Compare `frames/1-10.json` root children
with the Figma layers panel.

## Impact
A renderer or codegen that assumes panel order paints backgrounds over content, and a section list built
from `children` is bottom-up (we had to reverse it; `sections[]` is also bottom-up).

## Proposed fix
Document "children are in paint order, first = bottom" in the schema `description`, and emit `sections`
sorted by `y` (or add an explicit `order` field).
