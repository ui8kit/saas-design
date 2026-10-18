// Block catalog (packages/blocks) + preview data (fixtures/views/blocks.json, built from contract records by tools/views.ts).
import catalog from "../../../packages/blocks/catalog.json";
import views from "../../../fixtures/views/blocks.json";

export type BlockMeta = (typeof catalog)[number];
export const blocks: BlockMeta[] = catalog;
const data = new Map<string, unknown>(views.blocks.map((v) => [v.block, v.data]));
export const blockData = (id: string) => data.get(id);
export const categories = [...new Set(catalog.map((b) => b.category))].map((c) => ({ id: c, blocks: catalog.filter((b) => b.category === c) }));

/**
 * Preview frame classes. The Figma page sections only carry top spacing (pt-*: on the page the next
 * section starts right after them), so their preview frame adds a bottom step (ds-frame-flow).
 */
const flow = new Set(["feature-cards", "social-proof-split", "app-gallery", "testimonial-cards", "cta-split", "pricing-two-plans", "faq-tiles"]);
export const frameClass = (id: string) => (flow.has(id) ? "ds-frame ds-frame-flow" : "ds-frame");
