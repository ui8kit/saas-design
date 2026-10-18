import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// packages/* are consumed from source through aliases, so the app builds without workspace linking.
export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
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
