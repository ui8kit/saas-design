/**
 * Screenshots of the built apps/design-svelte (apps/design-svelte/build) → <config.shots>/design-<page>.png
 *   bun tools/shots-design.ts [out-dir] [paths...]
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { config } from "./config";

const ROOT = resolve(import.meta.dir, "..");
const BUILD = join(ROOT, "apps/design-svelte/build");
const OUT = resolve(process.argv[2] ?? config.shots);
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/foundations/colors", "/primitives", "/components", "/blocks", "/blocks/pricing-two-plans"];
const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };

const server = createServer((req, res) => {
  let p = join(BUILD, decodeURIComponent((req.url ?? "/").split("?")[0]!));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  else if (!existsSync(p) && existsSync(p + ".html")) p += ".html";
  if (!existsSync(p)) { res.statusCode = 404; return res.end("404"); }
  res.setHeader("content-type", types[extname(p)] ?? "application/octet-stream");
  res.end(readFileSync(p));
}).listen(0);
const port = (server.address() as { port: number }).port;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const p of paths) {
  await page.goto(`http://localhost:${port}${p}`, { waitUntil: "networkidle" });
  // lazy images below the fold never load in a full-page screenshot: load them eagerly (bounded wait)
  await page.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 3000)), Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); }); }))]));
  const name = p === "/" ? "overview" : p.slice(1).replaceAll("/", "-");
  await page.screenshot({ path: join(OUT, `design-${name}.png`), fullPage: true });
  console.log(`design-${name}.png`);
}
await browser.close();
server.close();
