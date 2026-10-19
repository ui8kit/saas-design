/**
 * Emits every block in defs/ for the three runtimes:
 *   templ/blocks/<id>.templ, templ/blocks/models.go, templ/blocks/registry.go
 *   svelte/<Name>.svelte, svelte/types.ts, svelte/index.ts
 *   react/<Name>.tsx, react/types.ts, react/index.ts
 *   ../adapter/src/blocks.generated.css
 *   catalog.json (id, title, category, figma, parts)
 *   bun scripts/generate.ts [--check]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { isExpr, type BlockDef, type Child, type Expr, type Node, type Schema, type Val } from "./dsl";
import { blocks } from "../defs";
import { applyRules } from "../../../tools/css-apply";
import { kits } from "./kits";
import { bricks as uiBricks, reactPropName, type PropDef } from "../../ui/scripts/registry";
const usedKits = new Set<string>();

const PKG = resolve(import.meta.dir, "..");
const ROOT = resolve(PKG, "../..");
const UI_TEMPL = join(ROOT, "packages/ui/templ/ui");
const UI_SVELTE_INDEX = join(ROOT, "packages/ui/svelte/src/index.ts");
const CHECK = process.argv.includes("--check");

// ---- primitive registry (read from generated packages/ui) ----
type Field = { name: string; type: string };
const compDir = new Map<string, string>();
for (const m of readFileSync(UI_SVELTE_INDEX, "utf8").matchAll(/export \{ default as (\w+) \} from "\.\/primitives\/([\w-]+)\/[\w-]+\.svelte"/g)) compDir.set(m[1]!, m[2]!);
// canonical prop defs of every part (React prop names come from them: reactPropName)
const API_PROPS = new Set(["tag", "as", "variant", "size", "layout", "tone", "align", "justify", "gap", "weight", "aschild"]);
const partProps = new Map<string, PropDef[]>(uiBricks.flatMap((b: any) => b.parts.map((p: any) => [p.name, p.props as PropDef[]] as const)));
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
  const kitCls = st.kit ? (() => { if (!(st.kit in kits)) throw new Error(`[${sc.block.id}] unknown kit ${st.kit}`); usedKits.add(st.kit); return `ui-${st.kit}`; })() : null;
  if (!isRoot && !st.ui && !st.css && !st.variants) return kitCls ? { goExpr: goStr(kitCls), svAttr: kitCls, dataClass: kitCls } : { goExpr: null, svAttr: null, dataClass: null };
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
  let goExpr = goStr(kitCls ? `${kitCls} ${base}` : base), sv = kitCls ? `${kitCls} ${base}` : base;
  for (const [key, choices] of Object.entries((st.variants ?? {}) as Record<string, Record<string, string>>)) {
    for (const [v, css] of Object.entries(choices)) addCss(`${base}-${key}-${v}`, css, sc.block.id);
    const ex = st.vary?.[key];
    if (!ex) throw new Error(`[${sc.block.id}] variant ${key} on ${base} has no vary expr`);
    const r = resolveExpr(ex, sc);
    goExpr += ` + " ${base}-${key}-" + ${r.go}`;
    sv += ` ${base}-${key}-{${r.sv}}`;
  }
  return { goExpr, svAttr: sv, dataClass: base };
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
type Ctx = { goImports: Set<string>; svImports: Set<string>; uses: Set<string>; icons: boolean; fragment: boolean };
type Out = { go: string; sv: string; rx: string };
const ind = (d: number) => "\t".repeat(d);
const sind = (d: number) => "  ".repeat(d);
/** JSX attribute name of an HTML attribute */
const ELEMENT_ATTRS = new Set(["dateTime", "colSpan", "rowSpan", "encType", "noValidate", "maxLength", "readOnly"]);
const JSX_ATTR: Record<string, string> = { class: "className", for: "htmlFor", tabindex: "tabIndex", autocomplete: "autoComplete", datetime: "dateTime", readonly: "readOnly", maxlength: "maxLength", colspan: "colSpan", rowspan: "rowSpan", enctype: "encType", novalidate: "noValidate" };
const jsxAttr = (k: string) => JSX_ATTR[k] ?? k;
/** a Svelte attribute value with {expr} interpolations -> a JSX attribute value */
const rxInterp = (v: string) => (v.includes("{") ? "{`" + v.replace(/\{/g, "${") + "`}" : JSON.stringify(v));
let eachDepth = 0;

function emit(n: Child, sc: Scope, ctx: Ctx, d: number, isRoot = false): Out {
  if (typeof n === "string") return { go: `${ind(d)}{ ${goStr(n)} }\n`, sv: `${sind(d)}{${svStr(n)}}\n`, rx: `${sind(d)}{${svStr(n)}}\n` };
  if (isExpr(n)) { const r = resolveExpr(n, sc); if (r.type !== "string") throw new Error(`[${sc.block.id}] text binding ${n.$} is not a string`); return { go: `${ind(d)}{ ${r.go} }\n`, sv: `${sind(d)}{${r.sv}}\n`, rx: `${sind(d)}{${r.sv}}\n` }; }
  const kids = (children: Child[], s: Scope) => children.map((ch) => emit(ch, s, ctx, d + 1));
  const join3 = (xs: Out[]): Out => ({ go: xs.map((x) => x.go).join(""), sv: xs.map((x) => x.sv).join(""), rx: xs.map((x) => x.rx).join("") });
  switch (n.k) {
    case "each": {
      const r = resolveExpr(n.of, sc);
      if (!Array.isArray(r.type)) throw new Error(`[${sc.block.id}] each over non-array ${n.of.$}`);
      const vars = new Map(sc.vars); vars.set(n.as, r.type[0]!);
      const key = `i${eachDepth++ || ""}`;
      const inner = join3(n.children.map((ch) => emit(ch, { ...sc, vars }, ctx, d + 1)));
      eachDepth--;
      ctx.fragment = true;
      return {
        go: `${ind(d)}for _, ${n.as} := range ${r.go} {\n${inner.go}${ind(d)}}\n`,
        sv: `${sind(d)}{#each ${r.sv} as ${n.as}}\n${inner.sv}${sind(d)}{/each}\n`,
        rx: `${sind(d)}{${r.sv}.map((${n.as}, ${key}) => (\n${sind(d + 1)}<Fragment key={${key}}>\n${inner.rx}${sind(d + 1)}</Fragment>\n${sind(d)}))}\n`,
      };
    }
    case "if": {
      const c = goCond(n, sc);
      const inner = join3(kids(n.children, sc));
      return { go: `${ind(d)}if ${c.go} {\n${inner.go}${ind(d)}}\n`, sv: `${sind(d)}{#if ${c.sv}}\n${inner.sv}${sind(d)}{/if}\n`, rx: `${sind(d)}{${c.sv} ? (\n${sind(d + 1)}<>\n${inner.rx}${sind(d + 1)}</>\n${sind(d)}) : null}\n` };
    }
    case "icon": {
      ctx.icons = true;
      const cls = classFor(n as any, sc, false);
      const name = typeof n.name === "string" ? { go: goStr(n.name), sv: svStr(n.name) } : (() => { const r = resolveExpr(n.name, sc); return { go: r.go, sv: r.sv }; })();
      const goC = cls.goExpr ?? '""', svC = cls.svAttr ? "`" + cls.svAttr.replace(/\{/g, "${") + "`" : '""';
      return { go: `${ind(d)}@icons.Icon(${name.go}, ${goC})\n`, sv: `${sind(d)}<Icon name={${name.sv}} class={${svC}} />\n`, rx: `${sind(d)}<Icon name={${name.sv}} className={${svC}} />\n` };
    }
    case "use": {
      ctx.uses.add(n.block);
      const r = resolveExpr(n.data, sc);
      return { go: `${ind(d)}@${pascal(n.block)}(${r.go})\n`, sv: `${sind(d)}<${pascal(n.block)} data={${r.sv}} />\n`, rx: `${sind(d)}<${pascal(n.block)} data={${r.sv}} />\n` };
    }
    case "h": {
      const cls = classFor(n, sc, isRoot);
      let goA = "", svA = "", rxA = "";
      if (cls.goExpr) {
        goA += cls.goExpr.startsWith('"') && !cls.goExpr.includes("+") ? ` class=${cls.goExpr}` : ` class={ ${cls.goExpr} }`;
        svA += ` class="${cls.svAttr}"`; rxA += ` className=${rxInterp(cls.svAttr!)}`;
        goA += ` data-class="${cls.dataClass}"`; svA += ` data-class="${cls.dataClass}"`; rxA += ` data-class="${cls.dataClass}"`;
      }
      for (const [k, v] of Object.entries(n.props)) {
        if (isExpr(v)) { const r = resolveExpr(v, sc); goA += r.type === "bool" ? ` ${k}?={ ${r.go} }` : ` ${k}={ ${r.go} }`; svA += ` ${k}={${r.sv}}`; rxA += ` ${jsxAttr(k)}={${r.sv}}`; }
        else if (typeof v === "boolean") { if (v) { goA += ` ${k}`; svA += ` ${k}`; rxA += ` ${jsxAttr(k)}`; } }
        else { goA += ` ${k}=${goStr(v)}`; svA += ` ${k}=${svStr(v)}`; rxA += ` ${jsxAttr(k)}={${svStr(v)}}`; }
      }
      const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source"]);
      if (VOID.has(n.tag)) return { go: `${ind(d)}<${n.tag}${goA}/>\n`, sv: `${sind(d)}<${n.tag}${svA} />\n`, rx: `${sind(d)}<${n.tag}${rxA} />\n` };
      const inner = join3(kids(n.children, sc));
      return { go: `${ind(d)}<${n.tag}${goA}>\n${inner.go}${ind(d)}</${n.tag}>\n`, sv: `${sind(d)}<${n.tag}${svA}>\n${inner.sv}${sind(d)}</${n.tag}>\n`, rx: `${sind(d)}<${n.tag}${rxA}>\n${inner.rx}${sind(d)}</${n.tag}>\n` };
    }
    case "c": {
      const dir = compDir.get(n.comp);
      const fields = goFields.get(n.comp);
      const defs = partProps.get(n.comp);
      if (!dir || !fields || !defs) throw new Error(`[${sc.block.id}] unknown primitive ${n.comp}`);
      ctx.goImports.add(dir); ctx.svImports.add(n.comp);
      const cls = classFor(n, sc, isRoot);
      const goProps: string[] = []; const attrs: string[] = []; const svProps: string[] = []; const rxProps: string[] = [];
      if (cls.goExpr) {
        goProps.push(`Class: ${cls.goExpr}`); attrs.push(`"data-class": ${goStr(cls.dataClass!)}`);
        svProps.push(`class="${cls.svAttr}"`, `data-class="${cls.dataClass}"`); rxProps.push(`className=${rxInterp(cls.svAttr!)}`, `data-class="${cls.dataClass}"`);
      }
      for (const [k, v] of Object.entries(n.props)) {
        const norm = k === "for" ? "htmlfor" : k.replace(/-/g, "").toLowerCase();
        const f = fields.find((x) => x.name.toLowerCase() === norm && x.name !== "Attrs" && x.name !== "Class");
        const def = f ? defs.find((p) => p.name === f.name) : undefined;
        // a primitive-API prop (retag, recipe axis) the part does not declare would leak as a bogus HTML attribute in every runtime
        if (!f && API_PROPS.has(norm)) throw new Error(`[${sc.block.id}] ${n.comp} has no prop "${k}" (codegen 2.0 parts: ${defs.map((p) => p.name).join(", ")})`);
        if (f) goProps.push(`${f.name}: ${goVal(v, sc, f.type)}`);
        else attrs.push(`${goStr(k)}: ${goVal(v, sc)}`);
        const rk = def ? reactPropName(def) : jsxAttr(k);
        // heading levels and ints are numeric in every runtime (Go uiutils.HeadingLevel / int, Svelte and React numbers)
        if (f?.type.endsWith("HeadingLevel") && typeof v === "string") { svProps.push(`${k}={${goVal(v, sc, f.type)}}`); rxProps.push(`${rk}={${goVal(v, sc, f.type)}}`); }
        else if (f?.type === "int" && typeof v === "string") { svProps.push(svAttr(k, v, sc)); rxProps.push(`${rk}={${goVal(v, sc, "int")}}`); }
        // Go omits empty string fields (uiutils.IsSetStr); mirror that in Svelte and React
        else if (f?.type === "string" && isExpr(v)) { const e = resolveExpr(v, sc).sv; svProps.push(`${k}={${e} || undefined}`); rxProps.push(`${rk}={${e} || undefined}`); }
        // an element-specific attribute (datetime on Text tag="time") is not in the generic HTMLAttributes of a React part:
        // pass it as a spread (same DOM attribute), so the types stay the part's own
        else if (!f && ELEMENT_ATTRS.has(rk)) { svProps.push(svAttr(k, v, sc)); rxProps.push(`{...{ ${rk}: ${isExpr(v) ? resolveExpr(v, sc).sv : svStr(String(v))} }}`); }
        else {
          svProps.push(svAttr(k, v, sc));
          rxProps.push(isExpr(v) ? `${rk}={${resolveExpr(v, sc).sv}}` : typeof v === "boolean" ? `${rk}={${v}}` : `${rk}={${svStr(v)}}`);
        }
      }
      if (attrs.length) goProps.push(`Attrs: templ.Attributes{${attrs.join(", ")}}`);
      const pkg = goPkg.get(dir)!;
      const call = `${pkg}.${n.comp}(${pkg}.${n.comp}Props{${goProps.join(", ")}})`;
      const svOpen = `<${n.comp}${svProps.length ? " " + svProps.join(" ") : ""}`;
      const rxOpen = `<${n.comp}${rxProps.length ? " " + rxProps.join(" ") : ""}`;
      if (!n.children.length) return { go: `${ind(d)}@${call}\n`, sv: `${sind(d)}${svOpen} />\n`, rx: `${sind(d)}${rxOpen} />\n` };
      const inner = join3(kids(n.children, sc));
      return { go: `${ind(d)}@${call} {\n${inner.go}${ind(d)}}\n`, sv: `${sind(d)}${svOpen}>\n${inner.sv}${sind(d)}</${n.comp}>\n`, rx: `${sind(d)}${rxOpen}>\n${inner.rx}${sind(d)}</${n.comp}>\n` };
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
  const ctx: Ctx = { goImports: new Set(), svImports: new Set(), uses: new Set(), icons: false, fragment: false };
  const sc: Scope = { root: b.schema, vars: new Map(), block: b };
  const body = emit(b.root, sc, ctx, 1, true);
  for (const u of ctx.uses) if (!ids.has(u)) throw new Error(`[${b.id}] uses unknown block ${u}`);
  const goImp = [...ctx.goImports].sort().map((d) => `\t${goPkg.get(d) !== d ? goPkg.get(d) + " " : ""}"github.com/ui8kit/saas-design/packages/ui/templ/ui/${d}"`);
  if (ctx.icons) goImp.push(`\ticons "github.com/ui8kit/saas-design/packages/icons/templ"`);
  files.set(`templ/blocks/${b.id}.templ`, `// Code generated by packages/blocks/scripts/generate.ts from defs/${b.id}.ts. DO NOT EDIT.\n\npackage blocks\n\nimport (\n${goImp.join("\n")}\n)\n\n// ${name}: ${b.description}\ntempl ${name}(p ${name}Data) {\n${body.go}}\n`);
  const svImp = [`  import { ${[...ctx.svImports].sort().join(", ")} } from "@saas-design/ui";`];
  if (ctx.icons) svImp.push(`  import Icon from "@saas-design/icons/svelte";`);
  for (const u of [...ctx.uses].sort()) svImp.push(`  import ${pascal(u)} from "./${pascal(u)}.svelte";`);
  svImp.push(`  import type { ${name}Data } from "./types";`);
  const rxImp = [`import { ${[...ctx.svImports].sort().join(", ")} } from "@saas-design/ui/react";`];
  if (ctx.fragment) rxImp.unshift(`import { Fragment } from "react";`);
  if (ctx.icons) rxImp.push(`import { Icon } from "@saas-design/icons/react";`);
  for (const u of [...ctx.uses].sort()) rxImp.push(`import { ${pascal(u)} } from "./${pascal(u)}";`);
  rxImp.push(`import type { ${name}Data } from "./types";`);
  files.set(`react/${name}.tsx`, `// Code generated by packages/blocks/scripts/generate.ts from defs/${b.id}.ts. DO NOT EDIT.\n// ${b.description}\n${rxImp.join("\n")}\n\nexport function ${name}({ data }: { data: ${name}Data }) {\n  return (\n${body.rx.replace(/^/gm, "  ").replace(/^ +$/gm, "")}  );\n}\n`);
  files.set(`svelte/${name}.svelte`, `<!-- Code generated by packages/blocks/scripts/generate.ts from defs/${b.id}.ts. DO NOT EDIT. -->\n<!-- ${b.description} -->\n<script lang="ts">\n${svImp.join("\n")}\n\n  let { data }: { data: ${name}Data } = $props();\n</script>\n\n${body.sv.replace(/^ {2}/gm, "")}`);
  if (b.extraCss) {
    for (const sel of b.extraCss.replace(/\{[^{}]*\}/g, "{}").matchAll(/(^|\}|,)\s*([^{}@,]+)\s*(?=[{,])/g)) if (!sel[2]!.trim().startsWith(`.ui-${b.id}`)) throw new Error(`[${b.id}] extraCss selector must start with .ui-${b.id}: ${sel[2]}`);
  }
  catalog.push({ id: b.id, name, title: b.title, category: b.category, description: b.description, figma: b.figma ?? null, classes: [...cssRules.entries()].filter(([, v]) => v.block === b.id).map(([k]) => k) });
}
files.set("templ/blocks/models.go", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\npackage blocks\n\n${goModels.join("\n\n")}\n`);
files.set("templ/blocks/registry.go", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\npackage blocks\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\n\t"github.com/a-h/templ"\n)\n\n// IDs lists every block id in catalog order.\nvar IDs = []string{${blocks.map((b) => goStr(b.id)).join(", ")}}\n\n// Render decodes raw view data for block id and returns its component.\nfunc Render(id string, raw json.RawMessage) (templ.Component, error) {\n\tswitch id {\n${blocks.map((b) => `\tcase ${goStr(b.id)}:\n\t\tvar d ${pascal(b.id)}Data\n\t\tif err := json.Unmarshal(raw, &d); err != nil {\n\t\t\treturn nil, fmt.Errorf("%s: %w", id, err)\n\t\t}\n\t\treturn ${pascal(b.id)}(d), nil`).join("\n")}\n\t}\n\treturn nil, fmt.Errorf("unknown block %q", id)\n}\n`);
files.set("svelte/types.ts", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\n${tsTypes.join("\n")}\n`);
files.set("svelte/index.ts", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\nimport type { Component } from "svelte";\n${blocks.map((b) => `import ${pascal(b.id)} from "./${pascal(b.id)}.svelte";`).join("\n")}\n\nexport * from "./types";\nexport { ${blocks.map((b) => pascal(b.id)).join(", ")} };\n\n// eslint-disable-next-line @typescript-eslint/no-explicit-any\nexport const registry: Record<string, Component<{ data: any }>> = {\n${blocks.map((b) => `  ${goStr(b.id)}: ${pascal(b.id)},`).join("\n")}\n};\n`);
files.set("react/types.ts", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\n\n${tsTypes.join("\n")}\n`);
files.set("react/index.ts", `// Code generated by packages/blocks/scripts/generate.ts. DO NOT EDIT.\nimport type { ComponentType } from "react";\n${blocks.map((b) => `import { ${pascal(b.id)} } from "./${pascal(b.id)}";`).join("\n")}\n\nexport * from "./types";\nexport { ${blocks.map((b) => pascal(b.id)).join(", ")} };\n\n// eslint-disable-next-line @typescript-eslint/no-explicit-any\nexport const registry: Record<string, ComponentType<{ data: any }>> = {\n${blocks.map((b) => `  ${goStr(b.id)}: ${pascal(b.id)},`).join("\n")}\n};\n`);
files.set("catalog.json", JSON.stringify(catalog, null, 2) + "\n");
const css = [`/* Generated by packages/blocks/scripts/generate.ts from packages/blocks/defs. Do not edit. */`, `/* Block classes: utilities only inside @apply, shadcn tokens only. */`, `@layer components {`];
css.push(`  /* shared kits (scripts/kits.ts) */`);
for (const k of Object.keys(kits)) if (usedKits.has(k)) css.push(...applyRules(`.ui-${k}`, kits[k]!));
for (const b of blocks) {
  css.push(`  /* ${b.id} */`);
  for (const [cls, r] of cssRules) if (r.block === b.id && r.css) css.push(...applyRules(`.${cls}`, r.css));
  if (b.extraCss) css.push(...b.extraCss.trim().split("\n").map((l) => "  " + l.trim()));
}
css.push("}");
files.set("../adapter/src/blocks.generated.css", css.join("\n") + "\n");
// classes registry for ui8px patterns (markup classes, incl. ones without own CSS)
files.set("classes.json", JSON.stringify(Object.fromEntries([...[...usedKits].map((k) => [`ui-${k}`, kits[k]!.split(" ")]), ...[...cssRules].map(([k, v]) => [k, v.css ? v.css.split(" ") : []])]), null, 2) + "\n");

let drift = 0;
for (const [rel, body] of files) {
  const p = join(PKG, rel);
  const want = CHECK && rel.endsWith(".go") ? execFileSync("gofmt", [], { input: body, encoding: "utf8" }) : body;
  if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== want) { console.error(`drift: ${rel}`); drift++; } continue; }
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
}
if (!CHECK) {
  for (const f of readdirSync(join(PKG, "svelte"))) if (f.endsWith(".svelte") && !files.has(`svelte/${f}`)) rmSync(join(PKG, "svelte", f));
  for (const f of readdirSync(join(PKG, "react"))) if (f.endsWith(".tsx") && !files.has(`react/${f}`)) rmSync(join(PKG, "react", f));
  for (const f of readdirSync(join(PKG, "templ/blocks"))) if (f.endsWith(".templ") && !files.has(`templ/blocks/${f}`)) { rmSync(join(PKG, "templ/blocks", f)); rmSync(join(PKG, "templ/blocks", f.replace(".templ", "_templ.go")), { force: true }); }
  execFileSync("gofmt", ["-w", "blocks/models.go", "blocks/registry.go"], { cwd: join(PKG, "templ") });
  execFileSync("go", ["run", "github.com/a-h/templ/cmd/templ@v0.3.1070", "generate", "-path", "blocks"], { cwd: join(PKG, "templ"), stdio: "inherit" });
}
console.log(`blocks: ${blocks.length} blocks, ${cssRules.size} semantic classes; ${files.size} files ${CHECK ? "checked" : "written"}`);
if (drift) process.exit(1);
