# Contributing

Thanks for helping. This repo is a viability check for a generated Figma → site + design-system pipeline, so **reproducibility beats hand-tuning**.

## Before you start

```bash
bun install
bun run check          # must end with "all checks passed"
```

Prerequisites and app commands are in the [README](README.md#quickstart). The architecture is described in [docs/architecture.md](docs/architecture.md).

## Rules

The full list is in [AGENTS.md](AGENTS.md#golden-rules) and [.cursor/rules/](.cursor/rules). They apply to humans too:

- **Edit sources, never generated files.** Change `fixtures/tokens/mapping.json`, `tools/content.ts`, `tools/views.ts`, `packages/ui/recipes`, `packages/ui/bricks` or `packages/blocks/defs`, then regenerate.
- **No `.fig` files in the repo.**
- **Styling:**
  - only semantic `ui-*`/`ds-*` classes in markup;
  - utilities only inside `@apply`;
  - no inline styles;
  - the 8 + 4 grid and token colors only.
- **Templ and Svelte stay in parity.** Change both through the generators.
- **One `bun run check` per commit.** Never push a red check.

## Commits and pull requests

- Keep commits small, one logical step each, with a message that says what changed and why.
- Do not force-push, and do not amend or rebase commits that are already pushed.
- In the PR, include:
  - the `bun run check` result;
  - for visual changes, before/after screenshots (`bun run shots`, `bun run shots:modes`) and any change in `report.json` deltas;
  - for behaviour changes, the `bun run test:behaviors` output.
- Update the docs (`README.md`, `AGENTS.md`, `docs/`, `.manual/`) when a command, path or rule changes.

## Reporting tool problems

Add one file per issue to [.project/backlog/](.project/backlog/README.md), named `<tool>-<issue>.md`, with Status, Context, Impact and Proposed fix. Update [.project/STATUS.md](.project/STATUS.md) when a deliverable changes state.

## License

There is no LICENSE file yet (see [README → License](README.md#license)). Until one is added, ask the maintainers before reusing the code.
