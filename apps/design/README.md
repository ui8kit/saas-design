# apps/design — Vercel deploy shim (not an app)

The Vercel project `saas-design` (https://saas-svelte.vercel.app) was created when the Svelte design app lived in `apps/design`, and its **Root Directory** is still `apps/design`. After the rename to [`apps/design-svelte`](../design-svelte), every push failed on Vercel because that folder no longer existed.

This folder keeps that project deploying without touching the Vercel settings:

- [`vercel.json`](vercel.json) installs the bun workspace with [`../design-svelte/scripts/vercel-install.sh`](../design-svelte/scripts/vercel-install.sh);
- [`build.sh`](build.sh) builds `apps/design-svelte` and copies its `build/` here (the output directory).

To remove the shim: in the Vercel project settings set Root Directory to `apps/design-svelte`, redeploy, then delete this folder.
