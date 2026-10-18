# 6. Checks

```bash
bun run check                          # tools/check.sh
```

Runs, in order, failing fast:
0. `check-links.ts` (relative links + anchors in all docs)
1. `content.ts / views.ts / tokens.ts --check` (fixture drift)
2. `validate-content.ts` (@ui8kit/contract)
3. icons, ui, blocks `generate.ts --check` + ui/blocks `parity.ts` (templ vs svelte DOM)
4. `ui8px-policy.ts --check`, `npx ui8px@latest lint`, brand-token guard for `packages/`
5. apps/site templ generate (no drift) + build
6. apps/design-svelte `check` (generated data drift) + build

Not in `check` (network/slow): `bun run brand:check`, screenshots.
