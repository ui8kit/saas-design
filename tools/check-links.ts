/**
 * Relative link checker for the docs: every [text](relative/path#anchor) in README.md, AGENTS.md, CONTRIBUTING.md,
 * docs/*.md, .manual/*.md, .cursor/**\/*.md(c) and .project/**\/*.md must point at an existing file (and, for .md targets,
 * an existing heading anchor, GitHub slug rules). External http(s)/mailto links are not fetched.
 *   bun tools/check-links.ts
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const walk = (d: string): string[] => readdirSync(join(ROOT, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === "node_modules" ? [] : walk(`${d}/${e.name}`)) : [`${d}/${e.name}`]);
const files = [
  "README.md", "AGENTS.md", "CONTRIBUTING.md",
  ...walk("docs"), ...walk(".manual"), ...walk(".cursor"), ...walk(".project"),
].filter((f) => /\.mdc?$/.test(f));

const slug = (h: string) => h.trim().toLowerCase().replace(/<[^>]+>/g, "").replace(/[`*_~]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
const anchors = new Map<string, Set<string>>();
const anchorsOf = (f: string) => {
  if (!anchors.has(f)) {
    const seen = new Map<string, number>(); const set = new Set<string>();
    let fence = false;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      if (/^\s*```/.test(line)) fence = !fence;
      const m = !fence && /^#{1,6}\s+(.*)$/.exec(line);
      if (!m) continue;
      const base = slug(m[1]!); const n = seen.get(base) ?? 0; seen.set(base, n + 1);
      set.add(n ? `${base}-${n}` : base);
    }
    anchors.set(f, set);
  }
  return anchors.get(f)!;
};

let bad = 0, count = 0;
for (const f of files) {
  const text = readFileSync(join(ROOT, f), "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const m of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const href = m[1]!;
    if (/^(https?:|mailto:)/.test(href)) continue;
    count++;
    const [p, a] = href.split("#") as [string, string | undefined];
    const target = p ? resolve(ROOT, dirname(f), decodeURIComponent(p)) : join(ROOT, f);
    if (!existsSync(target)) { console.error(`${f}: broken link ${href}`); bad++; continue; }
    if (a && statSync(target).isFile() && /\.mdc?$/.test(target) && !anchorsOf(target).has(a)) { console.error(`${f}: missing anchor #${a} in ${relative(ROOT, target)}`); bad++; }
  }
}
console.log(`links: ${count} relative links in ${files.length} files, ${bad} broken`);
if (bad) process.exit(1);
