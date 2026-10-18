# fig2design: 7 of 14 images have empty `usedBy`

Status: open

## Context
`images/index.json` lists 14 images; 7 have `usedBy: []`, `width/height: null`. They are still copied
to `images/` (about 1.3 MB of the 2 MB).

## Repro
`jq '[.images[]|select(.usedBy|length==0)]|length' images/index.json` -> 7.

## Impact
Consumers cannot tell if these are leftovers from deleted layers (safe to drop) or used by something the
parser skipped (hidden layers, components on the internal canvas, styles).

## Proposed fix
Add `reason` (`unreferenced` vs `hidden-node` vs `internal-canvas`) and a `--drop-unused-images` flag.
