#!/usr/bin/env bash
# Vercel deploy shim: the existing Vercel project "saas-design" (saas-svelte.vercel.app) still has
# Root Directory = apps/design (the app was renamed to apps/design-svelte). This builds design-svelte
# and copies its static output here, so that project keeps deploying. See README in this folder.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE/../design-svelte"
node ../../tools/copy-media.mjs static
npx vite build
rm -rf "$HERE/build"
cp -R build "$HERE/build"
echo "apps/design: copied $(find "$HERE/build" -name '*.html' | wc -l) pages from apps/design-svelte/build"
