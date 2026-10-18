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


// ---- design-system catalog demo data (every block, both runtimes) ----
const date = (e: any) => String(e.published_at ?? e.created_at).slice(0, 10);
const human = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const planView = (p: Entry) => ({ theme: m(p, "featured", false) ? "dark" : "light", name: p.title, badge: m(p, "badge", ""), description: p.excerpt ?? "", price: m(p, "price_label"), period: m(p, "period", ""), features: m(p, "features"), cta: { label: m(p, "cta_label"), href: m(p, "cta_href") } });
const fld = (label: string, name: string, type: string, autocomplete: string, placeholder = "") => ({ label, name, type, placeholder, autocomplete });
const logos = (m(sec("social-proof"), "logos") as string[]).map(media);
const screen = (id: string) => media(`media-screen-${id}`);
const catalogData: Record<string, any> = {
  ...Object.fromEntries(home.blocks.map((b) => [b.block, b.data])),
  navbar: nav,
  "announcement-bar": { label: "Announcement", text: t("announcement.text"), link: { label: t("announcement.link"), href: "#changelog" } },
  "hero-centered": { eyebrow: m(hero, "badge"), title: hero.title, lead: hero.excerpt, primary: { label: m(hero, "primary_label"), href: m(hero, "primary_href") }, secondary: { label: m(hero, "secondary_label"), href: m(hero, "secondary_href") } },
  "hero-split": { title: hero.title, lead: hero.excerpt, primary: { label: m(hero, "primary_label"), href: m(hero, "primary_href") }, secondary: { label: m(hero, "secondary_label"), href: m(hero, "secondary_href") }, image: screen("habit-tracker") },
  "logo-cloud": { title: t("proof.logos"), logos },
  "stats-row": { title: "Habitus in numbers", items: ofKind("stat").map((e) => ({ value: m(e, "value"), label: e.title })) },
  "feature-grid": { title: "Everything you need to stick with it", lead: sec("why").excerpt, items: ofKind("feature").map((f) => ({ icon: m(f, "icon"), title: f.title, text: f.excerpt })) },
  "feature-split": { title: "Built around your day", lead: sec("inside").excerpt, items: ofKind("feature").slice(0, 3).map((f) => ({ title: f.title, text: f.excerpt })), image: screen("dashboard") },
  steps: { title: "How it works", lead: "Three steps from intention to routine.", items: ofKind("step").map((e) => ({ icon: m(e, "icon"), title: e.title, text: e.excerpt })) },
  integrations: { title: "Works with your tools", lead: "Bring the data you already track.", items: ofKind("integration").map((e) => ({ icon: m(e, "icon"), name: e.title, text: e.excerpt })) },
  "pricing-three-tiers": { title: sec("pricing").title, lead: sec("pricing").excerpt, plans: ofKind("plan").map(planView) },
  "comparison-table": { title: "Compare plans", feature: "Feature", free: get("plan-free").title, premium: get("plan-premium").title, yes: t("pricing.included"), no: t("pricing.not_included"), rows: ofKind("comparison-row").map((e) => ({ feature: e.title, free: m(e, "free"), premium: m(e, "premium") })) },
  "testimonial-quote": (() => { const e = ofKind("testimonial")[0]!; return { label: "Testimonial", quote: `"${e.content}"`, name: e.title, role: m(e, "role"), avatar: media(e.featured_media_id!) }; })(),
  "team-grid": { title: "The people behind Habitus", lead: "A small team that ships every week.", members: ofKind("member").map((e) => ({ name: e.title, role: m(e, "role"), avatar: media(e.featured_media_id!) })) },
  "blog-cards": { title: "From the blog", lead: "Short reads on building habits that last.", posts: ofKind("post").map((e) => ({ title: e.title, excerpt: e.excerpt, tag: m(e, "tag"), datetime: date(e), date: human(date(e)), href: `#blog/${e.slug}`, image: media(e.featured_media_id!) })) },
  changelog: { title: "Changelog", lead: "What shipped recently.", items: ofKind("release").sort((a, b) => (b.order ?? 0) - (a.order ?? 0)).map((e) => ({ version: m(e, "release_version"), datetime: date(e), date: human(date(e)), title: e.title, text: e.excerpt })) },
  "faq-accordion": { title: sec("faq").title, lead: sec("faq").excerpt, items: ofKind("faq").filter((f) => !f.slug.endsWith("-2")).map((f, i) => ({ question: f.title, answer: f.content, open: i === 0 })) },
  "cta-centered": { title: sec("cta").title, text: "Start free today. Upgrade when you are ready.", primary: { label: m(sec("cta"), "primary_label"), href: "#pricing" }, secondary: { label: m(hero, "secondary_label"), href: "#inside" } },
  "app-download": { title: t("download.title"), text: t("download.text"), ios: { label: t("download.ios"), href: "#ios" }, android: { label: t("download.android"), href: "#android" }, image: screen("goals") },
  "newsletter-band": { title: t("footer.newsletter"), text: t("footer.newsletter_text"), label: t("footer.email_label"), placeholder: t("footer.email_placeholder"), button: t("footer.subscribe"), action: "#newsletter" },
  "contact-form": { title: t("contact.title"), text: t("contact.text"), name: fld(t("contact.name"), "name", "text", "name"), email: fld(t("contact.email"), "email", "email", "email"), message: { label: t("contact.message"), placeholder: "" }, send: t("contact.send"), action: "#contact" },
  "login-card": { title: t("auth.login_title"), text: t("auth.login_text"), fields: [fld(t("auth.email"), "login-email", "email", "email"), fld(t("auth.password"), "login-password", "password", "current-password")], submit: t("auth.login"), action: "#login", note: "", link: { label: t("auth.forgot"), href: "#forgot" } },
  "signup-card": { title: t("auth.signup_title"), text: t("auth.signup_text"), fields: [fld(t("auth.name"), "signup-name", "text", "name"), fld(t("auth.email"), "signup-email", "email", "email"), fld(t("auth.password"), "signup-password", "password", "new-password")], submit: t("auth.signup"), action: "#signup", note: t("auth.terms"), link: { label: "Terms", href: "#terms" } },
  "settings-panel": { title: t("settings.title"), text: t("settings.text"), options: [1, 2, 3].map((i) => ({ id: `settings-option-${i}`, label: t(`settings.option_${i}`), checked: i !== 3 })), save: t("settings.save"), action: "#settings" },
  "dashboard-stats": { title: "This week", cards: ofKind("metric").map((e) => ({ label: e.title, value: m(e, "value"), hint: m(e, "hint") })) },
  "habits-table": { title: "Today", columns: { habit: "Habit", streak: "Streak", time: "Time", status: "Status" }, rows: ofKind("habit").map((e) => ({ habit: e.title, streak: `${m(e, "streak")} days`, time: m(e, "time"), status: m(e, "habit_status") === "done" ? "Done" : "Pending", tone: m(e, "habit_status") === "done" ? "done" : "pending" })) },
  "empty-state": { title: t("empty.title"), text: t("empty.text"), cta: { label: t("empty.cta"), href: "#new" } },
  "not-found": { code: t("not_found.code"), title: t("not_found.title"), text: t("not_found.text"), cta: { label: t("not_found.cta"), href: "/" } },
  "cookie-banner": { label: "Cookie consent", text: t("cookie.text"), accept: t("cookie.accept"), decline: t("cookie.decline") },
  "footer-simple": { label: "Footer", brand: site.title, href: "#top", links: [...menu("footer-product"), ...menu("footer-company")], copyright: t("footer.copyright") },
};
const catalogMeta = JSON.parse(readFileSync(join(ROOT, "packages/blocks/catalog.json"), "utf8")) as Array<{ id: string }>;
const catalog = { blocks: catalogMeta.map(({ id }) => { if (!catalogData[id]) throw new Error(`no catalog data for block ${id}`); return { block: id, data: catalogData[id] }; }) };

const out: Record<string, unknown> = { "fixtures/views/home.json": home, "fixtures/views/blocks.json": catalog };
let drift = 0;
for (const [rel, v] of Object.entries(out)) {
  const body = JSON.stringify(v, null, 2) + "\n"; const p = join(ROOT, rel);
  if (CHECK) { if (!existsSync(p) || readFileSync(p, "utf8") !== body) { console.error(`drift: ${rel}`); drift++; } }
  else writeFileSync(p, body);
}
console.log(`views: ${Object.keys(out).length} files, home ${home.blocks.length} blocks ${CHECK ? "checked" : "written"}`);
if (drift) process.exit(1);
