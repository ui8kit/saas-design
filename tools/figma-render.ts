/**
 * Reference rasterizer for a fig2design frame dump.
 *
 * fig2design 0.1.0 does not render frames (see .project/backlog/fig2design-no-frame-render.md),
 * so this script turns fixtures/figma/frames/<id>.json into a throw-away absolutely positioned
 * HTML file and screenshots it with Chrome. The HTML is written OUTSIDE the repo (default
 * <config.shots>/figma) because it uses inline styles; it is a measuring tool, never app code.
 *
 *   bun tools/figma-render.ts [--frame <config.frame>] [--out <config.shots>] [--chrome <config.chrome>]
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { config } from "./config";

const args = process.argv.slice(2);
const flag = (n: string, d: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1]! : d;
};
const ROOT = resolve(import.meta.dir, "..");
const frameId = flag("frame", config.frame);
const outDir = resolve(flag("out", config.shots));
const chrome = flag("chrome", process.env.CHROME_PATH ?? config.chrome);
const dump = join(ROOT, "fixtures/figma");

type Paint = { type: string; color?: string; a?: number; opacity?: number; image?: string; mode?: string };
type Node = {
  k: string; name: string; type: string; x: number; y: number; w: number; h: number;
  fills?: Paint[]; strokes?: Paint[]; stroke?: { w: number; align: string; sides?: Record<string, number> };
  radius?: number; clip?: boolean; t?: number[]; asset?: string; visible?: boolean; opacity?: number;
  text?: { chars: string; size: number; align: string; lh?: { value: number; units: string }; resolved: { size: number; weight: number; family: string; lh?: { value: number; units: string } } };
  children?: Node[];
};

const frame = JSON.parse(readFileSync(join(dump, `frames/${frameId}.json`), "utf8"));
const images = JSON.parse(readFileSync(join(dump, "images/index.json"), "utf8")).images as Array<{ hash: string; file: string }>;
const imgFile = new Map(images.map((i) => [i.hash, i.file]));
const assets: Record<string, string> = frame.vectorAssets ?? {};

function rgba(p: Paint): string {
  const hex = p.color ?? "#000000";
  const a = (p.a ?? 1) * (p.opacity ?? 1);
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function render(n: Node): string {
  if (n.visible === false) return "";
  const s: string[] = [`position:absolute`, `left:${n.x}px`, `top:${n.y}px`, `width:${n.w}px`, `height:${n.h}px`];
  if (n.t) s.push(`transform-origin:0 0`, `transform:matrix(${n.t[0]},${n.t[2]},${n.t[1]},${n.t[3]},0,0)`);
  if (n.opacity !== undefined && n.opacity !== 1) s.push(`opacity:${n.opacity}`);
  if (n.radius) s.push(`border-radius:${n.radius}px`);
  if (n.type === "ELLIPSE") s.push(`border-radius:50%`);
  if (n.clip) s.push(`overflow:hidden`);
  let inner = "";
  if (n.asset && assets[n.asset]) {
    inner = assets[n.asset]!.replace("<svg ", `<svg style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible" `);
  } else if (n.type !== "TEXT") {
    for (const p of n.fills ?? []) {
      if (p.type === "solid") s.push(`background-color:${rgba(p)}`);
      if (p.type === "image" && p.image && imgFile.get(p.image)) {
        s.push(`background-image:url('${imgFile.get(p.image)}')`, `background-size:${p.mode === "fit" ? "contain" : "cover"}`, `background-position:center`);
      }
    }
  }
  const st = n.strokes?.[0];
  if (st && n.stroke && n.stroke.w > 0 && !n.asset) {
    const c = rgba(st);
    if (n.stroke.sides) {
      for (const [side, w] of Object.entries(n.stroke.sides)) {
        const prop = { t: "top", r: "right", b: "bottom", l: "left" }[side];
        if (prop) s.push(`border-${prop}:${w}px solid ${c}`);
      }
      s.push("box-sizing:border-box");
    } else if (n.stroke.align === "outside") s.push(`box-shadow:0 0 0 ${n.stroke.w}px ${c}`);
    else if (n.stroke.align === "center") s.push(`box-shadow:0 0 0 ${n.stroke.w / 2}px ${c}, inset 0 0 0 ${n.stroke.w / 2}px ${c}`);
    else s.push(`box-shadow:inset 0 0 0 ${n.stroke.w}px ${c}`);
  }
  if (n.type === "TEXT" && n.text) {
    const t = n.text, r = t.resolved;
    const lh = r.lh ?? t.lh;
    const lineHeight = !lh ? "normal" : lh.units === "PIXELS" ? `${lh.value}px` : lh.units === "PERCENT" ? `${lh.value / 100}` : "normal";
    const fill = (n.fills ?? []).find((p) => p.type === "solid");
    s.push(`font-family:'${r.family}'`, `font-size:${r.size}px`, `font-weight:${r.weight}`, `line-height:${lineHeight}`,
      `text-align:${t.align}`, `color:${fill ? rgba(fill) : "#000"}`);
    // single-line boxes: Figma measures with its own font metrics, so do not let Chrome wrap them
    const lhPx = !lh ? r.size * 1.21 : lh.units === "PIXELS" ? lh.value : (lh.value / 100) * r.size;
    s.push(n.h < lhPx * 1.6 ? "white-space:pre" : "white-space:pre-wrap");
    inner = t.chars.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }
  const kids = (n.children ?? []).map(render).join(""); // fig2design children are in paint order (back to front)
  return `<div data-k="${n.k}" data-name="${n.name.replace(/"/g, "")}" style="${s.join(";")}">${inner}${kids}</div>`;
}

const root: Node = frame.root;
root.x = 0; root.y = 0;
const html = `<!doctype html><html><head><meta charset="utf-8"><title>figma ${frame.name}</title>
<style>html,body{margin:0;padding:0}body{width:${root.w}px}</style></head><body>${render(root)}</body></html>`;

const figDir = join(outDir, "figma");
mkdirSync(join(figDir, "images"), { recursive: true });
for (const i of images) {
  const src = join(dump, i.file);
  if (existsSync(src)) copyFileSync(src, join(figDir, i.file));
}
const htmlPath = join(figDir, `${frameId}.html`);
writeFileSync(htmlPath, html);

const browser = await chromium.launch({ executablePath: chrome });
const page = await browser.newPage({ viewport: { width: root.w, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`file://${htmlPath}`);
await page.waitForTimeout(300);
const png = join(outDir, `figma-${frameId}-${frame.name.toLowerCase()}.png`);
await page.screenshot({ path: png, fullPage: true });
// per-section crops for side-by-side comparison
for (const sec of frame.sections as Array<{ name: string; y: number; h: number }>) {
  await page.screenshot({ path: join(outDir, "sections", `figma-${sec.name.toLowerCase().replace(/\s+/g, "-")}.png`), clip: { x: 0, y: Math.max(0, sec.y - 30), width: root.w, height: sec.h + 60 } }).catch(() => {});
}
await browser.close();
console.log(`figma render: ${png}`);
