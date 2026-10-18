/**
 * DOM parity of the two design-system docs apps: every prerendered page of apps/design-react/build must have the same
 * <body> DOM as apps/design-svelte/build (parse5-normalized: attribute order, class order and whitespace do not count;
 * SvelteKit hydration markers and scripts are dropped). Both apps must be built first.
 *   bun tools/design-parity.ts [--diff]
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { normalizeHtml } from "../packages/ui/scripts/testing";

const ROOT = resolve(import.meta.dir, "..");
const SVELTE = join(ROOT, "apps/design-svelte/build");
const REACT = join(ROOT, "apps/design-react/build");
const DIFF = process.argv.includes("--diff");

const pages = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === "_app" || f === "assets" || f === "media" ? [] : pages(p);
    return f.endsWith(".html") ? [p] : [];
  });
const body = (html: string) =>
  normalizeHtml(
    (html.match(/<div class="ui-page">([\s\S]*)<\/div>\s*<\/body>/)?.[1] ?? "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/ on(load|error)="this\.__e=event"/g, ""), // SvelteKit SSR image hooks (same exception as packages/ui parity)
  );
const title = (html: string) => html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();

const s = pages(SVELTE).map((p) => relative(SVELTE, p)).sort();
const r = pages(REACT).map((p) => relative(REACT, p)).sort();
const problems: string[] = [];
for (const f of s) if (!r.includes(f)) problems.push(`missing in design-react: ${f}`);
for (const f of r) if (!s.includes(f)) problems.push(`missing in design-svelte: ${f}`);
let same = 0;
for (const f of s.filter((x) => r.includes(x))) {
  const a = readFileSync(join(SVELTE, f), "utf8");
  const b = readFileSync(join(REACT, f), "utf8");
  if (title(a) !== title(b)) problems.push(`${f}: <title> ${JSON.stringify(title(a))} vs ${JSON.stringify(title(b))}`);
  const x = body(a), y = body(b);
  if (x === y) { same++; continue; }
  let i = 0; while (x[i] === y[i]) i++;
  problems.push(`${f}: DOM differs at ${i}\n  svelte: ${x.slice(Math.max(0, i - 80), i + 120)}\n  react:  ${y.slice(Math.max(0, i - 80), i + 120)}`);
}
if (!existsSync(SVELTE) || !existsSync(REACT)) problems.push("build both apps first");
for (const p of problems.slice(0, DIFF ? 200 : 8)) console.error(p);
console.log(`design parity: ${s.length} pages; react ${same}/${s.length} DOM-identical to svelte; ${problems.length} problems`);
if (problems.length) process.exit(1);
