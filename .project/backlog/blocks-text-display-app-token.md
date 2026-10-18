# blocks: `text-display` / `max-w-page` come from app-level theme vars

Status: open

**Context.** `packages/blocks` uses `text-display` (cta-split title, not-found code) and `max-w-page` (section containers). Their
theme variables (`--text-display`, `--container-page`) are emitted by tools/tokens.ts into each **app's** `brand.css`, not into
`packages/tokens/theme.css`.

**Impact.** A new app that imports packages/tokens + packages/adapter but not a brand.css gets a Tailwind build error / missing
utilities. It also blurs the rule "packages use shadcn tokens only".

**Proposed fix.** Move size/layout theme vars that packages depend on (`--text-display*`, `--container-page`) into
`packages/tokens/theme.css` (they are not colors and not brand), keep only `--brand-*` colors app-level.
