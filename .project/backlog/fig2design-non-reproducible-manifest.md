# fig2design: manifest carries host path and timestamp

Status: open

## Context
`manifest.json` has `source.path: "/workspace/fig-fixtures/saas.fig"` (absolute host path) and
`generatedAt`. Committing a dump to a repo therefore leaks a local path and every re-parse produces a diff
even when the `.fig` (sha256) did not change.

## Repro
Parse the same file twice: `diff out1/manifest.json out2/manifest.json` -> `generatedAt` differs.

## Impact
Noise in git history; `fixtures/figma` cannot be checked with "regenerate and diff" in CI.

## Proposed fix
`--reproducible` flag (or default) that writes `source.file` + `sha256` only and omits `generatedAt`
(or takes it from `SOURCE_DATE_EPOCH`).
