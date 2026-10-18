/**
 * Block parity: every block × every fixture case rendered by templ (cmd/render), Svelte 5 SSR and React 19
 * (react-dom/server) must produce the same normalized DOM. Also enforces: no inline style attributes, only ui-* classes,
 * every ui-* class known to the adapter, and exactly one top-level landmark per block render.
 *   bun --preload ../../tools/svelte-preload.ts scripts/parity.ts    (cwd packages/blocks)
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { render } from "svelte/server";
import { normalizeHtml } from "../../ui/scripts/testing";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { registry } from "../svelte/index";
import { registry as reactRegistry } from "../react/index";
import { cases as loadCases } from "./cases";

const PKG = resolve(import.meta.dir, "..");
const ROOT = resolve(PKG, "../..");
const cases = loadCases();
const known = new Set<string>([
  ...Object.keys(JSON.parse(readFileSync(join(ROOT, "packages/ui/classes.json"), "utf8"))),
  ...Object.keys(JSON.parse(readFileSync(join(PKG, "classes.json"), "utf8"))),
  // hand-written adapter classes (base.css)
  ...[...readFileSync(join(ROOT, "packages/adapter/src/base.css"), "utf8").matchAll(/\.(ui-[\w-]+)\s*\{/g)].map((m) => m[1]!),
]);
const LANDMARK = /^<(header|footer|section|nav|main|aside|article)\b/;

const goOut = JSON.parse(execFileSync("go", ["run", "./cmd/render"], { cwd: join(PKG, "templ"), input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 64 << 20 })) as string[];
// React SSR dev warnings: static (read-only) checkbox cases; kebab-case SVG attributes of the generated Sheet/ThemeToggle (.project/backlog/codegen2-react-svg-attrs.md). Not markup differences.
console.error = ((orig) => (...a: unknown[]) => { if (!/without an `onChange` handler|Invalid DOM property/.test(String(a[0]))) orig(...a); })(console.error);
const problems: string[] = [];
let mismatches = 0, reactMismatches = 0;
const covered = new Set<string>();
cases.forEach((c, i) => {
  const comp = registry[c.block];
  if (!comp) { problems.push(`no svelte component for ${c.block}`); return; }
  covered.add(c.block);
  // Svelte SSR adds onload/onerror="this.__e=event" to an <img> with spread attributes (event replay on hydration): not markup
  const sv = render(comp, { props: { data: c.data } }).body.replace(/ on(load|error)="this\.__e=event"/g, "");
  const rc = reactRegistry[c.block];
  if (!rc) { problems.push(`no react component for ${c.block}`); return; }
  const rx = renderToStaticMarkup(createElement(rc, { data: c.data }));
  const go = goOut[i]!;
  const want = normalizeHtml(go);
  if (want !== normalizeHtml(sv)) {
    mismatches++;
    problems.push(`DOM mismatch templ/svelte: ${c.block} (${c.label})`);
    if (process.env.PARITY_DEBUG) problems.push(`  templ:  ${want.slice(0, 3000)}\n  svelte: ${normalizeHtml(sv).slice(0, 3000)}`);
  }
  if (want !== normalizeHtml(rx)) {
    reactMismatches++;
    problems.push(`DOM mismatch templ/react: ${c.block} (${c.label})`);
    if (process.env.PARITY_DEBUG) problems.push(`  templ: ${want.slice(0, 3000)}\n  react: ${normalizeHtml(rx).slice(0, 3000)}`);
  }
  if (/\sstyle=/.test(rx)) problems.push(`inline style in ${c.block} (react)`);
  if (/\sstyle=/.test(go) || /\sstyle=/.test(sv)) problems.push(`inline style in ${c.block}`);
  for (const m of go.matchAll(/(?<![\w-])class="([^"]*)"/g)) for (const t of m[1]!.split(/\s+/).filter(Boolean)) {
    if (/^(group|peer)(\/.*)?$/.test(t)) continue; // Tailwind marker classes (Disclosure: group for group-open:), no styling of their own
    if (!t.startsWith("ui-")) problems.push(`non-semantic class "${t}" in ${c.block}`);
    else if (!known.has(t)) problems.push(`unknown ui-* class "${t}" in ${c.block}`);
  }
  if (!LANDMARK.test(go.trim())) problems.push(`${c.block}: root is not a landmark element`);
});
const missing = Object.keys(registry).filter((id) => !covered.has(id));
for (const id of missing) problems.push(`no fixture case for block ${id}`);
for (const p of [...new Set(problems)].slice(0, Number(process.env.PARITY_MAX ?? 40))) console.error(p);
const n = cases.length;
console.log(`parity(blocks): ${n} cases, ${covered.size}/${Object.keys(registry).length} blocks; svelte ${n - mismatches}/${n}, react ${n - reactMismatches}/${n} identical to templ; ${new Set(problems).size} problems`);
if (problems.length) process.exit(1);
