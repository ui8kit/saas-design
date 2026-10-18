#!/usr/bin/env bash
# Root quality gate: generators in --check mode, runtime parity, ui8px lint, contract, both app builds.
#   bun run check
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
step() { printf '\n== %s\n' "$*"; }

step "fixtures: content, views, tokens (drift)"
bun tools/content.ts --check
bun tools/views.ts --check
bun tools/tokens.ts --check
step "contract (@ui8kit/contract)"
bun tools/validate-content.ts
step "packages/icons"
(cd packages/icons && bun scripts/generate.ts --check)
step "packages/ui: codegen drift + templ/svelte parity"
(cd packages/ui && bun scripts/generate.ts --check && bun --preload ../../tools/svelte-preload.ts scripts/parity.ts)
step "packages/blocks: DSL drift + templ/svelte parity"
(cd packages/blocks && bun scripts/generate.ts --check && bun --preload ../../tools/svelte-preload.ts scripts/parity.ts)
step "ui8px policy drift + lint"
bun tools/ui8px-policy.ts --check
npx -y ui8px@latest lint
step "apps/site: templ generate (no drift) + static build"
(cd apps/site && go run github.com/a-h/templ/cmd/templ@v0.3.1001 generate -path views >/dev/null)
git diff --quiet -- apps/site/views || { echo "drift: apps/site/views (run templ generate)"; exit 1; }
bash apps/site/scripts/build.sh
step "apps/design: generated data drift + SvelteKit static build"
(cd apps/design && bun run check && bun run build >/dev/null && echo "design: built $(find build -name '*.html' | wc -l) pages")
printf '\nall checks passed\n'
