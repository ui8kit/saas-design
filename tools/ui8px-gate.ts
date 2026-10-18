/**
 * ui8px gate (bun run check, step "ui8px"): runs `ui8px lint --json` over the repo and fails on any blocking hit.
 * Blocking: every rule (UI8PX001 spacing off the 8+4 grid, 002 class not allowed, 003 denied, 004 conflict, 005 unknown ui-*),
 * EXCEPT a UI8PX002 hit whose class is a utility the generated primitives take verbatim from the pinned @ui8kit/codegen 2.0
 * specs (packages/ui/upstream-utilities.json): those passed the upstream gate (codegen .ui8px/gate.json blocks 001/003/005/GRID,
 * reports 002) and fail here only because the ui8px grammar does not parse their modifier chain (checked:, group-open:,
 * in-aria-expanded:, [&>svg]:, [--knob:12px] ...). They are counted and printed, never blocking.
 * Our own classes (packages/ui/recipes, packages/blocks, adapter base.css, apps) get no exception.
 *   bun tools/ui8px-gate.ts
 */
import { mkdirSync, openSync, closeSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const report = join(ROOT, ".ui8px/reports/lint.json");
mkdirSync(join(ROOT, ".ui8px/reports"), { recursive: true });
// stdout straight to a file: through a pipe a long JSON report can be cut
const fd = openSync(report, "w");
const run = spawnSync("npx", ["-y", "ui8px@latest", "lint", "--json"], { cwd: ROOT, stdio: ["ignore", fd, "pipe"], encoding: "utf8" });
closeSync(fd);
if (run.status === 2 || run.status === null) { console.error(run.stderr || "ui8px failed"); process.exit(2); }
const { diagnostics } = JSON.parse(readFileSync(report, "utf8")) as { diagnostics: Array<{ rule: string; file: string; line?: number; className: string; scope?: string; message?: string }> };
const upstream = new Set((JSON.parse(readFileSync(join(ROOT, "packages/ui/upstream-utilities.json"), "utf8")) as { utilities: string[] }).utilities);
// tools/css-apply.ts moves a variant into a nested rule (backdrop:bg-x -> &::backdrop { @apply bg-x }): match the bare utility too
for (const u of [...upstream]) upstream.add(u.slice(u.lastIndexOf(":") + 1));
const counts: Record<string, number> = {};
const blocking: typeof diagnostics = [];
const reportOnly = new Set<string>();
for (const d of diagnostics) {
  counts[d.rule] = (counts[d.rule] ?? 0) + 1;
  if (d.rule === "UI8PX002" && d.file.endsWith("packages/adapter/src/primitives.generated.css") && upstream.has(d.className)) { reportOnly.add(d.className); continue; }
  blocking.push(d);
}
for (const b of blocking.slice(0, 40)) console.error(`${b.file}:${b.line ?? "?"} ${b.rule} "${b.className}" (${b.scope ?? "?"})`);
console.log(`ui8px: ${diagnostics.length} diagnostics ${JSON.stringify(counts)}; blocking ${blocking.length}; report-only ${reportOnly.size} upstream codegen 2.0 utilities (ui8px grammar gaps); report .ui8px/reports/lint.json`);
if (blocking.length) process.exit(1);
