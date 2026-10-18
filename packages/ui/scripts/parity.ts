/**
 * Primitive parity: for every brick part and showcase case, the canonical renderer of @ui8kit/codegen,
 * the generated Go templ part (packages/ui/templ/cmd/parity) and the generated Svelte 5 part must give the
 * same normalized DOM. Also asserts that generated markup carries only ui-* classes.
 *
 *   bun --preload ../../tools/svelte-preload.ts scripts/parity.ts   (cwd packages/ui)
 */
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { render as svelteRender } from "svelte/server";
import { createRawSnippet } from "svelte";
import { bricks } from "./registry";
import { fileStem } from "@ui8kit/codegen/src/domain/model";
import { renderPart } from "@ui8kit/codegen/src/domain/render";
import { showcaseCases } from "@ui8kit/codegen/tests/support/fixtures";
import { normalizeHtml } from "@ui8kit/codegen/tests/support/normalize";
import { hasChildren, knownCanonicalProps, htmlRuntimeProps } from "@ui8kit/codegen/tests/support/props";

const ROOT = resolve(import.meta.dir, "../../..");
const TEMPL = join(ROOT, "packages/ui/templ");
const SVELTE = join(ROOT, "packages/ui/svelte/ui");
const CHILD = "Content";

type Case = { brick: any; part: any; id: string; props: any; children: string; canonical: string };
const cases: Case[] = [];
for (const brick of bricks as any[]) {
  const show = showcaseCases(brick);
  for (const part of brick.parts) {
    const list = [{ id: "defaults", props: {} }, ...show.map((c) => ({ id: c.id, props: knownCanonicalProps(brick, part, c.props) })).filter((c: any) => c.props && Object.keys(c.props).length)];
    for (const c of list) {
      const children = hasChildren(part) ? CHILD : "";
      cases.push({ brick, part, id: c.id, props: c.props, children, canonical: renderPart(brick, part.name, c.props as any, { children: children || undefined }) });
    }
  }
}

const templOut = JSON.parse(execFileSync("go", ["run", "./cmd/parity"], {
  cwd: TEMPL, encoding: "utf8", maxBuffer: 64 << 20,
  input: JSON.stringify(cases.map((c) => ({ name: `${c.brick.dir}/${fileStem(c.brick)}/${c.part.name}`, props: c.props, children: c.children }))),
})) as string[];

let fail = 0, nonSemantic = 0;
const failures: string[] = [];
for (let i = 0; i < cases.length; i++) {
  const c = cases[i]!;
  const mod = await import(pathToFileURL(join(SVELTE, c.brick.dir, `${c.part.name}.svelte`)).href);
  const props: any = htmlRuntimeProps(c.part, c.props);
  if (c.children) props.children = createRawSnippet(() => ({ render: () => CHILD }));
  const svelte = svelteRender(mod.default, { props }).body;
  const want = normalizeHtml(c.canonical); // compared with Bun.deepEquals: attribute order is not part of the contract
  const label = `${c.brick.id} ${c.part.name} · ${c.id}`;
  if (!Bun.deepEquals(normalizeHtml(templOut[i]!), want)) { fail++; failures.push(`templ != canonical: ${label}`); }
  if (!Bun.deepEquals(normalizeHtml(svelte), want)) { fail++; failures.push(`svelte != canonical: ${label}`); if (process.env.PARITY_DEBUG) failures.push(`  canonical: ${c.canonical}\n  svelte:    ${svelte}`); }
  const caller = new Set(Object.values(c.props as any).filter((v) => typeof v === "string").flatMap((v) => (v as string).split(/\s+/))); // caller-provided values are not generated
  for (const m of c.canonical.matchAll(/class="([^"]*)"/g)) for (const t of m[1]!.split(/\s+/).filter(Boolean)) if (!t.startsWith("ui-") && !caller.has(t) && !/^icon-/.test(t) /* icon-<name>: upstream Icon name hook */) { nonSemantic++; failures.push(`non-semantic class "${t}" in ${label}`); }
}
for (const f of failures.slice(0, 30)) console.error(f);
console.log(`parity(ui): ${cases.length} cases x 2 runtimes, ${fail} mismatches, ${nonSemantic} non-ui-* classes`);
if (fail || nonSemantic) process.exit(1);
