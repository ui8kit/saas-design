# 3. Tokens (shadcn HSL) and brand-os

```bash
$EDITOR fixtures/tokens/mapping.json   # shadcn role → Figma variable name or hex, light + dark
bun run tokens                         # → fixtures/tokens/tokens.json, packages/tokens/theme.css,
                                       #   apps/site/styles/brand.css, apps/design-svelte/src/lib/styles/brand.css
bun run brand:emit                     # brand-os@0.3.0 bundle → fixtures/tokens/brand.generated
bun run brand:check                    # validate + verify --strict
```

- `packages/tokens/theme.css` = shadcn set only (`--background … --sidebar-ring`, `--radius`, `--font-sans`), `hsl()` values.
- Colors without a shadcn role → `--brand-*` in the **app** `brand.css` files only. `bun run check` fails if `packages/` uses them.
- Check: `bun tools/tokens.ts --check`.
