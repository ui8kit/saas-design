/**
 * Contract gate: every record in fixtures/content/records must pass
 *   1. the JSON Schemas shipped in @ui8kit/contract (ajv, draft 2020-12), and
 *   2. validateCollectionV04 (strict keys, uniqueness, references, manifest metadata types),
 *   3. local reference checks the validator does not do (media ids, section item ids).
 *
 *   bun tools/validate-content.ts [--json]
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateCollectionV04 } from "@ui8kit/contract";

const ROOT = resolve(import.meta.dir, "..");
const R = join(ROOT, "fixtures/content/records");
const SCHEMAS = join(ROOT, "node_modules/@ui8kit/contract/schemas");
const list = (d: string): string[] => !existsSync(d) ? [] : readdirSync(d, { withFileTypes: true }).flatMap((x) => x.isDirectory() ? list(join(d, x.name)) : x.name.endsWith(".json") ? [join(d, x.name)] : []);
const load = (d: string) => list(d).map((file) => ({ file: relative(ROOT, file), data: JSON.parse(readFileSync(file, "utf8")) }));

const manifest = JSON.parse(readFileSync(join(R, "manifest.json"), "utf8"));
const collection = {
  entries: load(join(R, "entries")),
  menus: load(join(R, "menus")),
  dictionaries: load(join(R, "dictionaries")),
  settings: load(join(R, "settings")),
};

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
const schema = (n: string) => ajv.compile(JSON.parse(readFileSync(join(SCHEMAS, `${n}.schema.json`), "utf8")));
const checks: Array<[string, Array<{ file: string; data: unknown }>]> = [
  ["entry", collection.entries], ["menu", collection.menus], ["dictionary", collection.dictionaries], ["settings", collection.settings],
  ["manifest", [{ file: "fixtures/content/records/manifest.json", data: manifest }]],
];
const errors: string[] = [];
let schemaChecked = 0;
for (const [name, files] of checks) {
  const v = schema(name);
  for (const f of files) {
    schemaChecked++;
    if (!v(f.data)) errors.push(`schema ${name}: ${f.file}: ${ajv.errorsText(v.errors)}`);
  }
}

const issues = validateCollectionV04(collection, { manifest });
const warnings = issues.filter((i) => i.severity === "warning");
for (const i of issues.filter((i) => !i.severity)) errors.push(`contract ${i.code}: ${i.path}: ${i.message}`);

// local references
const ids = new Set(collection.entries.map((e: any) => e.data.id));
for (const { file, data } of collection.entries as Array<{ file: string; data: any }>) {
  if (data.featured_media_id && !ids.has(data.featured_media_id)) errors.push(`ref: ${file}: featured_media_id ${data.featured_media_id} missing`);
  for (const key of ["media", "logos", "items", "sections"]) {
    for (const ref of data.metadata?.[key]?.value ?? []) if (!ids.has(ref)) errors.push(`ref: ${file}: ${key} -> ${ref} missing`);
  }
}
for (const s of collection.settings as Array<{ file: string; data: any }>) {
  for (const key of ["logo_media_id", "front_page_id"]) if (s.data[key] && !ids.has(s.data[key])) errors.push(`ref: ${s.file}: ${key} ${s.data[key]} missing`);
}

const total = Object.values(collection).reduce((n, l) => n + l.length, 0) + 1;
const summary = { records: total, entries: collection.entries.length, schemaChecked, errors: errors.length, warnings: warnings.length };
if (process.argv.includes("--json")) console.log(JSON.stringify({ ...summary, errorList: errors, warningList: warnings }, null, 2));
else {
  for (const e of errors) console.error(e);
  for (const w of warnings.slice(0, 20)) console.warn(`warning ${w.code}: ${w.path}`);
  console.log(`contract: ${summary.records} records (${summary.entries} entries), schema-checked ${schemaChecked}, errors ${errors.length}, warnings ${warnings.length}`);
}
if (errors.length) process.exit(1);
