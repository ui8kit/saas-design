// Block catalog (packages/blocks) + preview data (fixtures/views/blocks.json, built from contract records by tools/views.ts).
import catalog from "../../../packages/blocks/catalog.json";
import views from "../../../fixtures/views/blocks.json";

export type BlockMeta = (typeof catalog)[number];
export const blocks: BlockMeta[] = catalog;
const data = new Map<string, unknown>(views.blocks.map((v) => [v.block, v.data]));
export const blockData = (id: string) => data.get(id);
export const categories = [...new Set(catalog.map((b) => b.category))].map((c) => ({ id: c, blocks: catalog.filter((b) => b.category === c) }));
