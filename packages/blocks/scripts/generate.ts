/**
 * Emits every block in defs/ for both runtimes:
 *   templ/blocks/<id>.templ, templ/blocks/models.go, templ/blocks/registry.go
 *   svelte/<Name>.svelte, svelte/types.ts, svelte/index.ts
 *   ../adapter/src/blocks.generated.css
 *   catalog.json (id, title, category, figma, parts)
 *   bun scripts/generate.ts [--check]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { isExpr, type BlockDef, type Child, type Expr, type Node, type Schema, type Val } from "./dsl";
import { blocks } from "../defs";

const PKG = resolve(import.meta.dir, "..");
const ROOT = resolve(PKG, "../..");
const UI_TEMPL = join(ROOT, "packages/ui/templ/ui");
const UI_SVELTE_INDEX = join(ROOT, "packages/ui/svelte/ui/index.svelte.ts");
const CHECK = process.argv.includes("--check");

// ---- primitive registry (read from generated packages/ui) ----
type Field = { name: string; type: string };
const compDir = new Map<string, string>();
for (const m of readFileSync(UI_SVELTE_INDEX, "utf8").matchAll(/export \{ default as (\w+) \} from "\.\/([\w-]+)\/\w+\.svelte"/g)) compDir.set(m[1]!, m[2]!);
const goFields = new Map<string, Field[]>();
const goPkg = new Map<string, string>(); // dir -> Go package name (switch → formswitch, select → selectfield)
for (const dir of readdirSync(UI_TEMPL)) for (const f of readdirSync(join(UI_TEMPL, dir)).filter((f) => f.endsWith(".templ"))) {
  goPkg.set(dir, /^package (\w+)/m.exec(readFileSync(join(UI_TEMPL, dir, f), "utf8"))![1]!);
  for (const m of readFileSync(join(UI_TEMPL, dir, f), "utf8").matchAll(/type (\w+)Props struct \{([\s\S]*?)\n\}/g)) {
    goFields.set(m[1]!, [...m[2]!.matchAll(/^\s+(\w+)\s+([\w.]+)/gm)].map((x) => ({ name: x[1]!, type: x[2]! })));
  }
}

// ---- helpers ----
const pascal = (s: string) => s.replace(/(^|[-_ ])(\w)/g, (_, __, ch) => ch.toUpperCase()).replace(/^(\w)/, (ch) => ch.toUpperCase());
const goKey = (s: string) => { const p = pascal(s); return p === "Id" ? "ID" : p.replace(/Id$/, "ID").replace(/Url$/, "URL").replace(/Href$/, "Href"); };
const goStr = (s: string) => JSON.stringify(s);
const svStr = (s: string) => JSON.stringify(s);

type Scope = { root: { [k: string]: Schema }; vars: Map<string, Schema>; block: BlockDef };
type R = { go: string; sv: string; type: Schema };
function resolveExpr(e: Expr, sc: Scope): R {
  const segs = e.$.split(".");
  let go: string, sv: string, type: Schema;
  const first = segs[0]!;
  if (sc.vars.has(first)) { go = first; sv = first; type = sc.vars.get(first)!; segs.shift(); }
  else { go = "p"; sv = "data"; type = sc.root; }
  for (const s of segs) {
    if (typeof type !== "object" || Array.isArray(type) || !(s in type)) throw new Error(`[${sc.block.id}] unknown path ${e.$}`);
    type = (type as any)[s];
    go += "." + goKey(s); sv += "." + s;
  }
  return { go, sv, type };
}

// ---- CSS collection ----
const cssRules = new Map<string, { css: string; block: string }>();
function addCss(cls: string, css: string | undefined, block: string) {
  if (!css) return;
  const prev = cssRules.get(cls);
  if (prev && prev.css !== css.trim().replace(/\s+/g, " ")) throw new Error(`class ${cls} defined twice with different css`);
  if (/\[|\]|style=|!important/.test(css)) throw new Error(`[${block}] arbitrary value or style in ${cls}: ${css}`);
  cssRules.set(cls, { css: css.trim().replace(/\s+/g, " "), block });
}

type ClassOut = { goExpr: string | null; svAttr: string | null; dataClass: string | null };
function classFor(n: Node & { ui?: string }, sc: Scope, isRoot: boolean): ClassOut {
  const st = n as any;
  if (!isRoot && !st.ui && !st.css && !st.variants) return { goExpr: null, svAttr: null, dataClass: null };
  let ui: string | undefined = st.ui;
  if (!isRoot && !ui) {
    // unnamed styled node: derive a part name from the element (button, button-2, …)
    const stem = String((n as any).comp ?? (n as any).tag).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const want = (st.css ?? "").trim().replace(/\s+/g, " ");
    for (let i = 1; ; i++) { const cand = i === 1 ? stem : `${stem}-${i}`; const r = cssRules.get(`ui-${sc.block.id}-${cand}`); if (!r || r.css === want) { ui = cand; break; } }
  }
  const base = `ui-${sc.block.id}${ui ? "-" + ui : ""}`;
  addCss(base, st.css ?? (isRoot ? undefined : undefined), sc.block.id);
  if (!st.css && !cssRules.has(base)) cssRules.set(base, { css: "", block: sc.block.id });
  else if (!st.css && cssRules.get(base)!.css) throw new Error(`class ${base} used with and without css`);
  let goExpr = goStr(base), sv = base;
  for (const [key, choices] of Object.entries((st.variants ?? {}) as Record<string, Record<string, string>>)) {
    for (const [v, css] of Object.entries(choices)) addCss(`${base}-${key}-${v}`, css, sc.block.id);
    const ex = st.vary?.[key];
    if (!ex) throw new Error(`[${sc.block.id}] variant ${key} on ${base} has no vary expr`);
    const r = resolveExpr(ex, sc);
    goExpr += ` + " ${base}-${key}-" + ${r.go}`;
    sv += ` ${base}-${key}-{${r.sv}}`;
  }
  return { goExpr, svAttr: sv, dataClass: base.slice(3) };
}

// ---- value rendering ----
function goVal(v: Val, sc: Scope, type?: string): string {
  if (isExpr(v)) return resolveExpr(v, sc).go;
  if (typeof v === "boolean") return String(v);
  if (type === "int") { if (!/^-?\d+$/.test(v)) throw new Error(`[${sc.block.id}] int prop needs digits: ${v}`); return v; }
  if (type?.endsWith("HeadingLevel")) { const m = /^h([1-6])$/.exec(v); if (!m) throw new Error(`[${sc.block.id}] bad heading level ${v}`); return m[1]!; }
  return goStr(v);
}
function svAttr(name: string, v: Val, sc: Scope): string {
  if (isExpr(v)) return `${name}={${resolveExpr(v, sc).sv}}`;
  if (typeof v === "boolean") return v ? `${name}={true}` : `${name}={false}`;
  return `${name}=${svStr(v)}`;
}
function goCond(n: Extract<Node, { k: "if" }>, sc: Scope): { go: string; sv: string } {
  const r = resolveExpr(n.test, sc);
  let go: string, sv: string;
  if (n.eq !== undefined) { go = `${r.go} == ${goStr(n.eq)}`; sv = `${r.sv} === ${svStr(n.eq)}`; }
  else if (Array.isArray(r.type)) { go = `len(${r.go}) > 0`; sv = `${r.sv}?.length > 0`; }
  else if (r.type === "bool") { go = r.go; sv = r.sv; }
  else { go = `${r.go} != ""`; sv = `${r.sv}`; }
  if (n.not) { go = `!(${go})`; sv = `!(${sv})`; }
  return { go, sv };
}

// ---- emitters ----
type Ctx = { goImports: Set<string>; svImports: Set<string>; uses: Set<string>; icons: boolean };
const ind = (d: number) => "\t".repeat(d);
const sind = (d: number) => "  ".repeat(d);

function emit(n: Child, sc: Scope, ctx: Ctx, d: number, isRoot = false): { go: string; sv: string } {
  if (typeof n === "string") return { go: `${ind(d)}{ ${goStr(n)} }\n`, sv: `${sind(d)}{${svStr(n)}}\n` };
  if (isExpr(n)) { const r = resolveExpr(n, sc); if (r.type !== "string") throw new Error(`[${sc.block.id}] text binding ${n.$} is not a string`); return { go: `${ind(d)}{ ${r.go} }\n`, sv: `${sind(d)}{${r.sv}}\n` }; }
  const kids = (children: Child[], s: Scope) => children.map((ch) => emit(ch, s, ctx, d + 1));
  const join2 = (xs: { go: string; sv: string }[]) => ({ go: xs.map((x) => x.go).join(""), sv: xs.map((x) => x.sv).join("") });
  switch (n.k) {
    case "each": {
      const r = resolveExpr(n.of, sc);
      if (!Array.isArray(r.type)) throw new Error(`[${sc.block.id}] each over non-array ${n.of.$}`);
      const vars = new Map(sc.vars); vars.set(n.as, r.type[0]!);
      const inner = join2(n.children.map((ch) => emit(ch, { ...sc, vars }, ctx, d + 1)));
      return { go: `${ind(d)}for _, ${n.as} := range ${r.go} {\n${inner.go}${ind(d)}}\n`, sv: `${sind(d)}{#each ${r.sv} as ${n.as}}\n${inner.sv}${sind(d)}{/each}\n` };
    }
    case "if": {
      const c = goCond(n, sc);
      const inner = join2(kids(n.children, sc));
      return { go: `${ind(d)}if ${c.go} {\n${inner.go}${ind(d)}}\n`, sv: `${sind(d)}{#if ${c.sv}}\n${inner.sv}${sind(d)}{/if}\n` };
    }
    case "icon": {
      ctx.icons = true;
      const cls = classFor(n as any, sc, false);
      const name = typeof n.name === "string" ? { go: goStr(n.name), sv: svStr(n.name) } : (() => { const r = resolveExpr(n.name, sc); return { go: r.go, sv: r.sv }; })();
      const goC = cls.goExpr ?? '""', svC = cls.svAttr ? "`" + cls.svAttr.replace(/\{/g, "${") + "`" : '""';
      return { go: `${ind(d)}@templ.Raw(icons.SVG(${name.go}, ${goC}))\n`, sv: `${sind(d)}{@html svg(${name.sv}, ${svC})}\n` };
    }
    case "use": {
      ctx.uses.add(n.block);
      const r = resolveExpr(n.data, sc);
      return { go: `${ind(d)}@${pascal(n.block)}(${r.go})\n`, sv: `${sind(d)}<${pascal(n.block)} data={${r.sv}} />\n` };
    }
    case "h": {
      const cls = classFor(n, sc, isRoot);
      let goA = "", svA = "";
      if (cls.goExpr) { goA += cls.goExpr.startsWith('"') && !cls.goExpr.includes("+") ? ` class=${cls.goExpr}` : ` class={ ${cls.goExpr} }`; svA += ` class="${cls.svAttr}"`; goA += ` data-class="${cls.dataClass}"`; svA += ` data-class="${cls.dataClass}"`; }
      for (const [k, v] of Object.entries(n.props)) {
        if (isExpr(v)) { const r = resolveExpr(v, sc); goA += r.type === "bool" ? ` ${k}?={ ${r.go} }` : ` ${k}={ ${r.go} }`; svA += ` ${k}={${r.sv}}`; }
        else if (typeof v === "boolean") { if (v) { goA += ` ${k}`; svA += ` ${k}`; } }
        else { goA += ` ${k}=${goStr(v)}`; svA += ` ${k}=${svStr(v)}`; }
      }
      const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source"]);
      if (VOID.has(n.tag)) return { go: `${ind(d)}<${n.tag}${goA}/>\n`, sv: `${sind(d)}<${n.tag}${svA} />\n` };
      const inner = join2(kids(n.children, sc));
      return { go: `${ind(d)}<${n.tag}${goA}>\n${inner.go}${ind(d)}</${n.tag}>\n`, sv: `${sind(d)}<${n.tag}${svA}>\n${inner.sv}${sind(d)}</${n.tag}>\n` };
    }
    case "c": {
      const dir = compDir.get(n.comp);
      const fields = goFields.get(n.comp);
      if (!dir || !fields) throw new Error(`[${sc.block.id}] unknown primitive ${n.comp}`);
      ctx.goImports.add(dir); ctx.svImports.add(n.comp);
      const cls = classFor(n, sc, isRoot);
      const goProps: string[] = []; const attrs: string[] = []; const svProps: string[] = [];
      if (cls.goExpr) { goProps.push(`Class: ${cls.goExpr}`); attrs.push(`"data-class": ${goStr(cls.dataClass!)}`); svProps.push(`class="${cls.svAttr}"`, `data-class="${cls.dataClass}"`); }
      for (const [k, v] of Object.entries(n.props)) {
        const norm = k === "for" ? "htmlfor" : k.replace(/-/g, "").toLowerCase();
        const f = fields.find((x) => x.name.toLowerCase() === norm && x.name !== "Attrs" && x.name !== "Class");
        if (f) goProps.push(`${f.name}: ${goVal(v, sc, f.type)}`);
        else attrs.push(`${goStr(k)}: ${goVal(v, sc)}`);
        // heading levels are numeric in both runtimes (Go uiutils.HeadingLevel, Svelte 1–6)
        if (f?.type.endsWith("HeadingLevel") && typeof v === "string") svProps.push(`${k}={${goVal(v, sc, f.type)}}`);
        // Go omits empty string fields (uiutils.IsSetStr); mirror that in Svelte
        else if (f?.type === "string" && isExpr(v)) svProps.push(`${k}={${resolveExpr(v, sc).sv} || undefined}`);
        else svProps.push(svAttr(k, v, sc));
      }
      if (attrs.length) goProps.push(`Attrs: templ.Attributes{${attrs.join(", ")}}`);
      const pkg = goPkg.get(dir)!;
      const call = `${pkg}.${n.comp}(${pkg}.${n.comp}Props{${goProps.join(", ")}})`;
      const svOpen = `<${n.comp}${svProps.length ? " " + svProps.join(" ") : ""}`;
      if (!n.children.length) return { go: `${ind(d)}@${call}\n`, sv: `${sind(d)}${svOpen} />\n` };
      const inner = join2(kids(n.children, sc));
      return { go: `${ind(d)}@${call} {\n${inner.go}${ind(d)}}\n`, sv: `${sind(d)}${svOpen}>\n${inner.sv}${sind(d)}</${n.comp}>\n` };
    }
  }
}

// ---- types ----
function goType(s: Schema, name: string, out: string[]): string {
  if (s === "string") return "string";
  if (s === "bool") return "bool";
  if (typeof s === "string" && s.startsWith("@")) return pascal(s.slice(1)) + "Data";
  if (Array.isArray(s)) return "[]" + goType(s[0]!, name + "Item", out);
  if (typeof s === "object") {
    const lines = Object.entries(s).map(([k, v]) => `\t${goKey(k)} ${goType(v, name + pascal(k), out)} \`json:"${k}"\``);
    out.push(`type ${name} struct {\n${lines.join("\n")}\n}`);
    return name;
  }
  throw new Error(`bad schema ${JSON.stringify(s)}`);
}
function tsType(s: Schema): string {
  if (s === "string") return "string";
  if (s === "bool") return "boolean";
  if (typeof s === "string" && s.startsWith("@")) return pascal(s.slice(1)) + "Data";
  if (Array.isArray(s)) return `Array<${tsType(s[0]!)}>`;
  return `{ ${Object.entries(s).map(([k, v]) => `${k}: ${tsType(v)};`).join(" ")} }`;
}

// ---- run ----
const files = new Map<string, string>();
const goModels: string[] = [];
const tsTypes: string[] = [];
const catalog: any[] = [];
const ids = new Set(blocks.map((b) => b.id));
for (const b of blocks) {
  if (!/^[a-z][a-z0-9-]*$/.test(b.id)) throw new Error(`bad id ${b.id}`);
  const name = pascal(b.id);
  goType(b.schema, `${name}Data`, goModels);
  tsTypes.push(`export type ${name}Data = ${tsType(b.schema)};`);
  const ctx: Ctx = { goImports: new Set(), svImports: new Set(), uses: new Set(), icons: false };
  const sc: Scope = { root: b.schema, vars: new Map(), block: b };
  const body = emit(b.root, sc, ctx, 1, true);
  for (const u of ctx.uses) if (!ids.has(u)) throw new Error(`[${b.id}] uses unknown block ${u}`);
  const goImp = [...ctx.goImports].sort().map((d) => `\t${goPkg.get(d) !== d ? goPkg.get(d) + " " : ""}"github.com/ui8kit/saas-design/packages/ui/templ/ui/${d}"`);
  if (ctx.icons) goImp.push(`\ticons "github.com/ui8kit/saas-design/packages/icons/templ"`);
  files.set(`templ/blocks/${b.id}.templ`, `// Code generated by packages/blocks/scripts/generate.ts from defs/${b.id}.ts. DO NOT EDIT.\n\npackage blocks\n\nimport (\n${goImp.join("\n")}\n)\n\n// ${name}: ${b.description}\ntempl ${name}(p ${name}Data) {\n${body.go}}\n`);
  const svImp = [`  import { ${[...ctx.svImports].sort().join(", ")} } from "@saas-design/ui";`];
  if (ctx.icons) svImp.push(`  import { svg } from "@saas-design/icons";`);
  for (const u of [...ctx.uses].sort()) svImp.push(`  import ${pascal(u)} from "./${pascal(u)}.svelte";`);
  svImp.push(`  import type { ${name}Data } from "./types";`);
  files.set(`svelte/${name}.svelte`, `<!-- Code generated by packages/blocks/scripts/generate.ts from defs/${b.id}.ts. DO NOT EDIT. -->\n<!-- ${b.description} -->\n<script lang="ts">\n${svImp.join("\n")}\n\n  let { data }: { data: ${name}Data } = $props();\n</script>\n\n${body.sv.replace(/^ {2}/gm, "")}`);
  if (b.extraCss) {
    for (const sel of b.extraCss.matchAll(/(^|\}|,)\s*([^{}@,]+)\s*(?=[{,])/g)) if (!sel[2]!.trim().startsWith(`.ui-${b.id}`)) throw new Error(`[${b.id}] extraCss selector must start with .ui-${b.id}: ${sel[2]}`);
  }
  catalog.push({ id: b.id, name, title: b.title, category: b.category, description: b.description, figma: b.figma ?? null, classes: [...cssRules.entries()].filter(([, v]) => v.block === b.id).map(([k]) => k) });
}
files.set("templ/blocks/models.go", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\npackage blocks\n\n${goModels.join("\n\n")}\n`);
files.set("templ/blocks/registry.go", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\npackage blocks\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\n\t"github.com/a-h/templ"\n)\n\n// IDs lists every block id in catalog order.\nvar IDs = []string{${blocks.map((b) => goStr(b.id)).join(", ")}}\n\n// Render decodes raw view data for block id and returns its component.\nfunc Render(id string, raw json.RawMessage) (templ.Component, error) {\n\tswitch id {\n${blocks.map((b) => `\tcase ${goStr(b.id)}:\n\t\tvar d ${pascal(b.id)}Data\n\t\tif err := json.Unmarshal(raw, &d); err != nil {\n\t\t\treturn nil, fmt.Errorf("%s: %w", id, err)\n\t\t}\n\t\treturn ${pascal(b.id)}(d), nil`).join("\n")}\n\t}\n\treturn nil, fmt.Errorf("unknown block %q", id)\n}\n`);
files.set("svelte/types.ts", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\n${tsTypes.join("\n")}\n`);
files.set("svelte/index.ts", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\nimport type { Component } from "svelte";\n${blocks.map((b) => `import ${pascal(b.id)} from "./${pascal(b.id)}.svelte";`).join("\n")}\n\nexport * from "./types";\nexport { ${blocks.map((b) => pascal(b.id)).join(", ")} };\n\n// eslint-disable-next-line @typescript-eslint/no-explicit-any\nexport const registry: Record<string, Component<{ data: any }>> = {\n${blocks.map((b) => `  ${goStr(b.id)}: ${pascal(b.id)},`).join("\n")}\n};\n`);
files.set("catalog.json", JSON.stringify(catalog, null, 2) + "\n");
const css = [`/* Generated by packages/blocks/scripts/generate.ts from packages/blocks/defs. Do not edit. */`, `/* Block classes: utilities only inside @apply, shadcn tokens only. */`, `@layer components {`];
for (const b of blocks) {
  css.push(`  /* ${b.id} */`);
  for (const [cls, r] of cssRules) if (r.block === b.id && r.css) css.push(`  .${cls} { @apply ${r.css}; }`);
  if (b.extraCss) css.push(...b.extraCss.trim().split("\n").map((l) => "  " + l.trim()));
}
css.push("}");
files.set("../adapter/src/blocks.generated.css", css.join("\n") + "\n");
// classes registry for ui8px patterns (markup classes, incl. ones without own CSS)
files.set("classes.json", JSON.stringify(Object.fromEntries([...cssRules].map(([k, v]) => [k, v.css ? v.css.split(" ") : []])), null, 2) + "\n");

let drift = 0;
for (const [rel, body] of files) {
  const p = join(PKG, rel);
  if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== body) { console.error(`drift: ${rel}`); drift++; } continue; }
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
}
if (!CHECK) {
  for (const f of readdirSync(join(PKG, "svelte"))) if (f.endsWith(".svelte") && !files.has(`svelte/${f}`)) rmSync(join(PKG, "svelte", f));
  for (const f of readdirSync(join(PKG, "templ/blocks"))) if (f.endsWith(".templ") && !files.has(`templ/blocks/${f}`)) { rmSync(join(PKG, "templ/blocks", f)); rmSync(join(PKG, "templ/blocks", f.replace(".templ", "_templ.go")), { force: true }); }
  execFileSync("gofmt", ["-w", "blocks/models.go", "blocks/registry.go"], { cwd: join(PKG, "templ") });
  execFileSync("go", ["run", "github.com/a-h/templ/cmd/templ@v0.3.1001", "generate", "-path", "blocks"], { cwd: join(PKG, "templ"), stdio: "inherit" });
}
console.log(`blocks: ${blocks.length} blocks, ${cssRules.size} semantic classes; ${files.size} files ${CHECK ? "checked" : "written"}`);
if (drift) process.exit(1);
