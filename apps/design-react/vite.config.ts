import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// packages/* and apps/design-shared are consumed from source through aliases (no workspace linking),
// exactly like apps/design-svelte. React is the only runtime dependency of the SSR bundle.
export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: "@saas-design/ui/showcase.json", replacement: r("../../packages/ui/showcase.json") },
      { find: "@saas-design/ui/react", replacement: r("../../packages/ui/react/src/index.ts") },
      { find: "@saas-design/blocks/react", replacement: r("../../packages/blocks/react/index.ts") },
      { find: "@saas-design/icons/react", replacement: r("../../packages/icons/src/react.tsx") },
      { find: "$design", replacement: r("../design-shared/src") },
    ],
    dedupe: ["react", "react-dom"],
  },
  ssr: { noExternal: [/^@saas-design\//] },
});
