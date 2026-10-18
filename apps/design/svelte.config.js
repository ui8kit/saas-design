import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** Static prerender of every page → build/ (served by Vercel as plain files, see vercel.json). */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: "build", assets: "build", strict: true }),
    prerender: { entries: ["*"], handleHttpError: "fail" },
  },
};
