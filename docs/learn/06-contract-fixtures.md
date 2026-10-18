# 6. Contract and fixtures

Copy and media never live in components. They flow one way:

1. **Extract.** `bun run extract` ([`tools/extract.sh`](../../tools/extract.sh)) reads the `.fig` file (kept **outside** the repo) into [`fixtures/figma/`](../../fixtures/figma).
2. **Records.** `bun run content` ([`tools/content.ts`](../../tools/content.ts)) turns Figma texts and images, plus authored content in `fixtures/content/source/`, into [@ui8kit/contract](https://github.com/ui8kit/contract) records in `fixtures/content/records/`.
3. **Validate.** `bun run contract` ([`tools/validate-content.ts`](../../tools/validate-content.ts)) checks 206 records against the JSON Schemas and the v0.4 collection validator, plus the local reference checks. The result must be 0 errors and 0 warnings.
4. **Views.** `bun tools/views.ts` ([`tools/views.ts`](../../tools/views.ts)) builds the block props:
   - [`fixtures/views/home.json`](../../fixtures/views/home.json): the site page, a list of `{ block, region, data }`;
   - [`fixtures/views/blocks.json`](../../fixtures/views/blocks.json): one sample per block for the design apps.

Every runtime renders the same view JSON, so a copy change is one edit plus a regenerate. `tools/check.sh` regenerates all fixtures and fails on drift.

The editor rule is [`.cursor/rules/fixtures-contract.mdc`](../../.cursor/rules/fixtures-contract.mdc).

Next: [adapter](07-adapter.md).
