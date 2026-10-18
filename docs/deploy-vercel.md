# Deploy to Vercel

Deploy as three Vercel projects from one repository, one per app. This is the English long-form counterpart of [.manual/08-deploy-vercel.md](../.manual/08-deploy-vercel.md).

> **Status: not verified on Vercel.** Both configs have been dry-run locally with the exact install and build commands Vercel would execute, and both succeed (2026-10-18). A real Vercel deploy, including Go being available in the build image and the `npm` fallback path, has **not** been tested.

## Projects

| Project | Root Directory | Framework preset | Config |
|---|---|---|---|
| site (e.g. `saas-site`) | `apps/site` | Other | [`apps/site/vercel.json`](../apps/site/vercel.json) |
| design (e.g. `saas-design`) | `apps/design-svelte` | Other | [`apps/design-svelte/vercel.json`](../apps/design-svelte/vercel.json) |
| existing `saas-design` project (https://saas-svelte.vercel.app), Root Directory still `apps/design` | `apps/design` (shim) | Other | [`apps/design/vercel.json`](../apps/design/vercel.json): builds design-svelte and copies `build/` ([why](../apps/design/README.md)) |
| design-react (e.g. `saas-design-react`) | `apps/design-react` | Other | [`apps/design-react/vercel.json`](../apps/design-react/vercel.json) |

Keep **"Include source files outside of the Root Directory in the Build Step"** enabled; it is Vercel's default. All apps read `packages/`, `fixtures/` and `tools/` from the repo root.

### apps/site (Go templ → static HTML)

```json
{
  "framework": null,
  "installCommand": "bash scripts/vercel-install.sh",
  "buildCommand": "bash scripts/build.sh",
  "outputDirectory": "public",
  "cleanUrls": true
}
```

- `scripts/vercel-install.sh` runs from the repo root:
  - `bun install --frozen-lockfile` if bun exists, otherwise `npm install --no-audit --no-fund`;
  - if `go` is missing, it downloads Go `${GO_VERSION:-1.26.0}` into `.vercel-go/` (git-ignored).
- `scripts/build.sh` puts `.vercel-go/go/bin` on `PATH`, then:
  1. runs `go run ./cmd/export` (templ blocks + `fixtures/views/home.json` → `public/index.html`);
  2. copies `packages/ui/behaviors/ui8kit.js` → `public/assets/`;
  3. compiles `styles/app.css` with the Tailwind CLI → `public/assets/app.css`;
  4. copies media with `node tools/copy-media.mjs public`.
- The committed `*_templ.go` files are used, so `templ generate` is **not** needed at deploy time.

### apps/design-react (React 19, Vite SSR → static HTML)

```json
{
  "framework": null,
  "installCommand": "bash scripts/vercel-install.sh",
  "buildCommand": "node ../../tools/copy-media.mjs public && node scripts/build.mjs",
  "outputDirectory": "build",
  "cleanUrls": true,
  "trailingSlash": false
}
```

- The install is the same bun workspace install as design-svelte. Go is not needed.
- `scripts/build.mjs` runs a Vite client build (CSS + `public/` media), then a Vite SSR build of `src/entry-server.tsx`, then writes one `.html` per route (49) with `react-dom/server`. No client React is shipped. See [apps/design-react/README.md](../apps/design-react/README.md).

### apps/design-svelte (SvelteKit static)

```json
{
  "framework": null,
  "installCommand": "bash scripts/vercel-install.sh",
  "buildCommand": "node ../../tools/copy-media.mjs static && npx vite build",
  "outputDirectory": "build",
  "cleanUrls": true,
  "trailingSlash": false
}
```

- `scripts/vercel-install.sh` installs the bun workspace at the repo root (with an `npm install` fallback).
- The build copies media into `static/` (git-ignored) and prerenders all pages with `@sveltejs/adapter-static` into `build/`. 49 pages were built locally.

## CLI

Run once per project, from the repo root. These are Vercel CLI commands; they were not run here.

```bash
npx vercel link --cwd apps/site        # create/choose the site project, Root Directory apps/site
npx vercel --cwd apps/site --prod
npx vercel link --cwd apps/design-svelte      # create/choose the design project, Root Directory apps/design-svelte
npx vercel --cwd apps/design-svelte --prod
```

Alternatively, import the GitHub repo twice in the Vercel dashboard and set the Root Directory for each project.

## Local dry run (verified)

```bash
(cd apps/site && bash scripts/vercel-install.sh && bash scripts/build.sh)                              # → apps/site/public
(cd apps/design-svelte && bash scripts/vercel-install.sh && node ../../tools/copy-media.mjs static && npx vite build)   # → apps/design-svelte/build
```

## Known risks

| Risk | Why it matters | Status |
|---|---|---|
| Go is not guaranteed in Vercel's build image | `vercel-install.sh` downloads it from go.dev on demand | not verified on Vercel |
| `npm install` fallback | the workspace uses bun `workspace:*` protocol deps and a `github:` dependency (`@ui8kit/codegen`), and npm may not resolve them identically | not verified. Prefer an image with bun |
| No `bun run check` in the deploy | Vercel builds whatever is on the branch | run `bun run check` in CI or locally before pushing |
