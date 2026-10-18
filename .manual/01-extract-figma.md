# 1. Extract the Figma file (fig2design)

```bash
FIG=/workspace/fig-fixtures/saas.fig bun run extract
# = cd /tmp && npx -y fig2design@0.1.0 parse "$FIG" --out <repo>/fixtures/figma --no-config
```

Writes `fixtures/figma/{manifest,document,variables,styles,components}.json`, `frames/<id>.json`, `images/`.
Optional: `npx -y fig2design@0.1.0 list "$FIG"` to see pages/frames; `--frames 1:10` to limit.

Check: `fixtures/figma/manifest.json` → `source.sha256` matches the file you meant; `git diff --stat fixtures/figma`.
The script refuses a `.fig` inside the repo. Known tool issues: `.project/backlog/fig2design-*.md`.

Reference render for screenshots (HTML of the frame, outside the repo): `bun run render:figma` → `/workspace/shots-saas/figma/1-10.html`.
