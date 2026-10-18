# 7. Screenshots (outside the repo: /workspace/shots-saas)

```bash
bun run render:figma                   # Figma frame → /workspace/shots-saas/figma/1-10.html
bash apps/site/scripts/build.sh
bun run shots                          # figma-1-10-home.png, site-home.png, sections/figma-*.png + site-*.png, compare/, report.json
cd apps/design && bun run build && cd -
bun run shots:design                   # design-overview.png, design-foundations-colors.png, design-components.png, …
bun tools/shots-design.ts /workspace/shots-saas /blocks/hero-phones   # specific pages
```

`report.json` lists per section `figma.y/height`, `site.y/height` and `delta`. Fix the largest `delta.height` first (in the block def `css:`), rerun.
