/**
 * Makes the pinned @ui8kit/codegen 2.0 engine (xgen) importable.
 *
 * packages/ui pins `@ui8kit/codegen` as a git dependency (github:ui8kit/codegen#<sha>). That package is a Bun workspace root:
 * its engine lives in `xgen/*` as workspace packages (`@ui8kit/xgen-spec`, `@ui8kit/xgen-runtime-svelte`, ...) that import
 * each other by name, and a git dependency does not install nested workspaces. This script copies the installed `xgen/`
 * folder to `packages/ui/.xgen` (git-ignored) and links every xgen package into `packages/ui/node_modules/@ui8kit/`, so the
 * engine resolves its own packages (and ajv, clsx, tailwind-merge, @ui8kit/contract from the workspace).
 *
 *   bun tools/xgen-link.ts            (runs as the root postinstall)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const UI = join(ROOT, "packages/ui");
const installed = join(UI, "node_modules/@ui8kit/codegen");
if (!existsSync(installed)) { console.error("xgen-link: packages/ui/node_modules/@ui8kit/codegen missing (run bun install)"); process.exit(1); }
const src = realpathSync(installed);
const pkg = JSON.parse(readFileSync(join(src, "package.json"), "utf8"));
const DEST = join(UI, ".xgen");
const stamp = join(DEST, ".source");
const LAYOUT = 2; // bump when the copied set changes
const want = `${pkg.name}@${pkg.version} ${src} layout ${LAYOUT}`;
if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== want) {
  rmSync(DEST, { recursive: true, force: true });
  cpSync(join(src, "xgen"), join(DEST, "xgen"), { recursive: true });
  // the template runtimes read their assets relative to the repo root of codegen (e.g. rules, package READMEs): keep LICENSE + package.json
  for (const f of ["package.json", "LICENSE"]) cpSync(join(src, f), join(DEST, f));
  // the reviewed ui8px policy of codegen 2.0 (grid steps + allowed utilities of its recipes): tools/ui8px-policy.ts merges it
  for (const f of ["policy/allowed.json", "policy/denied.json", "gate.json"]) { mkdirSync(join(DEST, ".ui8px/policy"), { recursive: true }); cpSync(join(src, ".ui8px", f), join(DEST, ".ui8px", f)); }
  writeFileSync(stamp, want);
}
// link every xgen workspace package by name
const dirs = ["schema", "spec", "screens", "generator", "check", "cli", ...readdirSync(join(DEST, "xgen/runtimes")).map((r) => `runtimes/${r}`)];
mkdirSync(join(UI, "node_modules/@ui8kit"), { recursive: true });
let n = 0;
for (const d of dirs) {
  const pj = join(DEST, "xgen", d, "package.json");
  if (!existsSync(pj)) continue;
  const name: string = JSON.parse(readFileSync(pj, "utf8")).name;
  const link = join(UI, "node_modules", name);
  rmSync(link, { recursive: true, force: true });
  symlinkSync(relative(join(link, ".."), join(DEST, "xgen", d)), link, "dir");
  n++;
}
console.log(`xgen-link: ${pkg.name}@${pkg.version} -> packages/ui/.xgen, ${n} packages linked`);
