# Manual — saas-design (Figma → fixtures → packages → apps)

For people and agents. Run every command from the repo root unless a `cd` is shown. Order matters.

| # | Guide | Output |
|---|-------|--------|
| 0 | [00-setup.md](00-setup.md) | toolchain, `bun install` |
| 1 | [01-extract-figma.md](01-extract-figma.md) | `fixtures/figma/` (fig2design) |
| 2 | [02-fixtures-contract.md](02-fixtures-contract.md) | `fixtures/content/records`, `fixtures/views` |
| 3 | [03-tokens-brand-os.md](03-tokens-brand-os.md) | `packages/tokens/theme.css`, app `brand.css`, brand-os bundle |
| 4 | [04-adapter-packages.md](04-adapter-packages.md) | `packages/ui`, `packages/icons`, `packages/blocks`, `packages/adapter` |
| 5 | [05-apps.md](05-apps.md) | `apps/site/public`, `apps/design/build` |
| 6 | [06-checks.md](06-checks.md) | `bun run check` |
| 7 | [07-screenshots.md](07-screenshots.md) | `/workspace/shots-saas/` |
| 8 | [08-deploy-vercel.md](08-deploy-vercel.md) | two Vercel projects |
| 9 | [09-dark-mode-behaviors.md](09-dark-mode-behaviors.md) | dark tokens, ThemeToggle/Sheet bricks, `ui8kit.js` |

Long-form English guides: [../README.md](../README.md), [../AGENTS.md](../AGENTS.md), [../docs/](../docs/architecture.md) (architecture, new Figma file, new runtime, checks, Vercel, troubleshooting). This manual is the terse command reference; it is already in English and is kept as is.

Rules the steps rely on: `.cursor/rules/*.mdc`. Agent skill: `.cursor/skills/figma-to-site/SKILL.md`.
