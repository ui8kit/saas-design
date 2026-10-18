import { error } from "@sveltejs/kit";
import catalog from "$packages/blocks/catalog.json";

export const entries = () => catalog.map((b) => ({ id: b.id }));
export const load = ({ params }) => {
  const meta = catalog.find((b) => b.id === params.id);
  if (!meta) error(404, "Unknown block");
  return { meta };
};
