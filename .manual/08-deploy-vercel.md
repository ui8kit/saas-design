# 8. Deploy to Vercel (two projects, one repo)

Create two Vercel projects from `github.com/ui8kit/saas-design`. Keep **"Include source files outside of the Root Directory"** enabled (default) — both apps read `packages/` and `fixtures/`.

| Project | Root Directory | Framework preset | Config used |
|---------|----------------|------------------|-------------|
| saas-site | `apps/site` | Other | `apps/site/vercel.json`: install `bash scripts/vercel-install.sh` (bun/npm + pinned Go if missing), build `bash scripts/build.sh`, output `public` |
| saas-design | `apps/design-svelte` | Other | `apps/design-svelte/vercel.json`: install `bash scripts/vercel-install.sh`, build `node ../../tools/copy-media.mjs static && npx vite build`, output `build` |

CLI (once per project, from the repo root):

```bash
npx vercel link --cwd apps/site        # choose/create "saas-site", root directory apps/site
npx vercel --cwd apps/site --prod
npx vercel link --cwd apps/design-svelte      # "saas-design", root directory apps/design-svelte
npx vercel --cwd apps/design-svelte --prod
```

Local dry run of what Vercel executes:

```bash
(cd apps/site && bash scripts/vercel-install.sh && bash scripts/build.sh)
(cd apps/design-svelte && bash scripts/vercel-install.sh && node ../../tools/copy-media.mjs static && npx vite build)
```

Status: both configs build locally; a real Vercel deploy has not been verified yet (see `.project/STATUS.md`).
