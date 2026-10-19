/**
 * Figma dump + authored source -> Codex v0.4 records (@ui8kit/contract).
 *
 * Reads   fixtures/figma/frames/1-10.json, fixtures/figma/images/index.json,
 *         fixtures/content/source/{authored,blocks}.json, fixtures/tokens/tokens.json
 * Writes  fixtures/content/records/{manifest.json,settings/,menus/,dictionaries/,entries/<kind>/}
 *         fixtures/media/svg/*.svg (vector assets of the frame, by role)
 *
 *   bun tools/content.ts [--check]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const CHECK = process.argv.includes("--check");
const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const frame = read("fixtures/figma/frames/1-10.json");
const images = read("fixtures/figma/images/index.json").images as Array<{ hash: string; file: string; ext: string; width: number | null; height: number | null }>;
const authored = read("fixtures/content/source/authored.json");
const catalog = read("fixtures/content/source/blocks.json").blocks as Array<any>;
const tokens = read("fixtures/tokens/tokens.json");

const AT = "2026-10-18T00:00:00Z"; // fixed: records are reproducible
const LOCALE = "en";
const out = new Map<string, string>();
const put = (p: string, data: unknown) => out.set(p, JSON.stringify(data, null, 2) + "\n");

// ---- figma lookups ----------------------------------------------------------------------
const byId = new Map<string, any>();
(function walk(n: any) { byId.set(n.k, n); (n.children ?? []).forEach(walk); })(frame.root);
const txt = (k: string): string => {
  const n = byId.get(k);
  if (!n?.text) throw new Error(`figma node ${k} is not a text node`);
  return n.text.chars;
};
const unquote = (s: string) => s.replace(/^"|"$/g, "");
const slug = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const meta = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, { value: v }]));

type Entry = Record<string, unknown> & { id: string; kind: string };
const entries: Entry[] = [];
const entry = (kind: string, id: string, title: string, rest: Record<string, unknown> = {}, m: Record<string, unknown> = {}) => {
  const e: Entry = {
    id, locale: LOCALE, kind, status: "published", visibility: "public", slug: rest.slug as string ?? slug(id.replace(`${kind}-`, "")) ,
    title, ...rest, version: 1, created_at: AT, updated_at: AT, published_at: AT,
  };
  if (Object.keys(m).length) e.metadata = meta(m);
  entries.push(e);
  return e;
};

// ---- media: raster images used by the frame ----------------------------------------------
const imageRoles: Record<string, { id: string; alt: string }> = {
  f578f9c2a181ef669150341163e63e6e9da01878: { id: "avatar-sarah", alt: "Sarah T." },
  "1d5ad8aaf12fd61a75197f707f6ef40c7edd6e1f": { id: "avatar-james", alt: "James K." },
  ec901f1c0d6bdc3abb3b7f2578c96a444ee001e2: { id: "avatar-priya", alt: "Priya R." },
  "1bc08fb819ca5d936d5f96bb8290547b9d7865d9": { id: "screen-habit-tracker", alt: "Habit tracker screen of the Habitus app" },
  "38b205df68ebac3d84139b2840c7a95f187bfa76": { id: "screen-settings", alt: "Settings screen of the Habitus app" },
  "68b878ed3637ccfd005f7dc381ebff9f3c13e938": { id: "screen-dashboard", alt: "Dashboard screen of the Habitus app" },
  "5dc3cce4105e68d65f30e95ba9b68e22e3a7c636": { id: "screen-goals", alt: "Goals screen of the Habitus app" },
};
for (const img of images) {
  const role = imageRoles[img.hash];
  if (!role) continue; // unused in the frame (see .project/backlog/fig2design-unused-images.md)
  entry("media", `media-${role.id}`, role.alt, { slug: role.id }, {
    file: `figma/${img.file}`, public_path: `/media/${role.id}.${img.ext}`, mime: img.ext === "jpg" ? "image/jpeg" : "image/png",
    width: img.width ?? undefined, height: img.height ?? undefined, alt: role.alt, figma_hash: img.hash, source: "figma",
  });
}

// ---- media: vector assets (logos, brand mark) -> svg files ---------------------------------
const assets = frame.vectorAssets as Record<string, string>;
const svgRoles: Array<{ node: string; id: string; alt: string }> = [
  { node: "1:16", id: "brand-mark", alt: "Habitus" },
  { node: "1:176", id: "brand-mark-large", alt: "Habitus" },
  { node: "1:233", id: "logo-google", alt: "Google" },
  { node: "1:240", id: "logo-spotify", alt: "Spotify" },
  { node: "1:230", id: "logo-treehouse", alt: "Treehouse" },
  { node: "1:242", id: "logo-braze", alt: "Braze" },
];
const svgOut = new Map<string, string>();
for (const r of svgRoles) {
  const n = byId.get(r.node);
  const svg = assets[n?.asset];
  if (!svg) throw new Error(`no vector asset for ${r.node}`);
  // brand marks follow currentColor so a skin can recolor them
  const body = r.id.startsWith("brand-mark") ? svg.replace(/fill="#(?:ffffff|111827|000000)"/gi, 'fill="currentColor"') : svg;
  svgOut.set(`fixtures/media/svg/${r.id}.svg`, body + "\n");
  entry("media", `media-${r.id}`, r.alt, { slug: r.id }, {
    file: `media/svg/${r.id}.svg`, public_path: `/media/${r.id}.svg`, mime: "image/svg+xml",
    width: Math.round(n.w), height: Math.round(n.h), alt: r.alt, figma_node: r.node, source: "figma",
  });
}

// ---- sections of the home page (figma) ---------------------------------------------------
const sec = (id: string, figma: string, title: string, excerpt: string | undefined, m: Record<string, unknown>, order: number) =>
  entry("section", `section-${id}`, title, { slug: id, excerpt, order }, { figma_node: figma, block: m.block ?? id, ...m });

entry("page", "page-home", "Habitus — Build Better Habits", { slug: "home", template: "landing", excerpt: txt("1:288") },
  { figma_node: "1:10", sections: ["section-hero", "section-why", "section-social-proof", "section-inside", "section-testimonials", "section-cta", "section-pricing", "section-faq", "section-footer"] });
sec("hero", "1:262", txt("1:289"), txt("1:288"), { block: "hero-phones", badge: txt("1:279"), primary_label: txt("1:282"), primary_href: "#pricing", secondary_label: txt("1:284"), secondary_href: "#inside", login_label: txt("1:291"), login_href: "#login", media: ["media-screen-habit-tracker", "media-screen-settings", "media-screen-dashboard", "media-screen-goals"] }, 1);
sec("why", "1:244", txt("1:261"), txt("1:260"), { block: "feature-cards", items: ["feature-smart-reminders", "feature-progress-analytics", "feature-streak-tracking"] }, 2);
sec("social-proof", "1:223", txt("1:227"), undefined, { block: "social-proof-split", media: ["media-screen-habit-tracker"], logos: ["media-logo-google", "media-logo-spotify", "media-logo-treehouse", "media-logo-braze"] }, 3);
sec("inside", "1:206", txt("1:209"), txt("1:208"), { block: "app-gallery", media: ["media-screen-dashboard", "media-screen-habit-tracker", "media-screen-settings", "media-screen-goals"] }, 4);
sec("testimonials", "1:179", txt("1:181"), txt("1:180"), { block: "testimonial-cards", items: ["testimonial-sarah", "testimonial-james", "testimonial-priya"] }, 5);
sec("cta", "1:170", txt("1:174"), txt("1:175"), { block: "cta-split", primary_label: txt("1:173"), primary_href: "#pricing" }, 6);
sec("pricing", "1:84", txt("1:86"), txt("1:85"), { block: "pricing-two-plans", items: ["plan-free", "plan-premium"] }, 7);
sec("faq", "1:56", txt("1:83"), txt("1:57"), { block: "faq-tiles", items: ["faq-premium", "faq-premium-2", "faq-miss-a-day", "faq-miss-a-day-2"], link_label: txt("1:58"), link_href: "#faq" }, 8);
sec("footer", "1:11", "Habitus", txt("1:19"), { block: "footer-newsletter", newsletter_title: txt("1:47"), newsletter_text: txt("1:53"), email_placeholder: txt("1:50"), submit_label: txt("1:52"), copyright: txt("1:55"), source_label: authored.repository.label, source_href: authored.repository.href }, 9);

// features
const feat = [["smart-reminders", "1:252", "1:253", "bell"], ["progress-analytics", "1:248", "1:249", "chart-line"], ["streak-tracking", "1:257", "1:258", "flame"]];
feat.forEach(([id, t, x, icon], i) => entry("feature", `feature-${id}`, txt(t!), { excerpt: txt(x!), order: i + 1 }, { icon, source: "figma", figma_node: t }));
authored.features_more.forEach((f: any, i: number) => entry("feature", `feature-${slug(f.title)}`, f.title, { excerpt: f.text, order: 10 + i }, { icon: f.icon, source: "authored" }));

// testimonials
const tst = [["sarah", "1:187", "1:188", "1:189"], ["james", "1:196", "1:197", "1:192"], ["priya", "1:204", "1:205", "1:200"]];
tst.forEach(([id, n, r, q], i) => entry("testimonial", `testimonial-${id}`, txt(n!), { content: unquote(txt(q!)), featured_media_id: `media-avatar-${id}`, order: i + 1 }, { role: txt(r!), source: "figma" }));

// plans (money in minor units, rule fastygo.codex/money)
const freeFeatures = ["1:147", "1:152", "1:157", "1:162", "1:167"].map((k, i) => ({ label: txt(k), included: i < 4 }));
const premFeatures = ["1:106", "1:111", "1:116", "1:121", "1:126", "1:131"].map((k) => ({ label: txt(k), included: true }));
entry("plan", "plan-free", txt("1:137"), { excerpt: txt("1:138"), order: 1 }, { price: 0, currency: "USD", price_label: txt("1:141"), period: "", features: freeFeatures, cta_label: txt("1:169"), cta_href: "#signup", featured: false, source: "figma" });
entry("plan", "plan-premium", txt("1:91"), { excerpt: txt("1:94"), order: 2 }, { price: 499, currency: "USD", price_label: txt("1:98"), period: txt("1:100"), features: premFeatures, cta_label: txt("1:133"), cta_href: "#signup", featured: true, badge: txt("1:93"), source: "figma" });
authored.plans_more.forEach((p: any, i: number) => entry("plan", `plan-${slug(p.title)}`, p.title, { excerpt: p.excerpt, order: 3 + i }, { price: p.price, currency: "USD", price_label: `$${(p.price / 100).toFixed(2)}`, period: p.period, features: p.features.map((l: string) => ({ label: l, included: true })), cta_label: p.cta, cta_href: "#contact", featured: false, source: "authored" }));

// faq (figma repeats two questions twice; kept as designed, slugs made unique)
const faqs: Array<[string, string, string]> = [["premium", "1:61", "fe5d33"], ["premium-2", "1:67", "fec6c7"], ["miss-a-day", "1:73", "d9b8d5"], ["miss-a-day-2", "1:79", "dbedfb"]];
const tone: Record<string, string> = { fe5d33: "primary", fec6c7: "pink", d9b8d5: "lilac", dbedfb: "sky" };
faqs.forEach(([id, k, hex], i) => entry("faq", `faq-${id}`, txt(k), { content: authored.faq_answers[txt(k)], order: i + 1 }, { tone: tone[hex], source: "figma", answer_source: "authored" }));
authored.faq_more.forEach((f: any, i: number) => entry("faq", `faq-${slug(f.q)}`, f.q, { content: f.a, order: 10 + i }, { tone: "muted", source: "authored" }));

// design-system showcase data (authored)
authored.stats.forEach((s: any, i: number) => entry("stat", `stat-${i + 1}`, s.label, { order: i + 1 }, { value: s.value, source: "authored" }));
authored.steps.forEach((s: any, i: number) => entry("step", `step-${i + 1}`, s.title, { excerpt: s.text, order: i + 1 }, { icon: s.icon, source: "authored" }));
authored.integrations.forEach((s: any, i: number) => entry("integration", `integration-${slug(s.name)}`, s.name, { excerpt: s.text, order: i + 1 }, { icon: s.icon, source: "authored" }));
authored.members.forEach((s: any, i: number) => entry("member", `member-${slug(s.name)}`, s.name, { featured_media_id: `media-avatar-${s.avatar}`, order: i + 1 }, { role: s.role, source: "authored" }));
authored.posts.forEach((s: any, i: number) => entry("post", `post-${slug(s.title)}`, s.title, { excerpt: s.excerpt, featured_media_id: `media-${s.media}`, order: i + 1, published_at: `${s.date}T08:00:00Z` }, { tag: s.tag, source: "authored" }));
authored.releases.forEach((s: any, i: number) => entry("release", `release-${s.version.replace(".", "-")}`, s.title, { excerpt: s.text, order: i + 1, published_at: `${s.date}T08:00:00Z` }, { release_version: s.version, source: "authored" }));
authored.comparison.forEach((s: any, i: number) => entry("comparison-row", `comparison-${slug(s.feature)}`, s.feature, { order: i + 1 }, { free: s.free === "yes", premium: s.premium === "yes", source: "authored" }));
authored.dashboard.cards.forEach((s: any, i: number) => entry("metric", `metric-${slug(s.label)}`, s.label, { order: i + 1 }, { value: s.value, hint: s.hint, source: "authored" }));
authored.dashboard.rows.forEach((s: any, i: number) => entry("habit", `habit-${slug(s.habit)}`, s.habit, { order: i + 1 }, { streak: Number(s.streak), habit_status: s.status.toLowerCase(), time: s.time, source: "authored" }));

// block catalog
catalog.forEach((b, i) => entry("block", `block-${b.id}`, b.name, { slug: b.id, excerpt: b.docs, order: i + 1 }, { category: b.category, runtimes: b.runtimes, figma_node: b.figma, source: b.figma ? "figma" : "authored" }));

// design tokens (shadcn roles + brand extras)
for (const [mode, set] of Object.entries(tokens.color) as Array<[string, Record<string, any>]>)
  for (const [k, v] of Object.entries(set))
    entry("design-token", `token-${mode}-${k}`, `--${k}`, { slug: `${mode}-${k}` }, { group: "color", scope: "shadcn", mode, value: v.hsl, hex: v.hex, source: v.source });
for (const [mode, set] of Object.entries(tokens.brand) as Array<[string, Record<string, any>]>)
  for (const [k, v] of Object.entries(set))
    entry("design-token", `token-brand-${mode}-${k}`, `--${k}`, { slug: `brand-${mode}-${k}` }, { group: "color", scope: "app", mode, value: v.hsl, hex: v.hex, source: v.source });
entry("design-token", "token-radius", "--radius", { slug: "radius" }, { group: "radius", scope: "shadcn", mode: "all", value: tokens.radius.base, source: "figma-radius:40" });
entry("design-token", "token-font-sans", "--font-sans", { slug: "font-sans" }, { group: "font", scope: "shadcn", mode: "all", value: tokens.font.sans, source: "figma-font:Inter" });

// ---- settings, menus, dictionary ----------------------------------------------------------
const settings = { id: "site", locale: LOCALE, title: "Habitus", description: txt("1:288"), language: "en", timezone: "Europe/Moscow", logo_media_id: "media-brand-mark", front_page_id: "page-home", currency: "USD", version: 1, created_at: AT, updated_at: AT };
const menu = (id: string, location: string, items: Array<[string, string]>) => ({ id, location, locale: LOCALE, items: items.map(([label, url], i) => ({ id: `${id}-${slug(label)}`, label, url, order: i + 1 })) });
const menus = [
  menu("header", "header", [[txt("1:293"), "#top"], [txt("1:294"), "#why"], [txt("1:295"), "#inside"], [txt("1:296"), "#blog"], [txt("1:297"), "#resources"], [txt("1:298"), "#about"]]),
  menu("footer-product", "footer", [[txt("1:31"), "#why"], [txt("1:33"), "#pricing"], [txt("1:35"), "#faq"], [txt("1:37"), "#blog"]]),
  menu("footer-company", "footer", [[txt("1:42"), "#about"], [txt("1:44"), "#contact"], [txt("1:46"), "#privacy"]]),
  menu("social", "footer", [["Instagram", "#instagram"], ["LinkedIn", "#linkedin"]]),
];
const dictionary = {
  locale: LOCALE,
  messages: {
    "site.name": "Habitus",
    "site.skip": "Skip to content",
    "nav.label": "Main navigation",
    "nav.login": txt("1:291"),
    "footer.product": txt("1:28"),
    "footer.company": txt("1:39"),
    "footer.social": "Social links",
    "footer.newsletter": txt("1:47"),
    "footer.newsletter_text": txt("1:53"),
    "footer.email_label": "Email address",
    "footer.email_placeholder": txt("1:50"),
    "footer.subscribe": txt("1:52"),
    "footer.copyright": txt("1:55"),
    "faq.view_all": txt("1:58"),
    "pricing.included": "Included",
    "pricing.not_included": "Not included",
    "proof.logos": "Companies using Habitus",
    "gallery.label": "App screenshots",
    ...Object.fromEntries(Object.entries(authored).filter(([k, v]) => typeof v === "object" && !Array.isArray(v) && !["faq_answers", "dashboard"].includes(k) && !k.startsWith("$"))
      .flatMap(([k, v]) => Object.entries(v as Record<string, unknown>).filter(([, s]) => typeof s === "string").map(([kk, s]) => [`${k}.${kk}`, s]))),
    ...Object.fromEntries((authored.settings.options as string[]).map((o, i) => [`settings.option_${i + 1}`, o])),
  },
};

// ---- manifest (kinds + typed metadata) ----------------------------------------------------
const f = (id: string, type: string, extra: Record<string, unknown> = {}) => ({ id, label: id.replace(/_/g, " "), type, ...extra });
const src = f("source", "select", { options: [{ value: "figma", label: "Figma" }, { value: "authored", label: "Authored" }] });
const res = (id: string, label: string, fields: any[]) => ({ record: { id, label, scope: "tenant", schema_version: "1", owner_module: "saas-design", fields } });
const manifest = {
  name: "saas-design", version: "1",
  resources: [
    res("page", "Pages", [f("figma_node", "string"), f("sections", "collection", { items: f("section", "string") })]),
    res("section", "Page sections", [f("figma_node", "string", { required: true }), f("block", "string", { required: true }), f("badge", "string"), f("primary_label", "string"), f("primary_href", "string"), f("secondary_label", "string"), f("secondary_href", "string"), f("login_label", "string"), f("login_href", "string"), f("link_label", "string"), f("link_href", "string"), f("media", "collection", { items: f("media_id", "string") }), f("logos", "collection", { items: f("media_id", "string") }), f("items", "collection", { items: f("entry_id", "string") }), f("newsletter_title", "string"), f("newsletter_text", "string"), f("email_placeholder", "string"), f("submit_label", "string"), f("copyright", "string"), f("source_label", "string"), f("source_href", "string")]),
    res("media", "Media", [f("file", "string", { required: true }), f("public_path", "string", { required: true }), f("mime", "string", { required: true }), f("width", "number", { rules: [{ name: "fastygo.codex/integer" }] }), f("height", "number", { rules: [{ name: "fastygo.codex/integer" }] }), f("alt", "string", { required: true }), f("figma_hash", "string"), f("figma_node", "string"), src]),
    res("feature", "Features", [f("icon", "string", { required: true }), f("figma_node", "string"), src]),
    res("testimonial", "Testimonials", [f("role", "string", { required: true }), src]),
    res("plan", "Plans", [f("price", "number", { required: true, rules: [{ name: "fastygo.codex/money", args: { currency_field: "currency" } }] }), f("currency", "string", { required: true }), f("price_label", "string", { required: true }), f("period", "string"), f("features", "collection", { items: f("feature", "object", { fields: [f("label", "string", { required: true }), f("included", "boolean", { required: true })] }) }), f("cta_label", "string", { required: true }), f("cta_href", "string", { required: true }), f("featured", "boolean"), f("badge", "string"), src]),
    res("faq", "FAQ", [f("tone", "select", { options: ["primary", "pink", "lilac", "sky", "muted"].map((v) => ({ value: v, label: v })) }), f("answer_source", "string"), src]),
    res("stat", "Stats", [f("value", "string", { required: true }), src]),
    res("step", "Steps", [f("icon", "string", { required: true }), src]),
    res("integration", "Integrations", [f("icon", "string", { required: true }), src]),
    res("member", "Team members", [f("role", "string", { required: true }), src]),
    res("post", "Posts", [f("tag", "string"), src]),
    res("release", "Releases", [f("release_version", "string", { required: true }), src]),
    res("comparison-row", "Comparison rows", [f("free", "boolean", { required: true }), f("premium", "boolean", { required: true }), src]),
    res("metric", "Metrics", [f("value", "string", { required: true }), f("hint", "string"), src]),
    res("habit", "Habits", [f("streak", "number", { rules: [{ name: "fastygo.codex/integer" }] }), f("habit_status", "select", { options: [{ value: "done", label: "Done" }, { value: "pending", label: "Pending" }] }), f("time", "string"), src]),
    res("block", "Design-system blocks", [f("category", "string", { required: true }), f("runtimes", "collection", { items: f("runtime", "string") }), f("figma_node", "string"), src]),
    res("design-token", "Design tokens", [f("group", "select", { required: true, options: ["color", "radius", "font"].map((v) => ({ value: v, label: v })) }), f("scope", "select", { required: true, options: [{ value: "shadcn", label: "shadcn set (packages)" }, { value: "app", label: "app level only" }] }), f("mode", "string", { required: true }), f("value", "string", { required: true }), f("hex", "string"), f("source", "string")]),
  ],
};

// ---- write ----------------------------------------------------------------------------------
const R = "fixtures/content/records";
put(`${R}/manifest.json`, manifest);
put(`${R}/settings/site.json`, settings);
for (const m of menus) put(`${R}/menus/${m.id}.json`, m);
put(`${R}/dictionaries/en.json`, dictionary);
for (const e of entries) put(`${R}/entries/${e.kind}/${e.id}.json`, e);
for (const [p, s] of svgOut) out.set(p, s);

let drift = 0;
const listAll = (d: string): string[] => !existsSync(join(ROOT, d)) ? [] : readdirSync(join(ROOT, d), { withFileTypes: true }).flatMap((x) => x.isDirectory() ? listAll(`${d}/${x.name}`) : [`${d}/${x.name}`]);
const stale = [...listAll(R), ...listAll("fixtures/media/svg")].filter((p) => !out.has(p));
for (const p of stale) { if (CHECK) { console.error(`drift: stale ${p}`); drift++; } else rmSync(join(ROOT, p)); }
for (const [p, s] of out) {
  const full = join(ROOT, p);
  if (existsSync(full) && readFileSync(full, "utf8") === s) continue;
  if (CHECK) { console.error(`drift: ${p} (run: bun run content)`); drift++; continue; }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, s);
}
console.log(`${CHECK ? "checked" : "wrote"} ${entries.length} entries, ${menus.length} menus, 1 settings, 1 dictionary, ${svgOut.size} svg`);
if (drift) process.exit(1);
