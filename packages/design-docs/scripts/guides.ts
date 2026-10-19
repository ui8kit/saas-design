/** Fails if a guide on the design apps' Instructions page points at a file that does not exist.  bun scripts/guides.ts */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { guideGroups } from "../src/guides";

const ROOT = resolve(import.meta.dir, "../../..");
const all = guideGroups.flatMap((g) => g.guides);
const missing = all.filter((g) => !existsSync(join(ROOT, g.path)));
for (const g of missing) console.error(`guides: missing ${g.path} (${g.title})`);
if (missing.length) process.exit(1);
console.log(`guides: ${all.length} guides in ${guideGroups.length} groups, all files exist`);
