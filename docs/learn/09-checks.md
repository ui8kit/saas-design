# 9. Checks

`bun run check` runs [`tools/check.sh`](../../tools/check.sh). It stops at the first failure. In order, it checks:

1. docs links and anchors ([`tools/check-links.ts`](../../tools/check-links.ts));
2. fixture drift and the contract;
3. icons, primitives (drift + parity) and blocks (drift + parity);
4. ui8px policy drift and the lint gate, plus the no-brand-tokens grep;
5. app-level retag + block rules (`tools/lint-apps.ts`);
6. packages compile standalone;
7. the site build, the design-docs foundations drift, both design-app builds, and design parity;
8. the layout audit ([`tools/audit-layout.ts`](../../tools/audit-layout.ts)): no overflow and no content within 8px of a bordered/filled surface edge, at 390/768/1024/1440 in all three apps.

Drift checks use `git diff --quiet`, which compares the working tree with the **index**. Stage generated files (`git add -A`) before you run check on uncommitted work.

Beyond `check`:

- `bun run test:behaviors` ([`tools/test-behaviors.ts`](../../tools/test-behaviors.ts)): Sheet and ThemeToggle in a headless Chrome at 390px, three apps, 27 assertions.
- `bun run shots` ([`tools/shots.ts`](../../tools/shots.ts), [`tools/measure.ts`](../../tools/measure.ts)): site vs Figma, with section height deltas in `report.json`.
- `bun run shots:modes` ([`tools/shots-modes.ts`](../../tools/shots-modes.ts)): light/dark/mobile screenshots. [`tools/docs-assets.py`](../../tools/docs-assets.py) then optimizes them into `docs/assets`.

Every step and its numbers: [checks](../checks.md). Common failures: [troubleshooting](../troubleshooting.md).

Next: [deploy](10-deploy.md).
