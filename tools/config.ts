/**
 * Brand/product config for every script: fixtures/site.config.json + env overrides, paths resolved from the repo root.
 *   import { config } from "./config";            in tools/*.ts
 *   bun tools/config.ts [key]                     prints one value (used by tools/extract.sh) or the whole config
 * Env: FIG (path to the .fig), FIGMA_FRAME (frame id with a dash, e.g. 1-10), SHOTS_DIR (screenshot output), CHROME (browser).
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const raw = JSON.parse(readFileSync(join(ROOT, "fixtures/site.config.json"), "utf8"));
const frame: string = process.env.FIGMA_FRAME ?? raw.figma.frame;

export const config = {
  root: ROOT,
  brand: raw.brand as { name: string; slug: string; description: string },
  site: raw.site as { homeTitle: string },
  design: raw.design as { name: string; title: string },
  /** frame id as used in file names (fixtures/figma/frames/<frame>.json) */
  frame,
  /** the same frame as a Figma node id (1:10) */
  frameNode: frame.replace("-", ":"),
  frameFile: join(ROOT, "fixtures/figma/frames", `${frame}.json`),
  fig: process.env.FIG ? resolve(process.env.FIG) : resolve(ROOT, raw.figma.fig),
  shots: process.env.SHOTS_DIR ? resolve(process.env.SHOTS_DIR) : resolve(ROOT, raw.paths.shots),
  chrome: process.env.CHROME ?? "/usr/bin/google-chrome",
};

if (import.meta.main) {
  const k = process.argv[2] as keyof typeof config | undefined;
  console.log(k ? String(config[k]) : JSON.stringify(config, null, 2));
}
