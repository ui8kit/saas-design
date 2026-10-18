/**
 * App-level retag + block rules: the codegen 2.0 `rules` detectors (xgen/check/src/rules, reused as is) run on the
 * composition code of every app and on the generated blocks, so app markup follows the same rules as the kit:
 *   block-root      a page / block opens on Block (directly or through a component whose file opens on Block);
 *                   one Block per render path, none nested in the same file, none in a loop (extract a file)
 *   raw-native-tag  no raw HTML tags: primitives with tag/as (Block tag="nav", Container tag="main", Title as={2}, ...)
 *   raw-html        no {@html} / dangerouslySetInnerHTML / templ.Raw in markup
 *   dynamic-tag     no <svelte:element this> / computed tags
 *   reactive-aria   aria state (aria-current, aria-expanded, ...) is never an expression: use a primitive prop or a static
 *                   attribute in each branch
 *   inline-style    (this repo) no style attribute anywhere: semantic classes only
 *   literal-text    report-only: docs apps carry their own copy; block copy comes from fixtures (blocking for blocks)
 * Document shells (templ layout <html>/<head>/<body>) may use document tags only.
 * Accepted findings live in tools/lint-apps.baseline.json (file + detector + message, each with a reason; a stale entry fails),
 * the same ratchet as rules/baselines/*.json of codegen 2.0. Icons are components (packages/icons: Go icons.Icon, Svelte
 * Icon.svelte, React Icon), so blocks hold no raw-HTML write.
 *   bun tools/lint-apps.ts [--verbose]
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { detect, rootOf, walk, type Finding } from "../packages/ui/.xgen/xgen/check/src/rules/detectors";
import type { IrFile, Runtime } from "../packages/ui/.xgen/xgen/check/src/rules/ir";
import { reactToIr } from "../packages/ui/.xgen/xgen/check/src/rules/react";
import { svelteToIr } from "../packages/ui/.xgen/xgen/check/src/rules/svelte";
import { templToIr } from "../packages/ui/.xgen/xgen/check/src/rules/templ";

// only the adapters of this repo's runtimes (the upstream index also loads Vue, Solid, Twig, Latte)
const toIr = (rt: Runtime, src: string, file: string): IrFile => (rt === "svelte" ? svelteToIr(src) : rt === "react" ? reactToIr(src) : templToIr(src, file));

const ROOT = resolve(import.meta.dir, "..");
const VERBOSE = process.argv.includes("--verbose");

type Zone = {
  name: string;
  dir: string; // repo-relative
  runtime: Runtime;
  ext: string;
  composition: string[]; // dirs under `dir` that are scanned
  blockRoot: RegExp; // files (dir-relative) that must open on Block
  document?: RegExp; // document shells: may use DOCUMENT_TAGS
  aliases?: Record<string, string>; // import prefix -> dir-relative path (resolution of Block-rooted components)
  literalText: "block" | "report";
};

const ZONES: Zone[] = [
  { name: "apps/site", dir: "apps/site", runtime: "templ", ext: ".templ", composition: ["views"], blockRoot: /^$/, document: /^views\/layout\.templ$/, literalText: "report" },
  { name: "apps/design-svelte", dir: "apps/design-svelte", runtime: "svelte", ext: ".svelte", composition: ["src"], blockRoot: /\/\+page\.svelte$/, aliases: { "$lib/": "src/lib/" }, literalText: "report" },
  { name: "apps/design-react", dir: "apps/design-react", runtime: "react", ext: ".tsx", composition: ["src"], blockRoot: /^src\/pages\//, literalText: "report" },
  // generated blocks (one DSL, three runtimes): every block file opens on Block
  { name: "packages/blocks (svelte)", dir: "packages/blocks", runtime: "svelte", ext: ".svelte", composition: ["svelte"], blockRoot: /\.svelte$/, literalText: "block" },
  { name: "packages/blocks (react)", dir: "packages/blocks", runtime: "react", ext: ".tsx", composition: ["react"], blockRoot: /\.tsx$/, literalText: "block" },
  { name: "packages/blocks (templ)", dir: "packages/blocks", runtime: "templ", ext: ".templ", composition: ["templ/blocks"], blockRoot: /\.templ$/, literalText: "block" },
];
const DOCUMENT_TAGS = new Set(["html", "head", "body", "meta", "title", "link", "script"]);

const filesUnder = (abs: string, ext: string): string[] =>
  !existsSync(abs) ? [] : statSync(abs).isDirectory() ? readdirSync(abs).sort().flatMap((n) => (n === "node_modules" ? [] : filesUnder(join(abs, n), ext))) : abs.endsWith(ext) ? [abs] : [];

const irCache = new Map<string, IrFile>();
const irOf = (abs: string, rt: Runtime) => { let x = irCache.get(abs); if (!x) { x = toIr(rt, readFileSync(abs, "utf8"), abs); irCache.set(abs, x); } return x; };

/** does the component `name` imported by `from` open on Block? (relative imports, zone aliases, same-file-name siblings) */
function resolver(zone: Zone) {
  const base = join(ROOT, zone.dir);
  const memo = new Map<string, boolean>();
  const target = (from: string, file: IrFile, name: string): string | undefined => {
    const spec = file.imports.get(name);
    if (!spec) return undefined;
    let p: string | undefined;
    if (spec.startsWith(".")) p = resolve(dirname(from), spec);
    else for (const [a, d] of Object.entries(zone.aliases ?? {})) if (spec.startsWith(a)) p = join(base, d, spec.slice(a.length));
    return p ? [p, p + zone.ext].find((x) => existsSync(x) && statSync(x).isFile()) : undefined;
  };
  const opens = (abs: string, stack: Set<string>): boolean => {
    if (memo.has(abs)) return memo.get(abs)!;
    if (stack.has(abs)) return false;
    stack.add(abs);
    const ir = irOf(abs, zone.runtime);
    const root = rootOf(ir.nodes);
    const ok = !!root && root.kind === "component" && (root.name === "Block" || (() => { const t = target(abs, ir, root.name); return t ? opens(t, stack) : false; })());
    memo.set(abs, ok);
    return ok;
  };
  return (from: string, ir: IrFile) => (name: string) => { const t = target(from, ir, name); return t ? opens(t, new Set([from])) : undefined; };
}

type Hit = Finding & { file: string; blocking: boolean; baselined?: boolean };
const hits: Hit[] = [];
const summary: string[] = [];
let errors = 0;
for (const zone of ZONES) {
  const rootsOnBlock = resolver(zone);
  let files = 0;
  for (const c of zone.composition) for (const abs of filesUnder(join(ROOT, zone.dir, c), zone.ext)) {
    const rel = relative(join(ROOT, zone.dir), abs);
    files++;
    const ir = irOf(abs, zone.runtime);
    if (ir.error) { console.error(`${zone.dir}/${rel}: parse error ${ir.error}`); errors++; continue; }
    const doc = zone.document?.test(rel) ?? false;
    const found: Finding[] = detect(ir, { blockRoot: zone.blockRoot.test(rel), rootsOnBlock: rootsOnBlock(abs, ir) })
      .filter((f) => !(doc && f.detector === "raw-native-tag" && DOCUMENT_TAGS.has(f.message.replace(/^raw <|>$/g, ""))));
    for (const n of walk(ir.nodes)) for (const a of "attrs" in n ? n.attrs : []) if (a.name === "style") found.push({ detector: "inline-style" as Finding["detector"], line: a.line, message: "style attribute (use a semantic class)" });
    for (const f of found) hits.push({ ...f, file: `${zone.dir}/${rel}`, blocking: f.detector !== "literal-text" || zone.literalText === "block" });
  }
  const mine = hits.filter((h) => h.file.endsWith(zone.ext) && zone.composition.some((c) => h.file.startsWith(`${zone.dir}/${c}/`)));
  summary.push(`${zone.name}: ${files} files`);
}
// accepted findings (tools/lint-apps.baseline.json): matched by file + detector + message; stale entries fail
type Entry = { file: string; detector: string; message: string; reason: string };
const baseline = (JSON.parse(readFileSync(join(ROOT, "tools/lint-apps.baseline.json"), "utf8")) as { entries: Entry[] }).entries;
const used = new Set<Entry>();
for (const h of hits) {
  const e = baseline.find((x) => x.file === h.file && x.detector === h.detector && x.message === h.message);
  if (e && h.blocking) { h.blocking = false; h.baselined = true; used.add(e); }
}
const stale = baseline.filter((e) => !used.has(e));
for (const e of stale) console.error(`error tools/lint-apps.baseline.json: stale entry ${e.file} [${e.detector}] ${e.message} (no longer found: remove it)`);
errors += stale.length;
const blocking = hits.filter((h) => h.blocking);
for (const h of VERBOSE ? hits : blocking) console.error(`${h.blocking ? "error" : "note "} ${h.file}:${h.line} [${h.detector}] ${h.message}`);
for (const [i, zone] of ZONES.entries()) {
  const mine = hits.filter((h) => h.file.startsWith(`${zone.dir}/`) && h.file.endsWith(zone.ext) && zone.composition.some((c) => h.file.startsWith(`${zone.dir}/${c}/`)));
  summary[i] += `, ${mine.filter((h) => h.blocking).length} blocking, ${mine.filter((h) => h.baselined).length} baselined, ${mine.filter((h) => !h.blocking && !h.baselined).length} report-only`;
}
console.log(summary.join("\n"));
console.log(`lint-apps: ${blocking.length} blocking, ${used.size} baselined (tools/lint-apps.baseline.json), ${hits.filter((h) => !h.blocking && !h.baselined).length} report-only (literal-text in docs apps)${errors ? `, ${errors} errors` : ""}`);
if (blocking.length || errors) process.exit(1);
