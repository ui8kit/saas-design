import { error } from "@sveltejs/kit";
import { blocks } from "$design/blocks";

export const entries = () => blocks.map((b) => ({ id: b.id }));
export const load = ({ params }) => {
  const i = blocks.findIndex((b) => b.id === params.id);
  if (i < 0) error(404, "Unknown block");
  return { meta: blocks[i]!, prev: blocks[i - 1], next: blocks[i + 1] };
};
