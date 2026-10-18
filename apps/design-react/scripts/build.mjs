#!/usr/bin/env node
/**
 * Static build of apps/design-react → build/ (one .html per route, cleanUrls on Vercel).
 *   1. Vite client build of src/styles/app.css (Tailwind v4, same entry as design-svelte) + public/ (media).
 *   2. Vite SSR build of src/entry-server.tsx → .ssr/entry-server.js (packages bundled from source, react external).
 *   3. Node renders every route with react-dom/server into the document shell below.
 * No client React: the theme toggle and Sheet use packages/ui/behaviors/ui8kit.js, theme-init.js is inlined in <head>.
 *   node scripts/build.mjs
 */
import { build } from "vite";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(APP, "../..");
const OUT = join(APP, "build");
const SSR = join(APP, ".ssr");
const configFile = join(APP, "vite.config.ts");
const quiet = { logLevel: "warn" };

await build({ ...quiet, root: APP, configFile, build: { outDir: OUT, emptyOutDir: true, manifest: true, rollupOptions: { input: join(APP, "src/styles/app.css") } } });
await build({ ...quiet, root: APP, configFile, build: { ssr: join(APP, "src/entry-server.tsx"), outDir: SSR, emptyOutDir: true } });

const manifest = JSON.parse(readFileSync(join(OUT, ".vite/manifest.json"), "utf8"));
const cssEntry = Object.values(manifest).find((e) => e.isEntry && (e.file.endsWith(".css") || e.css));
const css = "/" + (cssEntry.file.endsWith(".css") ? cssEntry.file : cssEntry.css[0]);
rmSync(join(OUT, ".vite"), { recursive: true, force: true });
mkdirSync(join(OUT, "assets"), { recursive: true });
copyFileSync(join(ROOT, "packages/ui/behaviors/ui8kit.js"), join(OUT, "assets/ui8kit.js"));
const themeInit = readFileSync(join(ROOT, "packages/ui/behaviors/theme-init.js"), "utf8").trim();

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Document shell (the React counterpart of design-svelte's src/app.html): the only hand-written raw tags.
const page = ({ title, body }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/media/brand-mark.svg" />
    <script>${themeInit}</script>
    <title>${esc(title)}</title>
    <link rel="stylesheet" href="${css}" />
    <script src="/assets/ui8kit.js" defer></script>
  </head>
  <body>
    <div class="ui-page">${body}</div>
  </body>
</html>
`;

const { routes, render } = await import(pathToFileURL(join(SSR, "entry-server.js")).href);
for (const r of routes) {
  const file = r.path === "/" ? "index.html" : `${r.path.slice(1)}.html`;
  mkdirSync(dirname(join(OUT, file)), { recursive: true });
  writeFileSync(join(OUT, file), page(render(r.path)));
}
rmSync(SSR, { recursive: true, force: true });
console.log(`design-react: built ${routes.length} pages → build/`);
