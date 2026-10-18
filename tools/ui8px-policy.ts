/**
 * Writes .ui8px/policy from project sources:
 *   patterns.json  every ui-* class the generated markup can emit (packages/ui + packages/blocks + adapter base)
 *   scopes.json    controls = codegen primitives (packages/ui, primitives.generated.css); layout = everything else
 *   allowed.json   ui8px go-preset defaults (tools/ui8px/allowed.base.json) + reviewed extras (tools/ui8px/allowed.extra.json)
 *   denied.json    defaults + palette/arbitrary bans (tools/ui8px/denied.base.json)
 *   bun tools/ui8px-policy.ts [--check]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const CHECK = process.argv.includes("--check");
const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const patterns: Record<string, string[]> = {};
for (const [k, v] of Object.entries(read("packages/ui/classes.json") as Record<string, string | string[]>)) patterns[k] = Array.isArray(v) ? v : String(v).split(" ").filter(Boolean);
for (const [k, v] of Object.entries(read("packages/blocks/classes.json") as Record<string, string[]>)) patterns[k] = v;
for (const m of readFileSync(join(ROOT, "packages/adapter/src/base.css"), "utf8").matchAll(/\.(ui-[\w-]+)\s*\{\s*@apply ([^;]+);/g)) patterns[m[1]!] = m[2]!.split(/\s+/);

const base = read("tools/ui8px/allowed.base.json");
const extra = read("tools/ui8px/allowed.extra.json") as { $comment?: string; utilities: string[] };
const allowed = { spacing: base.spacing, utilities: [...new Set([...base.utilities, ...extra.utilities])].sort() };
const scopes = {
  defaultScope: "layout",
  scopes: [
    { name: "controls", files: ["packages/ui/**", "packages/icons/**", "packages/adapter/src/primitives.generated.css"], spacing: "control" },
    { name: "layout", files: ["packages/blocks/**", "packages/adapter/src/blocks.generated.css", "packages/adapter/src/base.css", "apps/**"], spacing: "layout" },
  ],
};
const files: Record<string, unknown> = {
  ".ui8px/policy/patterns.json": { patterns: Object.fromEntries(Object.entries(patterns).sort(([a], [b]) => a.localeCompare(b))) },
  ".ui8px/policy/allowed.json": allowed,
  ".ui8px/policy/scopes.json": scopes,
  ".ui8px/policy/denied.json": read("tools/ui8px/denied.base.json"),
};
let drift = 0;
mkdirSync(join(ROOT, ".ui8px/policy"), { recursive: true });
for (const [rel, v] of Object.entries(files)) {
  const body = JSON.stringify(v, null, 2) + "\n"; const p = join(ROOT, rel);
  if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== body) { console.error(`drift: ${rel}`); drift++; } }
  else writeFileSync(p, body);
}
console.log(`ui8px policy: ${Object.keys(patterns).length} patterns, ${allowed.utilities.length} allowed utilities ${CHECK ? "checked" : "written"}`);
if (drift) process.exit(1);
