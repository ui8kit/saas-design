/**
 * Block DSL: one definition → templ component + Svelte 5 component + adapter CSS (@apply) + data types.
 * Blocks compose the generated primitives from @saas-design/ui (packages/ui) and the icon registry.
 * Markup carries only semantic ui-* classes; utilities live only in the emitted CSS.
 */
export type Expr = { $: string };
export const $ = (path: string): Expr => ({ $: path });
export const isExpr = (v: unknown): v is Expr => typeof v === "object" && v !== null && "$" in (v as any);

export type Val = string | boolean | Expr;
/** Schema: "string" | "bool" | [itemSchema] | { field: schema } | "@block-id" (data of another block). */
export type Schema = string | Schema[] | { [k: string]: Schema };

export type Style = {
  /** Shared kit class ui-<kit> (scripts/kits.ts). */
  kit?: string;
  /** Part name: class becomes ui-<block>-<ui>; omitted on the root. */
  ui?: string;
  /** Tailwind utilities, emitted as @apply in the adapter (never in markup). */
  css?: string;
  /** Variant classes ui-<block>-<ui>-<key>-<value>, selected at runtime by `vary`. */
  variants?: Record<string, Record<string, string>>;
  vary?: Record<string, Expr>;
};
export type Child = string | Expr | Node;
export type Node =
  | ({ k: "c"; comp: string; props: Record<string, Val>; children: Child[] } & Style)
  | ({ k: "h"; tag: string; props: Record<string, Val>; children: Child[] } & Style)
  | { k: "each"; of: Expr; as: string; children: Child[] }
  | { k: "if"; test: Expr; eq?: string; not?: boolean; children: Child[] }
  | ({ k: "icon"; name: string | Expr } & Style)
  | { k: "use"; block: string; data: Expr };

type Opts = Style & Record<string, unknown>;
function split(o: Opts) {
  const { ui, css, variants, vary, kit, ...props } = o;
  return { style: { ui, css, variants, vary, kit } as Style, props: props as Record<string, Val> };
}
/** Primitive component from @saas-design/ui (Block, Container, Stack, Title, Text, Button, …). */
export const c = (comp: string, o: Opts = {}, ...children: Child[]): Node => { const { style, props } = split(o); return { k: "c", comp, props, children, ...style }; };
/** Plain element — only where no primitive exists (span, a in nav, svg-free wrappers). */
export const h = (tag: string, o: Opts = {}, ...children: Child[]): Node => { const { style, props } = split(o); return { k: "h", tag, props, children, ...style }; };
export const each = (of: Expr, as: string, ...children: Child[]): Node => ({ k: "each", of, as, children });
export const when = (test: Expr, ...children: Child[]): Node => ({ k: "if", test, children });
export const unless = (test: Expr, ...children: Child[]): Node => ({ k: "if", test, not: true, children });
export const whenEq = (test: Expr, eq: string, ...children: Child[]): Node => ({ k: "if", test, eq, children });
export const icon = (name: string | Expr, o: Style = {}): Node => ({ k: "icon", name, ...o });
export const use = (block: string, data: Expr): Node => ({ k: "use", block, data });

export type BlockDef = {
  id: string;
  title: string;
  category: string;
  description: string;
  /** Figma node the block was derived from (if any). */
  figma?: string;
  schema: { [k: string]: Schema };
  root: Node;
  /** Extra CSS rules (selectors must be .ui-<id>-…); used for descendant/state rules only. */
  extraCss?: string;
};
export const block = (d: BlockDef) => d;
