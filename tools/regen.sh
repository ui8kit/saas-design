#!/usr/bin/env bash
# Rerun every generator in dependency order (write mode), then you run `bun run check`.
#   bun run regen
# tokens (mapping.json → theme.css, brand.css, brand contract) → content (records; colours/names feed them)
# → icons → packages/ui → packages/blocks (+ templ) → views (needs catalog.json + catalogData)
# → ui8px policy (needs classes.json) → contract validation.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
TEMPL="go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate"
step() { printf '\n== %s\n' "$*"; }
step "tokens";            bun tools/tokens.ts
step "content";           bun tools/content.ts
step "icons";             (cd packages/icons && bun scripts/generate.ts)
step "packages/ui";       (cd packages/ui && bun scripts/generate.ts && bun scripts/showcase.ts && cd templ && $TEMPL -path ui >/dev/null)
step "packages/blocks";   (cd packages/blocks && bun scripts/generate.ts && cd templ && $TEMPL -path blocks >/dev/null)
step "views";             bun tools/views.ts
step "ui8px policy";      bun tools/ui8px-policy.ts
step "design-docs";       (cd packages/design-docs && bun scripts/foundations.ts)
step "apps/site templ";   (cd apps/site && $TEMPL -path views >/dev/null)
step "contract";          bun tools/validate-content.ts
printf '\nregenerated; now run: bun run check\n'
