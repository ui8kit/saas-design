# blocks DSL: no part files, so a second landmark inside a block needs a raw tag

Status: open (baselined in `tools/lint-apps.baseline.json`)

**Context.** codegen 2.0 rule `block-root` allows one `Block` per render path and no nested Block. A landmark inside a
block (the `<nav>` of `footer-simple`) has to be its own part file opening on `Block tag="nav"` (upstream: `NavBlock`,
`authoring/components/landmarks.ts`). The DSL of `packages/blocks/scripts/generate.ts` emits one file per block only.

**Impact.** `footer-simple` keeps `h("nav", …)`; `tools/lint-apps.ts` reports `raw <nav>` in the three runtimes, accepted
in the baseline.

**Proposed fix.** Let the DSL declare parts (`part("footer-simple-nav", c("Block", { tag: "nav" }, …))`) emitted as
sibling files in every runtime and rendered like `use(...)`.
