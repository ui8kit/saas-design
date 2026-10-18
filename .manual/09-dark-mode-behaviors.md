# 9. Dark mode, ThemeToggle, Sheet (shared behaviours)

```bash
# dark colors: edit fixtures/tokens/mapping.json (dark + brand.dark), then
bun run tokens                         # packages/tokens/theme.css (+ dark block) and app brand.css (light + dark)
bun run content && bun tools/views.ts  # contract records / views pick up token changes
# local bricks (ThemeToggle, Sheet, SheetTrigger, SheetClose) live in packages/ui/bricks
cd packages/ui && bun run generate && bun run parity && cd -
node --check packages/ui/behaviors/ui8kit.js packages/ui/behaviors/theme-init.js
bash apps/site/scripts/build.sh        # copies ui8kit.js → public/assets, inlines theme-init in <head>
cd apps/design && bun run build && cd -
bun run test:behaviors                 # Chrome @390px, both apps: sheet trap/Esc/overlay/focus restore, toggle persistence
bun run shots:modes                    # light/dark/mobile/mobile-menu screenshots → /workspace/shots-saas
```

- `.dark` on `<html>` comes from `packages/ui/behaviors/theme-init.js` (the only inline script; `localStorage.theme`, else `prefers-color-scheme`). Toggle and sheet logic: `packages/ui/behaviors/ui8kit.js` (hooks: `data-ui8kit="theme-toggle|sheet|sheet-trigger|sheet-close|sheet-overlay"`).
- Force a scope with `data-theme="light"` / `data-theme="dark"` (hero stays light; Premium plan, footer newsletter panel and app-download copy stay dark). `dark:` utilities do **not** match `data-theme`.
- Site: ThemeToggle + SheetTrigger in the navbar `actions` group; nav collapses to the sheet below `lg`. Design app: ThemeToggle in the sidebar head and mobile top bar; sidebar becomes a left Sheet below `lg`.
- Rules: `.cursor/rules/dark-mode.mdc`, `.cursor/rules/sheet.mdc`.
