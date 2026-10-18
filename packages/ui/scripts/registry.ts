/**
 * @saas-design/ui brick registry on @ui8kit/codegen 2.0 (xgen).
 *
 * 1. Load the brick specs of the pinned codegen (`loadSpecs(packages/ui/.xgen/xgen)`, see tools/xgen-link.ts).
 * 2. Merge this project's recipe overrides (packages/ui/recipes/*.variants.json) over the upstream recipes: same keys,
 *    an override may change base / values / compound rows and add values to a key upstream has, never add a key.
 * 3. Rewrite EVERY class string a brick can emit (recipe base, values and compound rows, classes.staticBase, extra
 *    expressions, state classes, static class attributes, inline class specs) into a semantic `ui-*` class. The original
 *    utilities go into packages/adapter/src/primitives.generated.css as `.ui-x { @apply ...; }`.
 *    => generated markup carries only ui-* classes (+ the Tailwind marker classes `group` / `peer`); utilities live only
 *    inside @apply.
 * Emission (templ, Svelte 5, React 19) is done by scripts/generate.ts with the xgen emitters.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadSpecs, type LoadedBrick } from "@ui8kit/xgen-spec";

const PKG = resolve(import.meta.dir, "..");
export const XGEN = join(PKG, ".xgen/xgen");
export const GO_MODULE = "github.com/ui8kit/saas-design/packages/ui/templ";

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const css = new Map<string, string>(); // semantic class -> utilities
const origin = new Map<string, string>(); // semantic class -> where
/** utilities taken verbatim from the pinned codegen specs (not from packages/ui/recipes): the ui8px policy trusts upstream review for these */
export const upstreamUtilities = new Set<string>();
const MARKERS = /^(group|peer)(\/.*)?$/; // Tailwind marker classes: no styling, cannot be @applied, must stay in markup
/** returns the class string to put in markup: the semantic class plus any marker classes of the utility set */
function define(name: string, utilities: string, where: string, fromUpstream = true): string {
  const all = utilities.trim().split(/\s+/).filter(Boolean);
  if (fromUpstream) for (const t of all) if (!MARKERS.test(t)) upstreamUtilities.add(t);
  const markers = all.filter((t) => MARKERS.test(t));
  const u = all.filter((t) => !MARKERS.test(t)).join(" ");
  if (!u) return markers.join(" ");
  const prev = css.get(name);
  if (prev !== undefined && prev !== u) throw new Error(`semantic class ${name} defined twice with different utilities (${origin.get(name)} / ${where})`);
  css.set(name, u);
  origin.set(name, where);
  return [...markers, name].join(" ");
}

// ---- recipes ----------------------------------------------------------------------------------
type Recipe = { id: string; base: string; keys: string[]; defaults: Record<string, string>; byKey: Record<string, Record<string, string>>; compound?: Array<Record<string, string>> };
export const overrides = new Set<string>();
function semanticRecipe(file: string, up: Recipe): Recipe {
  const over = join(PKG, "recipes", file);
  const o: Partial<Recipe> = existsSync(over) ? JSON.parse(readFileSync(over, "utf8")) : {};
  if (existsSync(over)) overrides.add(file);
  for (const k of Object.keys(o.byKey ?? {})) if (!up.keys.includes(k)) throw new Error(`recipes/${file}: key "${k}" does not exist upstream (${up.keys.join(", ")})`);
  const stem = file.replace(".variants.json", "");
  const name = `ui-${stem}`;
  const src: Recipe = { ...up, base: o.base ?? up.base, defaults: { ...up.defaults, ...(o.defaults ?? {}) }, byKey: Object.fromEntries(up.keys.map((k) => [k, { ...up.byKey[k], ...(o.byKey?.[k] ?? {}) }])), compound: o.compound ?? up.compound ?? [] };
  const out: Recipe = { id: up.id, base: define(name, src.base, `${file}:base`, o.base === undefined), keys: up.keys, defaults: src.defaults, byKey: {}, compound: [] };
  for (const k of up.keys) {
    out.byKey[k] = {};
    for (const [v, utils] of Object.entries(src.byKey[k]!)) out.byKey[k]![v] = utils.trim() ? define(k === "variant" ? `${name}-${v}` : `${name}-${k}-${v}`, utils, `${file}:${k}.${v}`, o.byKey?.[k]?.[v] === undefined) : "";
  }
  out.compound = (src.compound ?? []).map((row, i) => {
    const { class: cls, ...when } = row as any;
    const tag = Object.entries(when).map(([k, v]) => `${k}-${String(v).replace(/\|/g, "-")}`).join("-");
    return { ...when, class: define(`${name}-x-${tag || i}`, String(cls), `${file}:compound[${i}]`, o.compound === undefined) };
  });
  return out;
}

// ---- non-recipe class positions ----------------------------------------------------------------
function rewriteString(s: string, ctx: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return s;
  if (t.split(" ").every((x) => x.startsWith("ui-") || MARKERS.test(x))) return t;
  if (/^grid-cols-\d+$/.test(t)) return define(`ui-cols-${t.slice(10)}`, t, ctx);
  const span = /^(col-span|col-start|col-end|order)-(\d+)$/.exec(t);
  if (span) return define(`ui-${span[1]!.replace("col-", "")}-${span[2]}`, t, ctx);
  if (t === "pointer-events-none opacity-50") return define("ui-disabled", t, ctx);
  // context-named class: a second, different utility set in the same context gets a numeric suffix
  const u = t.split(" ").filter((x) => !MARKERS.test(x)).join(" ");
  for (let i = 1; ; i++) {
    const name = i === 1 ? `ui-${ctx}` : `ui-${ctx}-${i}`;
    const prev = css.get(name);
    if (prev === undefined || prev === u) return define(name, t, ctx);
  }
}
function rewriteExpr(e: any, ctx: string): any {
  if (!e || typeof e !== "object") return e;
  switch (e.kind) {
    case "lit": return typeof e.value === "string" ? { ...e, value: rewriteString(e.value, ctx) } : e;
    case "mapOr": case "intMapOr":
      return { ...e, mapping: Object.fromEntries(Object.entries(e.mapping).map(([k, v]) => [k, rewriteString(String(v), `${ctx}-${k}`)])), fallback: typeof e.fallback === "string" ? rewriteString(e.fallback, `${ctx}-default`) : e.fallback };
    case "cond": return { ...e, then: rewriteExpr(e.then, ctx), else: rewriteExpr(e.else, `${ctx}-else`) };
    case "concat": return { ...e, parts: e.parts.map((p: any, i: number) => rewriteExpr(p, `${ctx}-${i + 1}`)) };
    case "defaultIfEmpty": throw new Error(`${ctx}: defaultIfEmpty in a class position is not supported`);
    default: return e; // prop, item, derived ...: caller-provided values, never rewritten
  }
}
function rewriteSpec(c: any, ctx: string): any {
  if (!c) return c;
  const out = { ...c };
  if (c.staticBase) out.staticBase = rewriteString(c.staticBase, ctx);
  if (c.extra) out.extra = c.extra.map((x: any, i: number) => rewriteExpr(x, `${ctx}-extra${i ? i + 1 : ""}`));
  if (c.state) out.state = c.state.map((s: any, i: number) => ({ ...s, classes: rewriteString(s.classes, `${ctx}-state${i ? i + 1 : ""}`) }));
  return out;
}
function rewriteNode(n: any, ctx: string, i = { n: 0 }): any {
  if (!n || typeof n !== "object") return n;
  if (Array.isArray(n)) return n.map((x) => rewriteNode(x, ctx, i));
  const out: any = { ...n };
  if (n.attrs) out.attrs = n.attrs.map((a: any) => {
    if (a.kind === "class" && a.spec) return { ...a, spec: rewriteSpec(a.spec, `${ctx}-${++i.n}`) };
    if (a.kind === "static" && a.name === "class") return { ...a, value: rewriteString(String(a.value), `${ctx}-${++i.n}`) };
    if (a.kind === "expr" && a.name === "class") return { ...a, expr: rewriteExpr(a.expr, `${ctx}-${++i.n}`) };
    return a;
  });
  for (const k of ["children", "then", "else", "body"]) if (n[k]) out[k] = rewriteNode(n[k], ctx, i);
  return out;
}

const loaded = loadSpecs(XGEN);
if (loaded.problems.length) throw new Error(`codegen specs: ${loaded.problems.join("; ")}`);
/** upstream bricks as loaded (examples = showcase / parity cases) */
export const upstream: LoadedBrick[] = loaded.bricks;
/** bricks with semantic classes; same shape as LoadedBrick.brick */
export const bricks = upstream.map(({ brick: b }) => {
  const recipes = Object.fromEntries(Object.entries(b.recipes).map(([id, r]) => [id, semanticRecipe(b.recipeFiles[id]!, r as Recipe)]));
  const parts = b.parts.map((p: any) => {
    const ctx = kebab(p.name);
    return { ...p, classes: rewriteSpec(p.classes, ctx), render: rewriteNode(p.render, `${ctx}-part`) };
  });
  return { ...b, recipes, parts } as typeof b;
});
/** Showcase cases of a brick: the `examples` of its spec ({ id, props, part? }). */
export function showcaseCases(dirOrBrick: string | { dir: string }): Array<{ id: string; part?: string; props: Record<string, unknown>; children?: string }> {
  const dir = typeof dirOrBrick === "string" ? dirOrBrick : dirOrBrick.dir;
  const lb = upstream.find((x) => x.brick.dir === dir);
  return ((lb?.spec as any)?.examples ?? []).map((e: any) => ({ id: e.id, part: e.part, props: e.props ?? {}, children: e.children }));
}
export { reactPropName, htmlPropName, type PropDef } from "@ui8kit/xgen-spec";
