/**
 * Screenshots: Figma reference render vs apps/site at the same width (1440), full page + per section,
 * plus side-by-side composites. Output: /workspace/shots-saas (outside the repo).
 *   bun tools/render:figma first (writes /workspace/shots-saas/figma/1-10.html), build apps/site, then:
 *   bun tools/shots.ts
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const OUT = process.env.SHOTS_DIR ?? "/workspace/shots-saas";
const PUBLIC = join(ROOT, "apps/site/public");
const WIDTH = 1440;
const SECTIONS: [string, string, string][] = [
  ["hero", "Hero", "hero-phones"], ["why", "Why", "feature-cards"], ["social-proof", "Social Proof", "social-proof-split"],
  ["inside", "Inside", "app-gallery"], ["testimonials", "Testimonials", "testimonial-cards"], ["cta", "CTA", "cta-split"],
  ["pricing", "Pricing", "pricing-two-plans"], ["faq", "FAQ", "faq-tiles"], ["footer", "Footer", "footer-newsletter"],
];
mkdirSync(join(OUT, "sections"), { recursive: true });
mkdirSync(join(OUT, "compare"), { recursive: true });

const types: Record<string, string> = { ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };
const server = Bun.serve({ port: 0, fetch(req) {
  let p = decodeURIComponent(new URL(req.url).pathname); if (p.endsWith("/")) p += "index.html";
  const f = join(PUBLIC, p); if (!existsSync(f)) return new Response("not found", { status: 404 });
  return new Response(Bun.file(f), { headers: { "content-type": types[extname(f)] ?? "application/octet-stream" } });
} });

const frame = JSON.parse(readFileSync(join(ROOT, "fixtures/figma/frames/1-10.json"), "utf8"));
const root = frame.root ?? frame;
const figmaRect = (name: string) => { const n = root.children.find((c: any) => c.name === name); return { x: n.abs?.[0] ?? n.x, y: n.abs?.[1] ?? n.y, width: n.w, height: n.h }; };

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 1 });
const report: any[] = [];

const figmaHtml = join(OUT, "figma/1-10.html");
if (!existsSync(figmaHtml)) throw new Error(`missing ${figmaHtml}: run bun run render:figma`);
await page.goto("file://" + figmaHtml); await page.waitForLoadState("networkidle");
for (const [slug, name] of SECTIONS) {
  const r = figmaRect(name);
  // sections that bleed past the frame are clipped to the frame width
  const clip = { x: 0, y: r.y, width: WIDTH, height: r.height + (slug === "hero" ? 30 : 0) };
  if (slug === "hero") clip.y = 0;
  await page.screenshot({ path: join(OUT, "sections", `figma-${slug}.png`), clip, fullPage: true });
  report.push({ section: slug, figma: { y: r.y, height: r.height } });
}

await page.goto(`http://localhost:${server.port}/`); await page.waitForLoadState("networkidle");
// lazy images below the fold never load in a full-page screenshot: load them eagerly (bounded wait)
await page.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 3000)), Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); }); }))]));
await page.screenshot({ path: join(OUT, "site-home.png"), fullPage: true });
const fullH = await page.evaluate(() => document.documentElement.scrollHeight);
for (const [slug, , block] of SECTIONS) {
  const box = await page.evaluate((b) => {
    const el = document.querySelector(`[data-class="ui-${b}"]`) as HTMLElement | null; if (!el) return null;
    const target = b === "hero-phones" ? el : ((el.firstElementChild as HTMLElement) ?? el);
    const r = target.getBoundingClientRect(); return { y: r.top + scrollY, height: r.height };
  }, block);
  if (!box) throw new Error(`block ${block} not found`);
  const clip = { x: 0, y: slug === "hero" ? 0 : box.y, width: WIDTH, height: box.height + (slug === "hero" ? box.y : 0) };
  await page.screenshot({ path: join(OUT, "sections", `site-${slug}.png`), clip, fullPage: true });
  const row = report.find((r) => r.section === slug); row.site = { y: Math.round(box.y), height: Math.round(box.height) };
  row.delta = { y: row.site.y - row.figma.y, height: row.site.height - row.figma.height };
}

// side-by-side composites
const cmp = await browser.newPage({ viewport: { width: WIDTH * 2 + 40, height: 900 } });
const pair = async (a: string, b: string, out: string, label: string) => {
  writeFileSync(join(OUT, "compare/_pair.html"), `<!doctype html><body style="margin:0;background:#888;font:14px sans-serif"><div style="display:flex;gap:40px;align-items:flex-start"><figure style="margin:0"><figcaption style="color:#fff;padding:4px">Figma · ${label}</figcaption><img src="${a}"></figure><figure style="margin:0"><figcaption style="color:#fff;padding:4px">apps/site · ${label}</figcaption><img src="${b}"></figure></div></body>`);
  await cmp.goto("file://" + join(OUT, "compare/_pair.html")); await cmp.waitForLoadState("networkidle");
  await cmp.screenshot({ path: join(OUT, "compare", out), fullPage: true });
};
await pair("../figma-1-10-home.png", "../site-home.png", "home.png", "Home 1440");
for (const [slug] of SECTIONS) await pair(`../sections/figma-${slug}.png`, `../sections/site-${slug}.png`, `${slug}.png`, slug);

writeFileSync(join(OUT, "report.json"), JSON.stringify({ width: WIDTH, figmaHeight: root.h, siteHeight: fullH, sections: report }, null, 2));
console.log(`shots: figma ${root.h}px vs site ${fullH}px at ${WIDTH}px`);
for (const r of report) console.log(`  ${r.section.padEnd(13)} figma y=${r.figma.y} h=${r.figma.height}  site y=${r.site.y} h=${r.site.height}  Δy=${r.delta.y} Δh=${r.delta.height}`);
await browser.close(); server.stop();
