#!/usr/bin/env bash
# Vercel installCommand for apps/design-react (Root Directory = apps/design-react). Installs the bun workspace at the repo root.
set -euo pipefail
cd "$(dirname "$0")/../../.."
if command -v bun >/dev/null 2>&1; then bun install --frozen-lockfile; else npm install --no-audit --no-fund; fi
