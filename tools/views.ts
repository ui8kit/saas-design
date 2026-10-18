/**
 * View models: contract records (fixtures/content/records) → fixtures/views/*.json.
 * The same JSON feeds the Go export (apps/site) and the Svelte app (apps/design), so both
 * runtimes render identical DOM. Shapes are the block schemas in packages/blocks/defs.
 *   bun tools/views.ts [--check]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const REC = join(ROOT, "fixtures/content/records");
const CHECK = process.argv.includes("--check");
const read = (p: string) => JSON.parse(readFileSync(join(REC, p), "utf8"));

type Entry = { id: string; kind: string; title: string; excerpt?: string; content?: string; order?: number; slug: string; featured_media_id?: string; metadata?: Record<string, { value: any }> };
const entries = new Map<string, Entry>();
for (const kind of readdirSync(join(REC, "entries"))) for (const f of readdirSync(join(REC, "entries", kind))) { const e = read(`entries/${kind}/${f}`); entries.set(e.id, e); }
const get = (id: string) => { const e = entries.get(id); if (!e) throw new Error(`missing entry ${id}`); return e; };
const m = (e: Entry, k: string, fallback?: any) => { const v = e.metadata?.[k]?.value; if (v === undefined) { if (fallback !== undefined) return fallback; throw new Error(`${e.id}: missing metadata.${k}`); } return v; };
const ofKind = (kind: string) => [...entries.values()].filter((e) => e.kind === kind).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const media = (id: string) => { const e = get(id); return { src: m(e, "public_path"), alt: m(e, "alt") }; };
const menu = (id: string) => (read(`menus/${id}.json`).items as any[]).sort((a, b) => a.order - b.order).map((i) => ({ label: i.label, href: i.url }));
const dict = read("dictionaries/en.json").messages as Record<string, string>;
const t = (k: string) => { if (!(k in dict)) throw new Error(`missing message ${k}`); return dict[k]!; };
const site = read("settings/site.json");

// ---- Figma home page ----
const sec = (slug: string) => get(`section-${slug}`);
const hero = sec("hero");
const nav = { label: t("nav.label"), brand: site.title, href: "#top", items: menu("header"), cta: { label: m(hero, "login_label"), href: m(hero, "login_href") } };
const views: Record<string, any> = {
  "hero-phones": {
    nav, title: hero.title, lead: hero.excerpt, badge: m(hero, "badge"),
    primary: { label: m(hero, "primary_label"), href: m(hero, "primary_href") },
    secondary: { label: m(hero, "secondary_label"), href: m(hero, "secondary_href") },
    screens: (m(hero, "media") as string[]).map((id) => ({ src: media(id).src, alt: "" })),
  },
  "feature-cards": (() => { const s = sec("why"); return { id: s.slug, title: s.title, lead: s.excerpt, items: (m(s, "items") as string[]).map((id) => { const f = get(id); return { icon: m(f, "icon"), title: f.title, text: f.excerpt }; }) }; })(),
  "social-proof-split": (() => { const s = sec("social-proof"); return { title: s.title, screen: media((m(s, "media") as string[])[0]!), logos: (m(s, "logos") as string[]).map(media) }; })(),
  "app-gallery": (() => {
    const s = sec("inside"); const tones = ["lilac", "primary", "secondary", "sky", "pink"];
    const tiles = (m(s, "media") as string[]).map((id, i) => ({ tone: tones[i]!, ...media(id) }));
    tiles.push({ tone: tones[4]!, src: "", alt: "" });
    return { id: s.slug, title: s.title, lead: s.excerpt, tiles };
  })(),
  "testimonial-cards": (() => { const s = sec("testimonials"); return { title: s.title, lead: s.excerpt, items: ofKind("testimonial").map((e) => ({ name: e.title, role: m(e, "role"), quote: `"${e.content}"`, avatar: media(e.featured_media_id!) })) }; })(),
  "cta-split": (() => { const s = sec("cta"); return { title: s.title, text: (s.excerpt ?? "").trim(), cta: { label: m(s, "primary_label"), href: m(s, "primary_href") } }; })(),
  "pricing-two-plans": (() => {
    const s = sec("pricing");
    const plans = ["plan-free", "plan-premium"].map(get).map((p) => ({
      theme: m(p, "featured", false) ? "dark" : "light", name: p.title, badge: m(p, "badge", ""), description: p.excerpt ?? "",
      price: m(p, "price_label"), period: m(p, "period", ""), features: m(p, "features"), cta: { label: m(p, "cta_label"), href: m(p, "cta_href") },
    }));
    return { id: s.slug, title: s.title, lead: s.excerpt, plans };
  })(),
  "faq-tiles": (() => { const s = sec("faq"); return { id: s.slug, title: s.title, lead: s.excerpt, items: (m(s, "items") as string[]).map((id) => { const f = get(id); return { tone: m(f, "tone"), question: f.title, answer: f.content }; }), more: { label: m(s, "link_label"), href: m(s, "link_href") } }; })(),
  "footer-newsletter": (() => {
    const s = sec("footer");
    return {
      brand: site.title, href: "#top", text: s.excerpt,
      socials: menu("social").map((l) => ({ icon: l.label.toLowerCase(), label: l.label, href: l.href })),
      columns: [{ title: t("footer.product"), links: menu("footer-product") }, { title: t("footer.company"), links: menu("footer-company") }],
      newsletter: { title: m(s, "newsletter_title"), text: m(s, "newsletter_text"), label: t("footer.email_label"), placeholder: m(s, "email_placeholder"), button: m(s, "submit_label"), action: "#newsletter" },
      copyright: m(s, "copyright"),
    };
  })(),
};
const pageEntry = get("page-home");
const home = {
  page: { id: pageEntry.id, title: pageEntry.title, description: pageEntry.excerpt, lang: site.language, figma: m(pageEntry, "figma_node") },
  blocks: (m(pageEntry, "sections") as string[]).map((id) => { const b = m(get(id), "block"); if (!views[b]) throw new Error(`no view for ${b}`); return { id, block: b, region: b === "hero-phones" ? "header" : b === "footer-newsletter" ? "footer" : "main", data: views[b] }; }),
};
export const homeView = home;

const out: Record<string, unknown> = { "fixtures/views/home.json": home };
let drift = 0;
for (const [rel, v] of Object.entries(out)) {
  const body = JSON.stringify(v, null, 2) + "\n"; const p = join(ROOT, rel);
  if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== body) { console.error(`drift: ${rel}`); drift++; } }
  else writeFileSync(p, body);
}
console.log(`views: ${Object.keys(out).length} files, home ${home.blocks.length} blocks ${CHECK ? "checked" : "written"}`);
if (drift) process.exit(1);
