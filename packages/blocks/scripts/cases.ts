// Fixture cases for block parity and the design app: Figma page data + catalog demo data.
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../..");
export type Case = { block: string; label: string; data: unknown };
export function cases(): Case[] {
  const out: Case[] = [];
  const home = JSON.parse(readFileSync(join(ROOT, "fixtures/views/home.json"), "utf8"));
  for (const b of home.blocks) {
    out.push({ block: b.block, label: `home/${b.id}`, data: b.data });
    if (b.block === "hero-phones") out.push({ block: "navbar", label: `home/${b.id}/nav`, data: b.data.nav });
  }
  const cat = join(ROOT, "fixtures/views/blocks.json");
  if (existsSync(cat)) for (const b of JSON.parse(readFileSync(cat, "utf8")).blocks) out.push({ block: b.block, label: `catalog/${b.block}`, data: b.data });
  return out;
}
