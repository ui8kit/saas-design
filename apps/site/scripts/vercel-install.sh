#!/usr/bin/env bash
# Vercel installCommand for apps/site (NOT VERIFIED on Vercel — see .manual/08-deploy-vercel.md).
# 1) JS deps for the Tailwind CLI (bun workspaces at the repo root).
# 2) Go toolchain: Vercel's build image does not guarantee Go, so install a pinned one if missing.
set -euo pipefail
GO_VERSION="${GO_VERSION:-1.23.4}"
cd "$(dirname "$0")/../../.."
if command -v bun >/dev/null 2>&1; then bun install --frozen-lockfile; else npm install --no-audit --no-fund; fi
if ! command -v go >/dev/null 2>&1; then
  mkdir -p .vercel-go
  curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -xz -C .vercel-go
  echo "installed go ${GO_VERSION} into .vercel-go/go"
fi
