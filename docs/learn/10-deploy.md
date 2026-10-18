# 10. Deploy

There are three Vercel projects, all from one repo. Each project's Root Directory is the app folder, and "Include source files outside of the Root Directory" stays on, because each app reads `packages/` and `fixtures/`.

| Project | Config |
|---|---|
| site | [`apps/site/vercel.json`](../../apps/site/vercel.json). It installs bun and pinned Go if missing ([`scripts/vercel-install.sh`](../../apps/site/scripts/vercel-install.sh)), then runs [`scripts/build.sh`](../../apps/site/scripts/build.sh). |
| design-svelte | [`apps/design-svelte/vercel.json`](../../apps/design-svelte/vercel.json) |
| design-react | [`apps/design-react/vercel.json`](../../apps/design-react/vercel.json). It runs the Vite client + SSR build and prerenders the pages; no client React is shipped. |

Before you deploy, `bun run check` must pass. Every output is static HTML + CSS + `ui8kit.js`.

The full steps and a local dry run are in [deploy to Vercel](../deploy-vercel.md). A real Vercel deploy has not been verified yet; see [`.project/STATUS.md`](../../.project/STATUS.md).

Back to [the index](README.md).
