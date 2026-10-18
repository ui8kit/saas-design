/** Lucide icon (lucide-static, pinned in the root package.json) as a codegen element tree: identical SVG in templ and Svelte. */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { attrStatic, el } from "@ui8kit/codegen/bricks/_dsl";

const require = createRequire(import.meta.url);
export function lucide(name: string, cls: string) {
  const svg = readFileSync(require.resolve(`lucide-static/icons/${name}.svg`), "utf8");
  const children = [...svg.matchAll(/<(circle|path|line|rect|polyline|polygon|ellipse)\s+([^>]*?)\s*\/>/g)].map(([, tag, attrs]) =>
    el(tag!, [...attrs!.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => attrStatic(k!, v!)), []));
  return el("svg", [
    attrStatic("class", cls),
    attrStatic("xmlns", "http://www.w3.org/2000/svg"),
    attrStatic("viewBox", "0 0 24 24"),
    attrStatic("fill", "none"),
    attrStatic("stroke", "currentColor"),
    attrStatic("stroke-width", "2"),
    attrStatic("stroke-linecap", "round"),
    attrStatic("stroke-linejoin", "round"),
    attrStatic("aria-hidden", "true"),
    attrStatic("focusable", "false"),
  ], children);
}
