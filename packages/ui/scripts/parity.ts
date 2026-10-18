/**
 * Primitive parity on @ui8kit/codegen 2.0: for every brick part, its defaults and each enum value / boolean prop
 * (the case set of xgen-check, xgen/check/src/templ/bricks.ts, plus every recipe value of every CVA prop), the canonical renderer (@ui8kit/xgen-spec renderPart),
 * the generated Go templ part (packages/ui/templ/cmd/parity), the Svelte 5 part and the React 19 part must give the same
 * normalized DOM tree. Also asserts that generated markup carries only ui-* classes (+ the markers group / peer).
 *
 *   bun --preload ../../tools/svelte-preload.ts scripts/parity.ts   (cwd packages/ui)
 */
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { render as svelteRender } from "svelte/server";
import { createRawSnippet } from "svelte";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderPart, htmlPropName, reactPropName, type PartDef, type PropDef } from "@ui8kit/xgen-spec";
import { SvelteEmitter } from "@ui8kit/xgen-runtime-svelte";
import { readdirSync } from "node:fs";
import { normalizeHtml } from "../.xgen/xgen/check/src/templ/normalize";
import { bricks } from "./registry";

const ROOT = resolve(import.meta.dir, "../../..");
const TEMPL = join(ROOT, "packages/ui/templ");
const SVELTE = join(ROOT, "packages/ui/svelte/src");
const REACT = join(ROOT, "packages/ui/react/src");
const CHILD = "Content";
const settable = (p: PropDef) => !p.passthrough && p.type !== "children" && p.type !== "items" && p.type !== "attrs" && p.name !== "Class";

type Case = { brick: any; part: PartDef; id: string; props: Record<string, unknown>; children: string; canonical: string };
const cases: Case[] = [];
for (const brick of bricks as any[]) for (const part of brick.parts as PartDef[]) {
  const children = part.props.some((p) => p.type === "children") ? CHILD : "";
  const add = (id: string, props: Record<string, unknown>) => cases.push({ brick, part, id, props, children, canonical: renderPart(brick, part.name, props, { children: children || undefined }) });
  add("defaults", {});
  for (const p of part.props.filter(settable)) {
    const rid = (part as any).classes?.recipeId ?? (part as any).recipeId;
    const recipe = p.cva ? (rid ? brick.recipes[rid] : Object.values(brick.recipes as Record<string, any>).find((r) => r.byKey?.[p.cvaKey ?? p.name.toLowerCase()])) : undefined;
    const values = recipe ? Object.keys(recipe.byKey[p.cvaKey ?? p.name.toLowerCase()]) : undefined;
    if (values?.length) for (const v of values) add(`${p.name}=${v}`, { [p.name]: v });
    else if (p.enumValues?.length) for (const v of p.enumValues) add(`${p.name}=${v}`, { [p.name]: p.type === "int" ? Number(v) : v });
    else if (p.type === "bool") add(p.name, { [p.name]: true });
  }
}

const templOut = JSON.parse(execFileSync("go", ["run", "./cmd/parity"], {
  cwd: TEMPL, encoding: "utf8", maxBuffer: 64 << 20,
  input: JSON.stringify(cases.map((c) => ({ name: `${c.brick.dir}/${c.brick.file ?? c.brick.dir}/${c.part.name}`, props: c.props, children: c.children }))),
})) as string[];

const rename = (part: PartDef, props: Record<string, unknown>, name: (p: PropDef) => string, cls: string) =>
  Object.fromEntries(Object.entries(props).map(([k, v]) => { const d = part.props.find((p) => p.name === k)!; return [k === "Class" ? cls : name(d), v]; }));
// the file of a part, as the emitters name it (Svelte: one file per part, in part order; React: the .tsx files of the brick dir)
const svelteFiles = new Map(bricks.map((b: any) => [b.id, new SvelteEmitter().emit(b).map((f) => f.path)]));
const svelteMod = async (c: Case) => (await import(pathToFileURL(join(SVELTE, svelteFiles.get(c.brick.id)![c.brick.parts.indexOf(c.part)]!)).href)).default;
const reactMod = async (c: Case) => {
  for (const f of readdirSync(join(REACT, "primitives", c.brick.dir)).filter((f) => f.endsWith(".tsx")).sort()) {
    const mod = await import(pathToFileURL(join(REACT, "primitives", c.brick.dir, f)).href);
    if (mod[c.part.name]) return mod[c.part.name];
  }
};

console.error = ((orig) => (...a: unknown[]) => { if (!/without an `onChange` handler|Invalid DOM property|instead of setting `selected` on <option>/.test(String(a[0]))) orig(...a); })(console.error); // React SSR dev warnings of the static parity cases and of the upstream LucideIcon asset (.project/backlog/codegen2-react-svg-attrs.md)
const stats = { templ: 0, svelte: 0, react: 0 };
let nonSemantic = 0;
const failures: string[] = [];
const MARKER = /^(group|peer)(\/.*)?$/;
for (let i = 0; i < cases.length; i++) {
  const c = cases[i]!;
  const label = `${c.brick.id} ${c.part.name} · ${c.id}`;
  const want = normalizeHtml(c.canonical);
  const sp: any = rename(c.part, c.props, htmlPropName, "class");
  if (c.children) sp.children = createRawSnippet(() => ({ render: () => `<span>${CHILD}</span>` }));
  // Svelte SSR adds onload/onerror="this.__e=event" to an <img> with spread attributes (event replay on hydration): not part of the markup contract
  const svelte = svelteRender(await svelteMod(c), { props: sp }).body.replace(/ on(load|error)="this\.__e=event"/g, "");
  const rp: any = rename(c.part, c.props, reactPropName, "className");
  const Comp = await reactMod(c);
  if (!Comp) throw new Error(`react: no export ${c.part.name} for ${label}`);
  const react = renderToStaticMarkup(createElement(Comp, rp, c.children ? createElement("span", null, CHILD) : undefined));
  const wantKids = c.children ? normalizeHtml(c.canonical.replace(CHILD, `<span>${CHILD}</span>`)) : want;
  const cmp = (rt: "templ" | "svelte" | "react", got: string, exp: string) => {
    if (normalizeHtml(got) === exp) return;
    stats[rt]++; failures.push(`${rt} != canonical: ${label}`);
    if (process.env.PARITY_DEBUG) failures.push(`  canonical: ${exp}\n  ${rt}: ${normalizeHtml(got)}`);
  };
  if (c.brick.id === "ui.lucide-icon") {
    // a runtime asset (glyphs from the registry): the canonical renderer draws the frame only, so templ is the reference
    const ref = normalizeHtml(templOut[i]!);
    if (!ref.startsWith('<svg') || !ref.includes('class="ui-lucide-icon"') || !ref.includes("<circle")) { stats.templ++; failures.push(`templ: unexpected LucideIcon ${ref}`); }
    cmp("svelte", svelte, ref);
    cmp("react", react, ref);
  } else {
    cmp("templ", templOut[i]!, want);
    cmp("svelte", svelte, wantKids);
    cmp("react", react, wantKids);
  }
  for (const m of c.canonical.matchAll(/class="([^"]*)"/g)) for (const t of m[1]!.split(/\s+/).filter(Boolean)) if (!t.startsWith("ui-") && !MARKER.test(t)) { nonSemantic++; failures.push(`non-semantic class "${t}" in ${label}`); }
}
for (const f of failures.slice(0, Number(process.env.PARITY_MAX ?? 40))) console.error(f);
const fail = stats.templ + stats.svelte + stats.react;
console.log(`parity(ui): ${cases.length} cases; templ ${cases.length - stats.templ}/${cases.length}, svelte ${cases.length - stats.svelte}/${cases.length}, react ${cases.length - stats.react}/${cases.length}; ${nonSemantic} non-ui-* classes`);
if (fail || nonSemantic) process.exit(1);
