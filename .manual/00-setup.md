# 0. Setup

Needs: **bun ≥ 1.2**, **node ≥ 20**, **go ≥ 1.23** (templ is run pinned through `go run`), Google Chrome at `/usr/bin/google-chrome` (or `CHROME=/path`) for screenshots.

```bash
git clone https://github.com/ui8kit/saas-design && cd saas-design
bun install                  # root workspace: packages/*, apps/*
bun run check                # everything should be green before you change anything
```

The Figma source (`saas.fig`) is **not** in the repo. Keep it e.g. at `/workspace/fig-fixtures/saas.fig`; `*.fig` is git-ignored.
