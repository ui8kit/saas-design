#!/usr/bin/env bash
# Root quality gate: generators in --check mode, runtime parity (templ/svelte/react), ui8px lint, contract, app builds + design app DOM parity.
#   bun run check
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
step() { printf '\n== %s\n' "$*"; }

step "docs: relative links + anchors"
bun tools/check-links.ts
step "fixtures: content, views, tokens (drift)"
bun tools/content.ts --check
bun tools/views.ts --check
bun tools/tokens.ts --check
step "contract (@ui8kit/contract)"
bun tools/validate-content.ts
step "packages/icons"
(cd packages/icons && bun scripts/generate.ts --check)
step "packages/ui: codegen 2.0 drift + templ/svelte/react parity"
(cd packages/ui && bun scripts/generate.ts --check && bun scripts/showcase.ts --check && bun --preload ../../tools/svelte-preload.ts scripts/parity.ts)
(cd packages/ui/templ && go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path ui >/dev/null && go vet ./... && go build ./...)
git diff --quiet -- packages/ui/templ && [ -z "$(git ls-files --others --exclude-standard packages/ui/templ)" ] || { echo "drift: packages/ui/templ *_templ.go (run templ generate)"; exit 1; }
node --check packages/ui/behaviors/ui8kit.js && node --check packages/ui/behaviors/theme-init.js
step "packages/blocks: DSL drift + templ/svelte/react parity"
(cd packages/blocks && bun scripts/generate.ts --check && bun --preload ../../tools/svelte-preload.ts scripts/parity.ts)
step "ui8px policy drift + lint"
bun tools/ui8px-policy.ts --check
bun tools/ui8px-gate.ts
# app-level brand tokens must never reach packages/ (ui8px cannot scope allowed utilities, see .project/backlog)
if grep -rEn --exclude-dir=node_modules '(bg|text|border|fill|stroke|ring|from|to)-brand-|var\(--brand-' packages/; then echo "brand tokens used in packages/"; exit 1; fi
step "app-level retag + block rules (codegen 2.0 rules detectors on apps/* and generated blocks)"
bun tools/lint-apps.ts
step "packages compile standalone (tokens + adapter, no app brand.css)"
npx --no-install @tailwindcss/cli -i packages/adapter/test/standalone.css -o /tmp/saas-design-standalone.css 2>&1 | tee /tmp/saas-design-standalone.log | tail -1
if grep -q "Error" /tmp/saas-design-standalone.log; then echo "packages depend on app-level CSS"; exit 1; fi
step "apps/site: templ generate (no drift) + static build"
(cd apps/site && go run github.com/a-h/templ/cmd/templ@v0.3.1070 generate -path views >/dev/null)
git diff --quiet -- apps/site/views || { echo "drift: apps/site/views (run templ generate)"; exit 1; }
bash apps/site/scripts/build.sh
step "apps/design-shared: generated foundations drift"
(cd apps/design-shared && bun run check)
step "apps/design-svelte: SvelteKit static build"
(cd apps/design-svelte && bun run build >/dev/null && echo "design-svelte: built $(find build -name '*.html' | wc -l) pages")
step "apps/design-react: tsc + Vite SSR build + static prerender"
(cd apps/design-react && ../../node_modules/.bin/tsc -p . && bun run build >/dev/null && echo "design-react: built $(find build -name '*.html' | wc -l) pages")
step "design apps: DOM parity design-react vs design-svelte (every prerendered page)"
bun tools/design-parity.ts
printf '\nall checks passed\n'
