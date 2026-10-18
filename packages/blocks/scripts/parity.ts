/**
 * Block parity: every block × every fixture case rendered by templ (cmd/render) and Svelte 5 SSR must
 * produce the same normalized DOM. Also enforces: no inline style attributes, only ui-* classes,
 * every ui-* class known to the adapter, and exactly one top-level landmark per block render.
 *   bun --preload ../../tools/svelte-preload.ts scripts/parity.ts    (cwd packages/blocks)
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { render } from "svelte/server";
import { normalizeHtml } from "../../ui/scripts/testing";
import { registry } from "../svelte/index";
import { cases as loadCases } from "./cases";

const PKG = resolve(import.meta.dir, "..");
const ROOT = resolve(PKG, "../..");
const cases = loadCases();
const known = new Set<string>([
  ...Object.keys(JSON.parse(readFileSync(join(ROOT, "packages/ui/classes.json"), "utf8"))),
  ...Object.keys(JSON.parse(readFileSync(join(PKG, "classes.json"), "utf8"))),
]);
const LANDMARK = /^<(header|footer|section|nav|main|aside|article)\b/;

const goOut = JSON.parse(execFileSync("go", ["run", "./cmd/render"], { cwd: join(PKG, "templ"), input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 64 << 20 })) as string[];
const problems: string[] = [];
let mismatches = 0;
const covered = new Set<string>();
cases.forEach((c, i) => {
  const comp = registry[c.block];
  if (!comp) { problems.push(`no svelte component for ${c.block}`); return; }
  covered.add(c.block);
  const sv = render(comp, { props: { data: c.data } }).body;
  const go = goOut[i]!;
  if (!Bun.deepEquals(normalizeHtml(go), normalizeHtml(sv))) {
    mismatches++;
    problems.push(`DOM mismatch: ${c.block} (${c.label})`);
    if (process.env.PARITY_DEBUG) problems.push(`  templ:  ${go.slice(0, 2000)}\n  svelte: ${sv.slice(0, 2000)}`);
  }
  if (/\sstyle=/.test(go) || /\sstyle=/.test(sv)) problems.push(`inline style in ${c.block}`);
  for (const m of go.matchAll(/(?<![\w-])class="([^"]*)"/g)) for (const t of m[1]!.split(/\s+/).filter(Boolean)) {
    if (!t.startsWith("ui-")) problems.push(`non-semantic class "${t}" in ${c.block}`);
    else if (!known.has(t)) problems.push(`unknown ui-* class "${t}" in ${c.block}`);
  }
  if (!LANDMARK.test(go.trim())) problems.push(`${c.block}: root is not a landmark element`);
});
const missing = Object.keys(registry).filter((id) => !covered.has(id));
for (const id of missing) problems.push(`no fixture case for block ${id}`);
for (const p of [...new Set(problems)].slice(0, 40)) console.error(p);
console.log(`parity(blocks): ${cases.length} cases, ${covered.size}/${Object.keys(registry).length} blocks, ${mismatches} DOM mismatches, ${new Set(problems).size} problems`);
if (problems.length) process.exit(1);
