import type { BlockDef } from "../scripts/dsl";
import { catalogBlocks } from "./catalog";
import { figmaBlocks } from "./figma";

/** Design-system block catalog (≤ 45): 10 copied from Figma + 29 authored in the same grammar. */
export const blocks: BlockDef[] = [...figmaBlocks, ...catalogBlocks];
if (blocks.length > 45) throw new Error(`block catalog exceeds 45 (${blocks.length})`);
