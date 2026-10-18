/** Bun preload: compile .svelte files for SSR (same approach as @ui8kit/codegen tests/preload-bun.ts). */
import { readFileSync } from "node:fs";
import { plugin } from "bun";
import { compile } from "svelte/compiler";

await plugin({
  name: "svelte ssr loader",
  setup(builder) {
    builder.onLoad({ filter: /\.svelte(\?[^.]+)?$/ }, ({ path }) => {
      const file = path.includes("?") ? path.slice(0, path.indexOf("?")) : path;
      const out = compile(readFileSync(file, "utf8"), { filename: file, generate: "server", dev: false });
      return { contents: out.js.code, loader: "js" };
    });
  },
});
