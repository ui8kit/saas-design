# fig2design: named colors land in `orphans`, counts say `variables: 0`

Status: open

## Context
The file has 7 named colors (Dark #111827, Grey Text #4b5563, Pink #fec6c7, Light Purple #d9b8d5,
Orange #fe5d33, Light Blue #dbedfb, Light Grey #f6f6f6). The dump reports `counts.variables: 0`,
the collection `Variable collection` has `variables: []`, and the colors are in `variables.json`
`orphans[]` with `collection: null`. `usedVariables` of the frame is `[]` even though every fill uses
these exact hex values.

## Repro
`fig2design parse saas.fig -o out --json | jq .counts` -> `variables: 0`; `jq '.orphans|length' out/variables.json` -> 7.

## Impact
Token extraction has to read `orphans` and match fills by hex; a consumer trusting `counts` or
`usedVariables` concludes the file has no tokens.

## Proposed fix
Count orphans (`counts.orphanVariables`), explain in the schema why a variable is an orphan
(deleted collection? detached?), and when a fill is not bound but equals an orphan value, report it in a
`suggestedVariables` list per frame.
