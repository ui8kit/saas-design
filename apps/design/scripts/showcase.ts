/**
 * Writes src/lib/showcase.generated.json from the packages/ui brick registry (@ui8kit/codegen):
 * per brick part its docs, props and preview cases (defaults, every recipe variant value, codegen showcase cases).
 * Caller utility classes (Class props) are dropped: the docs app renders only adapter ui-* classes.
 *   bun scripts/showcase.ts [--check]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const APP = resolve(import.meta.dir, "..");
const UI = resolve(APP, "../../packages/ui");
const CHECK = process.argv.includes("--check");
const { bricks } = await import(join(UI, "scripts/registry.ts"));
const { showcaseCases } = await import(join(UI, "node_modules/@ui8kit/codegen/tests/support/fixtures.ts"));
const { hasChildren, knownCanonicalProps, htmlRuntimeProps } = await import(join(UI, "node_modules/@ui8kit/codegen/tests/support/props.ts"));

// Layout/text building blocks are "primitives"; interactive or composite bricks are "components".
const PRIMITIVES = new Set(["block", "box", "container", "grid", "group", "stack", "inline", "text", "title", "linebreak", "list", "separator", "image", "icon", "link", "label"]);
const LABELS: Record<string, string> = { AriaLabel: "Example", Name: "demo", Href: "#", Src: "/media/avatar-sarah.jpg", Alt: "Avatar" };

const out = [];
for (const b of bricks as any[]) {
  const parts = [];
  for (const part of b.parts) {
    const seen = new Set<string>();
    const cases: Array<{ id: string; props: Record<string, unknown> }> = [];
    const add = (id: string, canonical: Record<string, unknown>) => {
      const c = Object.fromEntries(Object.entries(canonical ?? {}).filter(([k]) => k !== "Class"));
      const props = htmlRuntimeProps(part, c);
      // Example URLs from upstream fixtures point nowhere in this app: links → "#", images → a fixture avatar.
      for (const [k, v] of Object.entries(props)) if (typeof v === "string" && v.startsWith("/")) props[k] = /^(src|srcset)$/i.test(k) ? "/media/avatar-sarah.jpg" : "#";
      const key = JSON.stringify(props);
      if (seen.has(key) || seen.has(id)) return;
      seen.add(key); seen.add(id);
      cases.push({ id, props });
    };
    add("defaults", Object.fromEntries(part.props.filter((p: any) => LABELS[p.name] && (p.name !== "Href" || part.name === "Link")).map((p: any) => [p.name, LABELS[p.name]])));
    const recipe = part.recipeId ? ((b.recipes ?? {})[part.recipeId] ?? (Object.values(b.recipes ?? {}) as any[]).find((r) => r.id === part.recipeId)) : undefined;
    for (const [key, values] of Object.entries((recipe?.byKey ?? {}) as Record<string, Record<string, string>>)) {
      const prop = part.props.find((p: any) => p.name.toLowerCase() === key.toLowerCase());
      if (prop) for (const v of Object.keys(values)) add(`${key}.${v}`, { ...(key === "size" && v === "icon" ? { AriaLabel: "Example" } : {}), [prop.name]: v });
    }
    for (const c of showcaseCases(b)) { const p = knownCanonicalProps(b, part, c.props); if (p && Object.keys(p).length) add(c.id, p); }
    parts.push({
      name: part.name,
      docs: part.docs ?? "",
      children: hasChildren(part),
      props: part.props.map((p: any) => ({ name: p.name, type: p.type, docs: p.docs ?? "" })),
      cases,
    });
  }
  out.push({ id: b.id, dir: b.dir, kind: PRIMITIVES.has(b.dir) ? "primitive" : "component", docs: b.docs ?? "", parts });
}
const body = JSON.stringify(out, null, 2) + "\n";
const p = join(APP, "src/lib/showcase.generated.json");
if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== body) { console.error("drift: src/lib/showcase.generated.json"); process.exit(1); } }
else writeFileSync(p, body);
const n = out.reduce((a, b) => a + b.parts.reduce((x: number, p: any) => x + p.cases.length, 0), 0);
console.log(`design showcase: ${out.length} bricks, ${n} cases ${CHECK ? "checked" : "written"}`);
