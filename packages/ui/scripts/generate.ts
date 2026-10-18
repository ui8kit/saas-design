/**
 * Writes the generated primitive packages from the semantic bricks of ./registry.ts with the @ui8kit/codegen 2.0 (xgen) emitters:
 *   packages/ui/svelte  Svelte 5   (src/primitives, src/utils, src/index.ts)
 *   packages/ui/react   React 19   (src/primitives, src/utils, src/index.ts)
 *   packages/ui/templ   Go templ   (ui/, utils/, cmd/parity, go.mod; *_templ.go is built by `templ generate`)
 *   packages/adapter/src/primitives.generated.css   .ui-* { @apply ... }   (+ packages/ui/classes.json)
 *   packages/adapter/src/kit.generated.css          the codegen kit layer (glyph utilities, focus ring, summary indicator)
 * Same assembly as xgen/generator/src/plan.ts (uiPackage) and templ.ts (templFiles), limited to the primitives:
 * blocks are this repo's own DSL (packages/blocks), not xgen organisms.
 *   bun scripts/generate.ts           write
 *   bun scripts/generate.ts --check   fail on drift
 */
import { existsSync, mkdirSync, writeFileSync, readdirSync, rmSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { xgenPaths } from "@ui8kit/xgen-schema";
import { BANNER, isEmptyRecipe, readAsset, recipeOwner, variantsName } from "@ui8kit/xgen-runtime-core";
import { SvelteEmitter } from "@ui8kit/xgen-runtime-svelte";
import { ReactEmitter } from "@ui8kit/xgen-runtime-react";
import { TemplEmitter, emitGoParityHarness, TEMPL_VERSION } from "@ui8kit/xgen-runtime-templ";
import { bricks, css, GO_MODULE, XGEN, upstreamUtilities } from "./registry";
import { applyRules } from "../../../tools/css-apply";

const ROOT = resolve(import.meta.dir, "../../..");
const CHECK = process.argv.includes("--check");
const RT = join(XGEN, "runtimes");
const SRC = "@ui8kit/codegen 2.0 (packages/ui/scripts/generate.ts)";
const banner = (path: string, src: string): string => {
  if (src.includes(BANNER)) return src;
  if (path.endsWith(".css")) return `/* ${BANNER} */\n${src}`;
  if (path.endsWith(".svelte")) return `<!-- ${BANNER} -->\n${src}`;
  return `// ${BANNER}\n${src}`;
};
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const files = new Map<string, string>();
const put = (p: string, s: string) => files.set(p, s);

function lucideTs(): string {
  const { icons } = JSON.parse(readFileSync(xgenPaths(XGEN).lucide, "utf8")) as { icons: Record<string, unknown> };
  return [`// ${BANNER}`, `// Lucide icons (ISC license, https://lucide.dev), from the pinned @ui8kit/codegen (xgen/specs/assets/lucide-icons.json).`,
    `export const LUCIDE: Record<string, Array<[string, Record<string, string>]>> = {`, ...Object.entries(icons).map(([n, v]) => `  ${JSON.stringify(n)}: ${JSON.stringify(v)},`), `};`, ``].join("\n");
}
function lucideGo(): string {
  const { icons } = JSON.parse(readFileSync(xgenPaths(XGEN).lucide, "utf8")) as { icons: Record<string, Array<[string, Record<string, string>]>> };
  const node = ([tag, attrs]: [string, Record<string, string>]) => `{${JSON.stringify(tag)}, map[string]string{${Object.entries(attrs).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")}}}`;
  const rows = Object.entries(icons).map(([n, nodes]) => `\t${JSON.stringify(n)}: {\n${nodes.map((x) => `\t\t${node(x)},`).join("\n")}\n\t},`);
  return [`// ${BANNER}`, `// Lucide icons (ISC license, https://lucide.dev).`, ``, `package lucideicon`, ``, `type glyphNode struct {\n\tTag   string\n\tAttrs map[string]string\n}`, ``, `var lucide = map[string][]glyphNode{`, ...rows, `}`, ``].join("\n");
}
/** the hand-written LucideIcon assets carry the spec's utilities as a literal: point them at the semantic class of the spec instead */
function lucideAsset(src: string): string {
  const lit = '"inline-block shrink-0"';
  if (!src.includes(lit)) throw new Error("LucideIcon asset: class literal changed upstream, update lucideAsset()");
  if (css.get("ui-lucide-icon") !== "inline-block shrink-0") throw new Error("ui-lucide-icon: spec classes changed upstream, update lucideAsset()");
  return src.replace(lit, '"ui-lucide-icon"');
}
function utils(prefix: string) {
  const dir = join(RT, "core/assets/ts");
  const walk = (rel: string): string[] => readdirSync(join(dir, rel), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((e) => (e.isDirectory() ? walk(join(rel, e.name)) : [join(rel, e.name)]));
  for (const f of walk("")) put(`${prefix}/src/utils/${f}`, banner(f, readFileSync(join(dir, f), "utf8")));
}

// ---- Svelte 5 + React 19 --------------------------------------------------------------------------
for (const r of ["svelte", "react"] as const) {
  const prefix = `packages/ui/${r}`;
  const emitter = r === "svelte" ? new SvelteEmitter() : new ReactEmitter();
  const ext = r === "svelte" ? "svelte" : "tsx";
  const barrel: string[] = [];
  for (const brick of bricks) {
    const emitted = emitter.emit(brick as any);
    if (brick.id === "ui.lucide-icon") {
      emitted[0] = { path: emitted[0]!.path, contents: banner(`x.${ext}`, lucideAsset(readFileSync(join(RT, r, "assets", `LucideIcon.${ext}`), "utf8"))) };
      emitted.push({ path: `primitives/${brick.dir}/lucide-icons.ts`, contents: lucideTs() });
    }
    for (const f of emitted) put(`${prefix}/src/${f.path}`, f.contents);
    if (r === "svelte") {
      brick.parts.forEach((p: any, i: number) => {
        barrel.push(`export { default as ${p.name} } from "./${emitted[i]!.path}";`, `export type { ${p.name}Props } from "./${emitted[i]!.path}";`);
        const owned = Object.keys(brick.recipes).filter((id) => recipeOwner(brick as any, id) === p && !isEmptyRecipe((brick.recipes as any)[id])).map(variantsName);
        if (owned.length && brick.id !== "ui.lucide-icon") barrel.push(`export { ${owned.join(", ")} } from "./${emitted[i]!.path}";`);
      });
    } else for (const f of emitted.filter((f) => /(\.tsx|-variants\.ts)$/.test(f.path))) barrel.push(`export * from "./${f.path.replace(/\.tsx?$/, "")}";`);
  }
  if (r === "react") put(`${prefix}/src/primitives/slot/slot.tsx`, banner("slot.tsx", readFileSync(join(RT, "react/assets/slot.tsx"), "utf8")));
  utils(prefix);
  barrel.push(``, `// utils`, `export { cn, variants } from "./utils";`);
  put(`${prefix}/src/index.ts`, [`// ${BANNER}`, `// Source: ${SRC}`, ``, `// primitives`, ...barrel].join("\n") + "\n");
}

// ---- Go templ -------------------------------------------------------------------------------------
{
  const prefix = "packages/ui/templ";
  const emitter = new TemplEmitter({ goModule: GO_MODULE });
  for (const b of bricks) {
    if (b.id === "ui.lucide-icon") {
      put(`${prefix}/ui/${b.dir}/lucide-icon.templ`, banner("x.go", lucideAsset(readFileSync(join(RT, "templ/assets/LucideIcon.templ"), "utf8").replaceAll("{{MODULE}}", GO_MODULE))));
      put(`${prefix}/ui/${b.dir}/lucide_icons.go`, lucideGo());
      continue;
    }
    for (const f of emitter.emit(b as any)) put(`${prefix}/${f.path}`, f.path.endsWith(".json") ? JSON.stringify({ "//": BANNER, ...JSON.parse(f.contents) }, null, 2) + "\n" : f.contents);
  }
  for (const n of readdirSync(join(RT, "templ/assets/go")).filter((n) => n.endsWith(".go") && !n.endsWith("_test.go") /* upstream unit tests of the helpers stay upstream */).sort()) put(`${prefix}/utils/${n}`, banner(n, readFileSync(join(RT, "templ/assets/go", n), "utf8")));
  const h = emitGoParityHarness(bricks as any, GO_MODULE);
  put(`${prefix}/${h.path}`, h.contents);
  put(`${prefix}/go.mod`, `// ${BANNER}\n// Source: ${SRC}\nmodule ${GO_MODULE}\n\ngo 1.26.0\n\nrequire github.com/a-h/templ ${TEMPL_VERSION}\n`);
}

// ---- adapter CSS -----------------------------------------------------------------------------------
put("packages/adapter/src/primitives.generated.css", `/* Generated by packages/ui/scripts/generate.ts. Do not edit: change packages/ui/recipes/*.variants.json. */
/* Semantic classes emitted by the generated primitives (templ, svelte, react). Utilities only inside @apply. */
@layer components {
${[...css.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([k, v]) => applyRules(`.${k}`, v)).join("\n")}
}
`);
// the kit layer without its document base (@layer base: margins, body colours, text-rendering, color-scheme): packages/adapter/src/base.css
// owns the document defaults (the Figma-measured rendering), the kit keeps the glyph utilities, the focus ring and the summary indicator
const kit = readAsset("styles", "kit.css");
const baseLayer = /@layer base \{[\s\S]*?\n\}\n/;
if (!baseLayer.test(kit)) throw new Error("kit.css: @layer base block not found, update generate.ts");
// the summary indicator rule is unlayered upstream: put it in the components layer so a block can restyle or hide it
const indicator = /\[data-slot="summary-indicator"\] \{[\s\S]*?\n\}\n/;
if (!indicator.test(kit)) throw new Error("kit.css: summary-indicator rule not found, update generate.ts");
put("packages/adapter/src/kit.generated.css", `/* Generated by packages/ui/scripts/generate.ts from the pinned @ui8kit/codegen (xgen/runtimes/core/assets/styles/kit.css)
   without its @layer base and with the summary-indicator rule moved into @layer components. Do not edit. */\n${kit.replace(baseLayer, "").replace(indicator, (r) => `@layer components {\n${r}}\n`)}`);
put("packages/ui/upstream-utilities.json", JSON.stringify({ $comment: "Utilities taken verbatim from the pinned @ui8kit/codegen 2.0 specs (not from packages/ui/recipes). tools/ui8px-policy.ts allows them: they passed the upstream ui8px gate.", utilities: [...upstreamUtilities].sort() }, null, 2) + "\n");
put("packages/ui/classes.json", JSON.stringify(Object.fromEntries([...css.entries()].sort()), null, 2) + "\n");

// ---- write / check ----------------------------------------------------------------------------------
const list = (d: string): string[] => !existsSync(join(ROOT, d)) ? [] : readdirSync(join(ROOT, d), { withFileTypes: true }).flatMap((x) => x.isDirectory() ? (x.name === "node_modules" ? [] : list(`${d}/${x.name}`)) : [`${d}/${x.name}`]);
// generated trees are owned by this script; templ's *_templ.go and go.sum are produced by `templ generate` / `go mod tidy`
const owned = ["packages/ui/templ", "packages/ui/svelte", "packages/ui/react"].flatMap(list).filter((p) => !p.endsWith("_templ.go") && !p.endsWith("go.sum") && !p.endsWith("/package.json"));
let drift = 0;
for (const p of owned) if (!files.has(p)) { if (CHECK) { console.error(`drift: stale ${p}`); drift++; } else rmSync(join(ROOT, p)); }
for (const [p, s] of files) {
  const full = join(ROOT, p);
  if (existsSync(full) && readFileSync(full, "utf8") === s) continue;
  if (CHECK) { console.error(`drift: ${p} (run: bun run --cwd packages/ui generate)`); drift++; continue; }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, s);
}
const partCount = bricks.reduce((n: number, b: any) => n + b.parts.length, 0);
console.log(`codegen 2.0: ${bricks.length} bricks, ${partCount} parts; svelte + react + templ; ${files.size} files ${CHECK ? "checked" : "in sync"}; ${css.size} semantic classes`);
if (drift) process.exit(1);
