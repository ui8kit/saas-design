# fig2design: `npx fig2design@0.1.0` fails inside the source checkout

Status: open (minor)

## Repro
`cd /workspace/figma-cli && npx -y fig2design@0.1.0 help` -> `sh: 1: fig2design: not found`.
From any other directory it works.

## Impact
Confusing for contributors running the documented command from the repo root.

## Proposed fix
Note in CONTRIBUTING to use `node bin/fig2design.cjs` inside the checkout (npm resolves the local
package of the same name and does not link its bin).
