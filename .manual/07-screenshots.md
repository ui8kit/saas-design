# 7. Screenshots (outside the repo: /workspace/shots-saas)

```bash
bun run render:figma                   # Figma frame → /workspace/shots-saas/figma/1-10.html
bash apps/site/scripts/build.sh
bun run shots                          # figma-1-10-home.png, site-home.png, sections/figma-*.png + site-*.png, compare/, report.json
cd apps/design-svelte && bun run build && cd -
bun run shots:design                   # design-overview.png, design-foundations-colors.png, design-components.png, …
bun tools/shots-design.ts /workspace/shots-saas /blocks/hero-phones   # specific pages
bun run shots:modes                    # site-light/dark/mobile/mobile-menu/mobile-dark-menu.png, design-light/dark/dark-*/mobile/mobile-menu.png
bun run test:behaviors                 # sheet + theme toggle behaviour assertions (both apps @390px)
```

`report.json` lists per section `figma.y/height`, `site.y/height` and `delta`. Fix the largest `delta.height` first (in the block def `css:`), rerun.
