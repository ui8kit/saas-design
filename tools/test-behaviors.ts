/**
 * Behavior test (Chrome) for packages/ui/behaviors/ui8kit.js on both built apps at 390px:
 * sheet opens (aria-expanded, focus inside), Tab is trapped, Esc closes + restores focus, overlay click closes,
 * theme toggle flips .dark + aria-pressed and persists across reload.  bun tools/test-behaviors.ts
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };
const serve = (dir: string) => { const s = createServer((req, res) => { let p = join(dir, decodeURIComponent((req.url ?? "/").split("?")[0]!)); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html"); else if (!existsSync(p) && existsSync(p + ".html")) p += ".html"; if (!existsSync(p)) { res.statusCode = 404; return res.end(); } res.setHeader("content-type", types[extname(p)] ?? "application/octet-stream"); res.end(readFileSync(p)); }).listen(0); return { url: `http://localhost:${(s.address() as any).port}`, close: () => s.close() }; };
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome" });
let fail = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? "ok  " : "FAIL"} ${m}`); if (!c) fail++; };
for (const [app, dir] of [["site", "apps/site/public"], ["design", "apps/design/build"]] as const) {
  const s = serve(join(ROOT, dir));
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(s.url + "/", { waitUntil: "networkidle" });
  const trig = page.locator('[data-ui8kit="sheet-trigger"]:visible').first();
  const sheetId = await trig.getAttribute("aria-controls");
  await trig.click();
  ok((await trig.getAttribute("aria-expanded")) === "true", `${app}: trigger aria-expanded=true`);
  ok(await page.evaluate((id) => document.getElementById(id!)!.contains(document.activeElement), sheetId), `${app}: focus moved into sheet`);
  for (let i = 0; i < 40; i++) await page.keyboard.press("Tab");
  ok(await page.evaluate((id) => document.getElementById(id!)!.contains(document.activeElement), sheetId), `${app}: Tab trapped in sheet`);
  await page.keyboard.press("Shift+Tab");
  ok(await page.evaluate((id) => document.getElementById(id!)!.contains(document.activeElement), sheetId), `${app}: Shift+Tab trapped`);
  await page.keyboard.press("Escape");
  ok(await page.evaluate((id) => document.getElementById(id!)!.hidden, sheetId), `${app}: Esc closes`);
  ok(await page.evaluate(() => document.activeElement?.getAttribute("data-ui8kit") === "sheet-trigger"), `${app}: focus restored to trigger`);
  await trig.click();
  await page.mouse.click(380, 400); // overlay area beside a left sheet / ... right sheet panel is on the right; click opposite side
  let closed = await page.evaluate((id) => document.getElementById(id!)!.hidden, sheetId);
  if (!closed) { await page.mouse.click(10, 400); closed = await page.evaluate((id) => document.getElementById(id!)!.hidden, sheetId); }
  ok(closed, `${app}: overlay click closes`);
  const tog = page.locator('[data-ui8kit="theme-toggle"]:visible').first();
  const before = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  await tog.click();
  const after = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  ok(after !== before && (await tog.getAttribute("aria-pressed")) === String(after), `${app}: toggle flips .dark + aria-pressed`);
  await page.reload({ waitUntil: "networkidle" });
  ok((await page.evaluate(() => document.documentElement.classList.contains("dark"))) === after, `${app}: choice persists after reload`);
  await page.close(); s.close();
}
await browser.close();
if (fail) process.exit(1);
