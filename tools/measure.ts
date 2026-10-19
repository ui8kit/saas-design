/** Measure elements of the built apps/site: bun tools/measure.ts <css-selector>... → [x, y, w, h, font-size, line-height, padding-top, padding-bottom] */
import { chromium } from "playwright-core";
import { config } from "./config";
const sel = process.argv.slice(2);
const srv = Bun.serve({ port: 0, fetch(req) { let u = new URL(req.url).pathname; if (u.endsWith("/")) u += "index.html"; return new Response(Bun.file(config.root + "/apps/site/public" + u)); } });
const b = await chromium.launch({ executablePath: config.chrome });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`http://localhost:${srv.port}/`); await p.waitForLoadState("networkidle");
await p.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 3000)), Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); }); }))]));
for (const s of sel) console.log(s, JSON.stringify(await p.evaluate((s) => [...document.querySelectorAll(s)].slice(0,4).map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height), cs.fontSize, cs.lineHeight, cs.paddingTop, cs.paddingBottom]; }), s)));
await b.close(); srv.stop();
