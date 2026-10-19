#!/usr/bin/env bash
# Figma .fig → fixtures/figma (fig2design dump). The .fig stays outside the repo.
#   FIG=/path/to/file.fig bun run extract      (default: figma.fig in fixtures/site.config.json, relative to the repo)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIG="${FIG:-$(bun "$ROOT/tools/config.ts" fig)}"
case "$(cd "$(dirname "$FIG")" && pwd)/" in "$ROOT"/*) echo "refusing: keep the .fig outside the repo ($FIG)"; exit 1;; esac
cd /tmp # npx fig2design does not link its bin inside a checkout named fig2design (.project/backlog/fig2design-npx-inside-source.md)
npx -y fig2design@0.1.0 parse "$FIG" --out "$ROOT/fixtures/figma" --no-config
