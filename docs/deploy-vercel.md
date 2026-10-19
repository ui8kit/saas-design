# Deploy to Vercel

The repo deploys as three Vercel projects, one per app. Each one builds on every push to `main` and reports a GitHub commit status named `Vercel – <project>`. This is the English long-form counterpart of [.manual/08-deploy-vercel.md](../.manual/08-deploy-vercel.md).

## Projects (live, verified 2026-10-19)

| Project | Root Directory | URL | Config |
|---|---|---|---|
| `saas-templ` | `apps/site` | the site (Go templ → static HTML) | [`apps/site/vercel.json`](../apps/site/vercel.json) |
| `saas-design` | `apps/design-svelte` | https://saas-svelte.vercel.app | [`apps/design-svelte/vercel.json`](../apps/design-svelte/vercel.json) |
| `saas-react` | `apps/design-react` | https://saas-react.vercel.app | [`apps/design-react/vercel.json`](../apps/design-react/vercel.json) |

All three use the framework preset **Other**. Keep **"Include source files outside of the Root Directory in the Build Step"** enabled (Vercel's default), because every app reads `packages/`, `fixtures/` and `tools/` from the repo root.

Check a push:

```bash
gh api repos/<owner>/<repo>/commits/<sha>/statuses --jq '.[] | "\(.context) \(.state)"' | sort -u
```

The statuses appear about 20–70 s after the push, first as `pending` and then as `success`.

### apps/site (Go templ → static HTML)

```json
{ "framework": null, "installCommand": "bash scripts/vercel-install.sh", "buildCommand": "bash scripts/build.sh", "outputDirectory": "public", "cleanUrls": true }
```

- `scripts/vercel-install.sh` runs `bun install --frozen-lockfile` from the repo root (falling back to `npm install` without bun). If Go is missing, it downloads Go `${GO_VERSION:-1.26.0}` into `.vercel-go/` (git-ignored).
- `scripts/build.sh` runs these steps:
  1. `go run ./cmd/export` (templ blocks + `fixtures/views/home.json` → `public/index.html`);
  2. copies `ui8kit.js`;
  3. compiles `styles/app.css` with the Tailwind CLI;
  4. copies media.
- The committed `*_templ.go` files are used, so no `templ generate` step is needed at deploy time.

### apps/design-svelte (SvelteKit static)

```json
{ "framework": null, "installCommand": "bash scripts/vercel-install.sh", "buildCommand": "node ../../tools/copy-media.mjs static && npx vite build", "outputDirectory": "build", "cleanUrls": true, "trailingSlash": false }
```

It prerenders all 50 pages with `@sveltejs/adapter-static`.

### apps/design-react (React 19, Vite SSR → static HTML)

```json
{ "framework": null, "installCommand": "bash scripts/vercel-install.sh", "buildCommand": "node ../../tools/copy-media.mjs public && node scripts/build.mjs", "outputDirectory": "build", "cleanUrls": true, "trailingSlash": false }
```

`scripts/build.mjs` runs a Vite client build (CSS + media) and an SSR build of `src/entry-server.tsx`, then writes one `.html` per route (50) with `react-dom/server`. No client React is shipped. Go is not needed.

## Your own copy

Import the GitHub repo three times in the Vercel dashboard, once per row above, and set each Root Directory. With the CLI:

```bash
npx vercel link --cwd apps/site && npx vercel --cwd apps/site --prod
npx vercel link --cwd apps/design-svelte && npx vercel --cwd apps/design-svelte --prod
npx vercel link --cwd apps/design-react && npx vercel --cwd apps/design-react --prod
```

These CLI commands were not run here; the projects above were connected in the dashboard.

## Local dry run

```bash
(cd apps/site && bash scripts/vercel-install.sh && bash scripts/build.sh)                                              # → apps/site/public
(cd apps/design-svelte && bash scripts/vercel-install.sh && node ../../tools/copy-media.mjs static && npx vite build)   # → build/
(cd apps/design-react && bash scripts/vercel-install.sh && node ../../tools/copy-media.mjs public && node scripts/build.mjs)  # → build/
```

## When a deploy fails

| Symptom | Fix |
|---|---|
| A design project fails on every push | Check Root Directory. `apps/design` was renamed to `apps/design-svelte` in `ab8add8`, so a project still pointing at the old path fails. Set it in Project → Settings → Build and Deployment, then redeploy |
| A commit has no `Vercel – …` status at all | It happened once (`88713a3`); the next push built normally. Push the next commit, or redeploy from the dashboard |
| Go download fails in the site build | `vercel-install.sh` fetches Go from go.dev; retry, or set `GO_VERSION` |
| Vercel uses the `npm install` fallback | bun `workspace:*` and the `github:` dependency (`@ui8kit/codegen`) may not resolve the same way under npm. Vercel's image has bun, so this path is untested |
| A broken change went live | Vercel builds whatever is on the branch and does not run `bun run check`. Run it before you push |
