/**
 * Writes packages/ui/showcase.json for the design apps (apps/design-svelte, apps/design-react): per brick part its docs,
 * props and preview cases (defaults, every recipe value, the `examples` of the codegen 2.0 spec), with the props
 * under their Svelte names (htmlPropName) and their React names (reactPropName).
 * Caller utility classes (Class props) are dropped: the design apps render only adapter ui-* classes.
 *   bun scripts/showcase.ts [--check]     (cwd packages/ui; part of `bun run check` through generate.ts --check)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { SvelteEmitter } from "@ui8kit/xgen-runtime-svelte";
import { bricks, showcaseCases, htmlPropName, reactPropName, type PropDef } from "./registry";

const PKG = resolve(import.meta.dir, "..");
const CHECK = process.argv.includes("--check");

// Layout/text building blocks are "primitives"; interactive or composite bricks are "components".
const PRIMITIVES = new Set(["block", "box", "container", "grid", "group", "stack", "inline", "text", "title", "linebreak", "list", "separator", "image", "icon", "lucide-icon", "link", "label"]);
const LABELS: Record<string, string> = { AriaLabel: "Example", Name: "demo", Href: "#", Src: "/media/avatar-sarah.jpg", Alt: "Avatar" };
const svelteFiles = (b: any) => new SvelteEmitter().emit(b).map((f) => f.path.replace(/^primitives\//, "").replace(/\.svelte$/, ""));

const out = [];
for (const b of bricks as any[]) {
  const parts = [];
  const files = svelteFiles(b);
  b.parts.forEach((part: any, index: number) => {
    const defs: PropDef[] = part.props;
    const seen = new Set<string>();
    const cases: Array<{ id: string; props: Record<string, unknown>; react: Record<string, unknown> }> = [];
    const add = (id: string, canonical: Record<string, unknown>) => {
      const c = Object.entries(canonical ?? {}).filter(([k]) => k !== "Class" && defs.some((d) => d.name === k && d.type !== "children" && d.type !== "attrs"));
      // example URLs from upstream point nowhere in this app: links -> "#", images -> a fixture avatar
      // nested example records use Go field names (Label, Value); the Svelte and React item types are camelCase (label, value)
      const js = (v: unknown): unknown => Array.isArray(v) ? v.map(js) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k === "ID" ? "id" : k[0]!.toLowerCase() + k.slice(1), js(x)])) : v;
      const val = (k: string, v: unknown) => (typeof v === "string" && v.startsWith("/") ? (/^(Src|SrcSet)$/.test(k) ? "/media/avatar-sarah.jpg" : "#") : js(v));
      const props = Object.fromEntries(c.map(([k, v]) => [htmlPropName(defs.find((d) => d.name === k)!), val(k, v)]));
      const react = Object.fromEntries(c.map(([k, v]) => [reactPropName(defs.find((d) => d.name === k)!), val(k, v)]));
      const key = JSON.stringify(props);
      if (seen.has(key) || seen.has(id)) return;
      seen.add(key); seen.add(id);
      cases.push({ id, props, react });
    };
    add("defaults", Object.fromEntries(defs.filter((p) => LABELS[p.name] && (p.name !== "Href" || part.name === "Link")).map((p) => [p.name, LABELS[p.name]])));
    const rid = part.classes?.recipeId ?? part.recipeId;
    const recipe = rid ? b.recipes[rid] : undefined;
    for (const [key, values] of Object.entries((recipe?.byKey ?? {}) as Record<string, Record<string, string>>)) {
      const prop = defs.find((p) => p.cva && (p.cvaKey ?? p.name.toLowerCase()) === key) ?? defs.find((p) => p.name.toLowerCase() === key);
      if (prop) for (const v of Object.keys(values)) add(`${key}.${v}`, { ...(key === "layout" && v === "icon" ? { AriaLabel: "Example" } : {}), [prop.name]: v });
    }
    const children = defs.some((p) => p.type === "children");
    const meta = { name: part.name, file: files[index], docs: part.docs ?? "", children, props: defs.map((p) => ({ name: p.name, type: p.type, docs: p.docs ?? "" })) };
    // a rendered Sheet is a fixed full-screen dialog (and needs a unique id): the docs page shows its triggers only
    if (b.dir === "sheet" && part.name === "Sheet") { parts.push({ ...meta, cases: [] }); return; }
    // LucideIcon needs a glyph name: show a few of the registry
    if (b.id === "ui.lucide-icon") { for (const n of ["check", "arrow-right", "star", "bell"]) cases.push({ id: n, props: { name: n, size: 24 }, react: { name: n, size: 24 } }); parts.push({ ...meta, cases }); return; }
    for (const c of showcaseCases(b)) if (!c.part || c.part === part.name) add(c.id, c.props);
    parts.push({ ...meta, cases });
  });
  out.push({ id: b.id, dir: b.dir, kind: PRIMITIVES.has(b.dir) ? "primitive" : "component", docs: b.docs ?? "", parts });
}
const body = JSON.stringify(out, null, 2) + "\n";
const p = join(PKG, "showcase.json");
if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== body) { console.error("drift: packages/ui/showcase.json (run: bun run --cwd packages/ui generate)"); process.exit(1); } }
else writeFileSync(p, body);
const n = out.reduce((a, b) => a + b.parts.reduce((x: number, p: any) => x + p.cases.length, 0), 0);
console.log(`showcase: ${out.length} bricks, ${n} cases ${CHECK ? "checked" : "written"}`);
