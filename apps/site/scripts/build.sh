#!/usr/bin/env bash
# Static build of apps/site: templ export (Go) + Tailwind CLI + local media.
#   bash apps/site/scripts/build.sh      → apps/site/public
set -euo pipefail
SITE="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$SITE/../.." && pwd)"
export PATH="$ROOT/.vercel-go/go/bin:$PATH"
cd "$SITE"
rm -rf public && mkdir -p public/assets
go run ./cmd/export -views "$ROOT/fixtures/views" -out public -theme-init "$ROOT/packages/ui/behaviors/theme-init.js"
cp "$ROOT/packages/ui/behaviors/ui8kit.js" public/assets/ui8kit.js
npx --no-install @tailwindcss/cli -i styles/app.css -o public/assets/app.css --minify
node "$ROOT/tools/copy-media.mjs" public
echo "site: built $(find public -type f | wc -l) files"
