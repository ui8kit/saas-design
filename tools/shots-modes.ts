/**
 * Light / dark / mobile screenshots of the built apps → /workspace/shots-saas
 *   site:   site-light.png site-dark.png site-mobile.png site-mobile-menu.png site-mobile-dark-menu.png
 *   design: design-light.png design-dark.png design-mobile.png design-mobile-menu.png design-dark-<page>.png
 *   bun tools/shots-modes.ts [site|design|all]
 * Dark mode is set the way a visitor does it: localStorage.theme before load (theme-init.js applies it, no flash).
 */
import { chromium, type Page } from "playwright-core";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, mkdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const OUT = process.env.SHOTS_DIR ?? "/workspace/shots-saas";
const which = process.argv[2] ?? "all";
const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };
function serve(dir: string) {
  const s = createServer((req, res) => {
    let p = join(dir, decodeURIComponent((req.url ?? "/").split("?")[0]!));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
    else if (!existsSync(p) && existsSync(p + ".html")) p += ".html";
    if (!existsSync(p)) { res.statusCode = 404; return res.end("404"); }
    res.setHeader("content-type", types[extname(p)] ?? "application/octet-stream");
    res.end(readFileSync(p));
  }).listen(0);
  return { url: `http://localhost:${(s.address() as { port: number }).port}`, close: () => s.close() };
}
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--font-render-hinting=none"] });

async function shot(base: string, path: string, name: string, o: { width: number; dark?: boolean; menu?: boolean; full?: boolean }) {
  const ctx = await browser.newContext({ viewport: { width: o.width, height: o.width < 600 ? 844 : 900 }, colorScheme: "light" });
  await ctx.addInitScript((dark) => { try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {} }, !!o.dark);
  const page: Page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (o.menu) {
    const t = page.locator('[data-ui8kit="sheet-trigger"]:visible').first();
    await t.click();
    await page.waitForSelector('[data-ui8kit="sheet"]:not([hidden])');
    const focusInside = await page.evaluate(() => !!document.activeElement?.closest('[data-ui8kit="sheet"]'));
    const expanded = await t.getAttribute("aria-expanded");
    console.log(`  ${name}: aria-expanded=${expanded}, focus in sheet=${focusInside}`);
  }
  await page.screenshot({ path: join(OUT, name), fullPage: o.full ?? !o.menu });
  await ctx.close();
  console.log(name);
}

if (which === "site" || which === "all") {
  const s = serve(join(ROOT, "apps/site/public"));
  await shot(s.url, "/", "site-light.png", { width: 1440 });
  await shot(s.url, "/", "site-dark.png", { width: 1440, dark: true });
  await shot(s.url, "/", "site-mobile.png", { width: 390 });
  await shot(s.url, "/", "site-mobile-menu.png", { width: 390, menu: true });
  await shot(s.url, "/", "site-mobile-dark-menu.png", { width: 390, dark: true, menu: true });
  s.close();
}
if (which === "design" || which === "all") {
  const s = serve(join(ROOT, "apps/design/build"));
  await shot(s.url, "/", "design-light.png", { width: 1440 });
  await shot(s.url, "/", "design-dark.png", { width: 1440, dark: true });
  await shot(s.url, "/foundations/colors", "design-dark-colors.png", { width: 1440, dark: true });
  await shot(s.url, "/components", "design-dark-components.png", { width: 1440, dark: true, full: false });
  await shot(s.url, "/widgets", "design-dark-widgets.png", { width: 1440, dark: true });
  await shot(s.url, "/blocks/pricing-two-plans", "design-dark-pricing.png", { width: 1440, dark: true });
  await shot(s.url, "/", "design-mobile.png", { width: 390 });
  await shot(s.url, "/", "design-mobile-menu.png", { width: 390, menu: true });
  s.close();
}
await browser.close();
