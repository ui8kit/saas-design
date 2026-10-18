/**
 * Layout audit of the built apps in headless Chrome (playwright-core).
 *   bun tools/audit-layout.ts [--shots <dir>] [--dark] [--app design-svelte|design-react|site|all] [--report]
 *
 * Pages: apps/site "/", and every design page (overview, foundations, primitives, components, widgets, blocks,
 * 39 block pages). Widths: 390, 768, 1024, 1440.
 * Blocking problems (exit 1 unless --report):
 *   overflow  the document scrolls horizontally (scrollWidth > viewport).
 *   edge      text, an image or a nested surface sits < 8px from the inner border edge of the nearest
 *             surface around it. A surface is an element ≥ 160×80 with a border on all four sides or a
 *             background of its own. Controls (button, input, select, textarea, badges) are not surfaces.
 *             Filled (borderless) surfaces only check text, so media can bleed to a card edge; a nested
 *             surface that spans the full width of a bordered one (a block filling its preview frame) is fine.
 *   Elements inside [data-bleed] (an intentional bleed, e.g. the Figma app-gallery row) are not checked.
 *   media     an image covers < 25% of a media box (a parent with its own background) that is ≥ 160px tall.
 * --shots <dir> also writes one element screenshot of each block preview frame per width (and per theme
 *   with --dark) as <dir>/<block>-<width>-<theme>.png.
 */
import { chromium, type Page } from "playwright-core";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const args = process.argv.slice(2);
const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const shotsDir = opt("--shots");
const app = opt("--app") ?? "all";
const reportOnly = args.includes("--report");
const themes = args.includes("--dark") ? ["light", "dark"] : ["light"];
const WIDTHS = [390, 768, 1024, 1440];
const MIN_GAP = 8;

const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".woff2": "font/woff2" };
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

type Problem = { kind: "overflow" | "edge" | "media"; detail: string };

/** Runs in the page. Returns problems for the current viewport. */
function audit([minGap, DEBUG]: [number, boolean]): Problem[] {
  const out: Problem[] = [];
  const doc = document.documentElement;
  if (doc.scrollWidth > window.innerWidth + 1) {
    const wide = [...document.querySelectorAll<HTMLElement>("body *")].filter((e) => {
      const r = e.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(e).position !== "fixed";
    }).filter((e, _, all) => !all.some((o) => o !== e && o.contains(e))).slice(0, 3);
    out.push({ kind: "overflow", detail: `scrollWidth ${doc.scrollWidth} > ${window.innerWidth}: ${wide.map(name).join(", ")}` });
  }
  function name(e: Element) { const c = [...e.classList].find((k) => /^(ui|ds)-/.test(k) && !/-(size|variant|align|justify|aspect|fit|position)-/.test(k)) ?? ""; return `${e.tagName.toLowerCase()}${c ? "." + c : ""}`; }
  const alpha = (c: string) => { if (!c || c === "transparent") return 0; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1]!.split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]!) : 1; };
  const visible = (e: Element) => { const r = e.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) return false; const s = getComputedStyle(e); return s.visibility !== "hidden" && s.display !== "none" && !e.closest("[hidden],[aria-hidden=true],dialog:not([open])"); };
  const isControl = (e: Element) => e.matches("button,input,select,textarea,summary,[role=button],.ui-badge,[data-slot=badge],.ui-button,[class*=ui-button-],.ds-chip,.ds-toc-link,.ui-skip") || !!e.closest("button,.ui-button,.ui-badge,[data-slot=badge]");
  const bordered = (s: CSSStyleDeclaration) => ["Top", "Right", "Bottom", "Left"].every((k) => parseFloat((s as any)[`border${k}Width`]) > 0 && alpha((s as any)[`border${k}Color`]) > 0)
    || /inset/.test(s.boxShadow) && alpha(s.boxShadow) > 0;
  const surfaces = new Map<Element, { bordered: boolean }>();
  for (const e of document.querySelectorAll("body *")) {
    if (isControl(e) || !visible(e)) continue;
    const r = e.getBoundingClientRect(); if (r.width < 160 || r.height < 80) continue;
    const s = getComputedStyle(e);
    if (e.matches("table,thead,tbody,tr,td,th,img,svg,picture,video,canvas,iframe,hr,ul.ds-nav-list,.ds-sidebar,.ds-topbar,.ds-main,.ui-page")) continue;
    const b = bordered(s); const filled = alpha(s.backgroundColor) > 0 && !e.matches("main,body > div");
    if (b || filled) surfaces.set(e, { bordered: b });
  }
  const surfaceOf = (e: Element) => { for (let p = e.parentElement; p; p = p.parentElement) if (surfaces.has(p)) return p; return null; };
  const inner = (sf: Element) => { const r = sf.getBoundingClientRect(), s = getComputedStyle(sf); return { l: r.left + parseFloat(s.borderLeftWidth), t: r.top + parseFloat(s.borderTopWidth), r: r.right - parseFloat(s.borderRightWidth), b: r.bottom - parseFloat(s.borderBottomWidth) }; };
  const seen = new Set<string>();
  function check(sf: Element, box: DOMRect, what: string, fullBleedOk: boolean) {
    const i = inner(sf);
    if (box.right <= i.l || box.left >= i.r || box.bottom <= i.t || box.top >= i.b) return; // clipped / scrolled out
    if (fullBleedOk && box.left - i.l < 1 && i.r - box.right < 1) return;
    const d = { left: box.left - i.l, right: i.r - box.right, top: box.top - i.t, bottom: i.b - box.bottom };
    const bad = Object.entries(d).filter(([, v]) => v < minGap - 0.5).map(([k, v]) => `${k} ${Math.round(v)}px`);
    if (!bad.length) return;
    const key = `${name(sf)}|${what}|${bad.map((x) => x.split(" ")[0]).join("+")}`;
    if (seen.has(key)) return; seen.add(key);
    const sr = sf.getBoundingClientRect();
    out.push({ kind: "edge", detail: `${what} in ${name(sf)}: ${bad.join(", ")}`, ...(DEBUG ? { box: [box.left, box.top, box.right, box.bottom].map(Math.round), surface: [sr.left, sr.top, sr.right, sr.bottom].map(Math.round) } : {}) } as Problem);
  }
  // text runs
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    const el = n.parentElement!; if (!visible(el) || el.closest("script,style,.ds-sidebar,.ds-topbar,.ui-skip,.sr-only,[data-bleed]")) continue;
    const det = el.closest("details"); if (det && !det.open && !el.closest("summary")) continue; // closed disclosure body
    if (getComputedStyle(el).position === "absolute" && getComputedStyle(el).clip !== "auto") continue;
    const sf = surfaceOf(el); if (!sf) continue;
    if (isControl(el) && !surfaces.has(el)) { /* text inside a control is measured against the control's own padding, not here */
      const ctl = el.closest("button,.ui-button,.ui-badge,[data-slot=badge],input,select,textarea,summary,[role=button]"); if (ctl && sf.contains(ctl)) { check(sf, ctl.getBoundingClientRect(), `control ${name(ctl)}`, false); continue; }
    }
    const rg = document.createRange(); rg.selectNodeContents(n); const box = rg.getBoundingClientRect();
    if (box.width < 1) continue;
    check(sf, box, `text "${n.textContent.trim().slice(0, 24)}"`, false);
  }
  // images and nested surfaces against bordered surfaces
  for (const [sf, info] of surfaces) {
    if (!info.bordered) continue;
    for (const e of sf.querySelectorAll("img,svg,video")) {
      if (!visible(e) || surfaceOf(e) !== sf || e.closest("button,.ui-button,.ui-badge,[data-bleed]")) continue;
      const r = e.getBoundingClientRect(); if (r.width < 24) continue;
      check(sf, r, `media ${name(e)}`, true);
    }
    for (const [inn] of surfaces) if (inn !== sf && surfaceOf(inn) === sf && !inn.closest("[data-bleed]")) check(sf, inn.getBoundingClientRect(), `surface ${name(inn)}`, true);
  }
  // tiny image in a big media box
  for (const img of document.querySelectorAll("img")) {
    const box = img.parentElement; if (!box || !visible(img) || box.children.length !== 1) continue; // a media box holds just the image
    const bs = getComputedStyle(box); if (alpha(bs.backgroundColor) === 0) continue;
    const br = box.getBoundingClientRect(), ir = img.getBoundingClientRect();
    if (br.height < 160) continue;
    const vis = Math.max(0, Math.min(ir.right, br.right) - Math.max(ir.left, br.left)) * Math.max(0, Math.min(ir.bottom, br.bottom) - Math.max(ir.top, br.top));
    const ratio = vis / (br.width * br.height);
    if (ratio < 0.25) out.push({ kind: "media", detail: `${name(img)} covers ${Math.round(ratio * 100)}% of ${name(box)} (${Math.round(br.width)}×${Math.round(br.height)})` });
  }
  return out;
}

const pagesOf = (dir: string) => {
  const list: string[] = [];
  const walk = (d: string, base: string) => { for (const f of require("node:fs").readdirSync(d, { withFileTypes: true })) {
    if (f.isDirectory()) { if (!["_app", "assets", "media", "fonts"].includes(f.name)) walk(join(d, f.name), `${base}/${f.name}`); }
    else if (f.name.endsWith(".html")) list.push(f.name === "index.html" ? base || "/" : `${base}/${f.name.slice(0, -5)}`);
  } };
  walk(dir, ""); return list.sort();
};

const targets: { app: string; dir: string; pages: string[] }[] = [];
if (app === "all" || app === "site") targets.push({ app: "site", dir: join(ROOT, "apps/site/public"), pages: ["/"] });
for (const a of ["design-svelte", "design-react"]) if (app === a || (app === "all" && a === "design-svelte")) { const dir = join(ROOT, `apps/${a}/build`); targets.push({ app: a, dir, pages: pagesOf(dir) }); }

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--font-render-hinting=none"] });
const report: Record<string, Problem[]> = {};
let total = 0, mediaWarn = 0, pagesChecked = 0;
for (const t of targets) {
  if (!existsSync(t.dir)) { console.error(`audit-layout: ${t.dir} missing (build ${t.app} first)`); process.exit(1); }
  const s = serve(t.dir);
  for (const theme of themes) for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, colorScheme: "light" });
    await ctx.addInitScript((d) => { try { localStorage.setItem("theme", d ? "dark" : "light"); } catch {} }, theme === "dark");
    const page: Page = await ctx.newPage();
    for (const p of t.pages) {
      await page.goto(s.url + p, { waitUntil: "load" });
      // lazy images below the fold never load on their own: make them eager, then wait (bounded)
      await page.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 3000)), Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); }); }))]));
      if (theme === "light") {
        const probs = await page.evaluate(audit, [MIN_GAP, !!process.env.AUDIT_DEBUG] as [number, boolean]);
        pagesChecked++;
        if (probs.length) {
          report[`${t.app} ${p} @${w}`] = probs;
          for (const q of probs) { if (q.kind === "media") mediaWarn++; else total++; }
        }
      }
      if (shotsDir && t.app !== "site" && p.startsWith("/blocks/")) {
        mkdirSync(shotsDir, { recursive: true });
        // the sticky top bar (below xl) would cover the top of the element screenshot: take it out of the flow for the shot
        await page.addStyleTag({ content: ".ds-topbar{position:static!important}" });
        const frame = page.locator(".ds-frame").first();
        if (await frame.count()) await frame.screenshot({ path: join(shotsDir, `${t.app === "design-react" ? "react-" : ""}${p.slice(8)}-${w}-${theme}.png`) });
      }
    }
    await ctx.close();
    console.error(`  ${t.app} ${theme} @${w}: ${t.pages.length} pages`);
  }
  s.close();
}
await browser.close();
mkdirSync(join(ROOT, ".ui8px/reports"), { recursive: true });
writeFileSync(join(ROOT, ".ui8px/reports/layout.json"), JSON.stringify(report, null, 2) + "\n");
for (const [k, v] of Object.entries(report)) for (const q of v) console.log(`${q.kind === "media" ? "warn " : "FAIL "} ${k}  ${q.kind}: ${q.detail}`);
console.log(`audit-layout: ${pagesChecked} page×width checks (${WIDTHS.join("/")}), ${total} blocking (overflow + edge), ${mediaWarn} media warnings; report .ui8px/reports/layout.json`);
if (total && !reportOnly) process.exit(1);
