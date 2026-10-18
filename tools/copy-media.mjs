#!/usr/bin/env node
// Copies every media entry (fixtures/content/records/entries/media) to <dest>/<public_path>.
// Plain Node so it runs in any build image:  node tools/copy-media.mjs apps/site/public
import { readdirSync, readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dest = resolve(process.argv[2] ?? "public");
const dir = join(ROOT, "fixtures/content/records/entries/media");
let n = 0;
for (const f of readdirSync(dir)) {
  const m = JSON.parse(readFileSync(join(dir, f), "utf8")).metadata;
  const to = join(dest, m.public_path.value);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(ROOT, "fixtures", m.file.value), to);
  n++;
}
console.log(`media: ${n} files -> ${dest}`);
