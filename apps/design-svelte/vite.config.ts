import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// packages/* are consumed from source through aliases, so the app builds without workspace linking.
// packages/ui/behaviors/ui8kit.js → build/assets/ui8kit.js (client build only; app.html loads it, same path as design-react).
const behaviors = {
  name: "ui8kit-behaviors",
  apply: "build" as const,
  generateBundle(this: any, opts: { dir?: string }) {
    const server = this.environment ? this.environment.config.consumer === "server" : String(opts.dir).includes("server");
    if (server) return;
    this.emitFile({ type: "asset", fileName: "assets/ui8kit.js", source: readFileSync(r("../../packages/ui/behaviors/ui8kit.js"), "utf8") });
  },
};

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), behaviors],
  resolve: {
    alias: {
      "@saas-design/ui": r("../../packages/ui/svelte/src/index.ts"),
      "@saas-design/blocks": r("../../packages/blocks/svelte/index.ts"),
      "@saas-design/icons/svelte": r("../../packages/icons/src/Icon.svelte"),
      "@saas-design/icons": r("../../packages/icons/src/index.ts"),
      "$design": r("../../packages/design-docs/src"),
      "$fixtures": r("../../fixtures"),
      "$packages": r("../../packages"),
    },
  },
  server: { fs: { allow: [r("../..")] } },
});
