/**
 * Design-system blocks beyond the Figma frame (same brand grammar, authored content).
 * Every block renders in both runtimes from this one definition.
 */
import { $, block, c, each, h, icon, unless, when, type Node } from "../scripts/dsl";

const link = { label: "string", href: "string" };
const img = { src: "string", alt: "string" };
const field = { label: "string", name: "string", type: "string", placeholder: "string", autocomplete: "string" };
const plan = { theme: "string", name: "string", badge: "string", description: "string", price: "string", period: "string", features: [{ label: "string", included: "bool" }], cta: link };

/** Section shell: <section> Block › Container. */
const section = (id: string, o: { css?: string; container?: string; labelled?: boolean } = {}, ...children: Node[]) =>
  c("Block", { tag: "section", ...(o.labelled === false ? {} : { "aria-labelledby": `${id}-title` }), ...(o.css ? { css: o.css } : { kit: "section" }) },
    c("Container", o.container === "" ? { kit: "section-container-narrow" } : o.container ? { ui: "container", css: o.container } : { kit: "section-container" }, ...children));
/** Header: Title (h2) + lead. */
const head = (id: string, center = false, lead = true) =>
  c("Stack", { ui: "head", css: `flex flex-col gap-4 ${center ? "items-center text-center" : ""}` },
    c("Title", { as: "h2", id: `${id}-title`, kit: "section-title" }, $("title")),
    ...(lead ? [c("Text", { kit: "section-lead" }, $("lead"))] : []));
const planCard = (prefix: string) =>
  c("ListItem", { ui: "plan", "data-theme": $("plan.theme"), variants: { theme: { default: "bg-card", dark: "bg-background inset-ring inset-ring-input" } }, vary: { theme: $("plan.theme") }, css: "flex flex-col gap-8 rounded-lg p-10 text-card-foreground" },
    c("Group", { ui: "plan-name-row", css: "justify-between gap-4" },
      c("Title", { as: "h3", ui: "plan-name", css: "text-2xl font-semibold" }, $("plan.name")),
      when($("plan.badge"), c("Badge", {}, $("plan.badge")))),
    c("Text", { kit: "muted" }, $("plan.description")),
    c("Text", { ui: "price", css: "flex items-baseline gap-2" },
      c("Inline", { ui: "price-value", css: "text-4xl font-bold" }, $("plan.price")),
      when($("plan.period"), c("Inline", { kit: "muted" }, $("plan.period")))),
    c("List", { kit: "stack-4" },
      each($("plan.features"), "f", c("ListItem", { ui: "feature", css: "flex items-center gap-4" },
        when($("f.included"), icon("check", { ui: "check", css: "size-4 text-primary" })),
        unless($("f.included"), icon("x", { ui: "cross", css: "size-4 text-muted-foreground" })),
        $("f.label")))),
    c("Button", { ui: "plan-cta", variant: "secondary", size: "lg", href: $("plan.cta.href"), css: "mt-auto w-full" }, $("plan.cta.label")));
const fieldNode = (prefix: string, path: string) =>
  c("FormItem", { ui: "field" },
    c("Label", { ui: "label", for: $(`${path}.name`) }, $(`${path}.label`)),
    c("Input", { ui: "input", id: $(`${path}.name`), name: $(`${path}.name`), type: $(`${path}.type`), placeholder: $(`${path}.placeholder`), autocomplete: $(`${path}.autocomplete`), required: true }));

export const announcementBar = block({
  id: "announcement-bar", title: "Announcement bar", category: "navigation",
  description: "One-line release note above the navbar with a link.",
  schema: { label: "string", text: "string", link },
  root: c("Block", { tag: "aside", "aria-label": $("label"), css: "bg-secondary text-secondary-foreground" },
    c("Container", { ui: "container", css: "mx-auto flex max-w-page flex-wrap items-center justify-center gap-4 px-6 py-2 text-sm" },
      c("Text", { ui: "text" }, $("text")),
      c("Link", { ui: "link", href: $("link.href"), css: "font-semibold text-current underline" }, $("link.label"), icon("arrow-right", { kit: "icon-sm" })))),
});

export const heroCentered = block({
  id: "hero-centered", title: "Hero centered", category: "hero",
  description: "Muted band with eyebrow badge, headline, lead and two actions.",
  schema: { eyebrow: "string", title: "string", lead: "string", primary: link, secondary: link },
  root: section("hero-centered", { css: "px-8 pt-8", container: "mx-auto flex max-w-page flex-col items-center gap-8 rounded-lg bg-muted px-6 py-24 text-center" },
    c("Badge", { variant: "outline", size: "lg" }, $("eyebrow")),
    c("Title", { as: "h1", id: "hero-centered-title", ui: "title", css: "max-w-3xl text-6xl leading-none font-semibold" }, $("title")),
    c("Text", { ui: "lead", css: "max-w-2xl text-xl text-muted-foreground" }, $("lead")),
    c("Group", { ui: "actions", css: "flex-wrap justify-center gap-4" },
      c("Button", { size: "lg", href: $("primary.href") }, $("primary.label")),
      c("Button", { variant: "outline", size: "lg", href: $("secondary.href") }, $("secondary.label")))),
});

export const heroSplit = block({
  id: "hero-split", title: "Hero split", category: "hero",
  description: "Headline and actions beside an app screen on an accent panel.",
  schema: { title: "string", lead: "string", primary: link, secondary: link, image: img },
  root: section("hero-split", { css: "py-16", container: "mx-auto grid max-w-page grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-0" },
    c("Stack", { ui: "copy", css: "flex flex-col items-start gap-8" },
      c("Title", { as: "h1", id: "hero-split-title", ui: "title", css: "text-6xl leading-none font-semibold" }, $("title")),
      c("Text", { ui: "lead", css: "text-xl text-muted-foreground" }, $("lead")),
      c("Group", { ui: "actions", css: "flex-wrap gap-4" },
        c("Button", { size: "lg", href: $("primary.href") }, $("primary.label")),
        c("Button", { variant: "ghost", size: "lg", href: $("secondary.href") }, icon("play", { kit: "icon-sm" }), $("secondary.label")))),
    c("Box", { ui: "art", css: "flex justify-center rounded-lg bg-accent px-12 pt-12" },
      c("Image", { ui: "image", src: $("image.src"), alt: $("image.alt"), css: "w-1/2 rounded-t-md" }))),
});

export const logoCloud = block({
  id: "logo-cloud", title: "Logo cloud", category: "social-proof",
  description: "Caption over a row of customer logos.",
  schema: { title: "string", logos: [img] },
  root: section("logo-cloud", { css: "py-16", container: "mx-auto flex max-w-page flex-col items-center gap-8 px-6" },
    c("Title", { as: "h2", id: "logo-cloud-title", ui: "title", css: "text-base font-medium text-muted-foreground" }, $("title")),
    c("List", { ui: "logos", css: "flex flex-wrap items-center justify-center gap-12" },
      each($("logos"), "logo", c("ListItem", {}, c("Image", { ui: "logo", variant: "logo", src: $("logo.src"), alt: $("logo.alt"), css: "h-10 w-auto dark:brightness-0 dark:invert" }))))),
});

export const statsRow = block({
  id: "stats-row", title: "Stats row", category: "social-proof",
  description: "Four headline numbers with labels.",
  schema: { title: "string", items: [{ value: "string", label: "string" }] },
  root: section("stats-row", {},
    c("Title", { as: "h2", id: "stats-row-title", ui: "title", css: "sr-only" }, $("title")),
    c("List", { ui: "list", css: "grid grid-cols-2 gap-6 lg:grid-cols-4" },
      each($("items"), "s", c("ListItem", { ui: "item", css: "flex flex-col gap-2 rounded-lg bg-muted p-8" },
        c("Inline", { kit: "section-title" }, $("s.value")),
        c("Inline", { kit: "muted" }, $("s.label")))))),
});

export const featureGrid = block({
  id: "feature-grid", title: "Feature grid", category: "features",
  description: "Six features with icon badges on a plain grid.",
  schema: { title: "string", lead: "string", items: [{ icon: "string", title: "string", text: "string" }] },
  root: section("feature-grid", {},
    head("feature-grid", true),
    c("List", { ui: "grid", css: "grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3" },
      each($("items"), "item", c("ListItem", { ui: "item", css: "flex flex-col gap-4" },
        c("IconBadge", { ui: "badge", css: "size-12 rounded-full bg-primary text-primary-foreground" }, icon($("item.icon"), { ui: "icon", css: "size-6" })),
        c("Title", { as: "h3", kit: "item-title" }, $("item.title")),
        c("Text", { kit: "muted" }, $("item.text")))))),
});

export const featureSplit = block({
  id: "feature-split", title: "Feature split", category: "features",
  description: "Checklist of benefits beside an app screen.",
  schema: { title: "string", lead: "string", items: [{ title: "string", text: "string" }], image: img },
  root: section("feature-split", { container: "mx-auto grid max-w-page grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-0" },
    c("Box", { ui: "art", css: "flex justify-center rounded-lg bg-chart-3 px-12 pt-16" },
      c("Image", { ui: "image", src: $("image.src"), alt: $("image.alt"), css: "w-1/2 rounded-t-md" })),
    c("Stack", { ui: "copy", css: "flex flex-col gap-8" },
      head("feature-split"),
      c("List", { ui: "list", css: "flex flex-col gap-6" },
        each($("items"), "item", c("ListItem", { ui: "item", css: "flex gap-4" },
          icon("circle-check", { ui: "check", css: "size-6 shrink-0 text-primary" }),
          c("Stack", { kit: "stack-2" },
            c("Title", { as: "h3", kit: "item-title-sm" }, $("item.title")),
            c("Text", { kit: "muted" }, $("item.text")))))))),
});

export const steps = block({
  id: "steps", title: "Steps", category: "features",
  description: "Ordered three-step explainer.",
  schema: { title: "string", lead: "string", items: [{ icon: "string", title: "string", text: "string" }] },
  root: section("steps", {},
    head("steps", true),
    c("List", { tag: "ol", ui: "list", css: "grid grid-cols-1 gap-10 md:grid-cols-3" },
      each($("items"), "item", c("ListItem", { ui: "item", css: "flex flex-col gap-4 rounded-lg bg-muted p-10" },
        icon($("item.icon"), { ui: "icon", css: "size-6 text-primary" }),
        c("Title", { as: "h3", kit: "item-title" }, $("item.title")),
        c("Text", { kit: "muted" }, $("item.text"))))),
  ),
  extraCss: `.ui-steps-list { counter-reset: step; }
.ui-steps-item { counter-increment: step; }`,
});

export const integrations = block({
  id: "integrations", title: "Integrations", category: "features",
  description: "Grid of integration cards.",
  schema: { title: "string", lead: "string", items: [{ icon: "string", name: "string", text: "string" }] },
  root: section("integrations", {},
    head("integrations"),
    c("List", { ui: "grid", css: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" },
      each($("items"), "item", c("ListItem", { ui: "item", css: "flex items-start gap-4 rounded-lg bg-card p-8 inset-ring inset-ring-border" },
        c("IconBadge", { ui: "badge", css: "size-12 shrink-0 rounded-full bg-accent text-accent-foreground" }, icon($("item.icon"), { ui: "icon", css: "size-6" })),
        c("Stack", { kit: "stack-2" },
          c("Title", { as: "h3", kit: "item-title-sm" }, $("item.name")),
          c("Text", { kit: "muted-sm" }, $("item.text"))))))),
});

export const pricingThreeTiers = block({
  id: "pricing-three-tiers", title: "Pricing, three tiers", category: "pricing",
  description: "Free, Premium (dark scope) and Team plans.",
  schema: { title: "string", lead: "string", plans: [plan] },
  root: section("pricing-three-tiers", {},
    head("pricing-three-tiers", true),
    c("List", { ui: "plans", css: "grid grid-cols-1 gap-6 lg:grid-cols-3" }, each($("plans"), "plan", planCard("pricing-three-tiers")))),
});

export const comparisonTable = block({
  id: "comparison-table", title: "Comparison table", category: "pricing",
  description: "Feature matrix for Free vs Premium.",
  schema: { title: "string", feature: "string", free: "string", premium: "string", yes: "string", no: "string", rows: [{ feature: "string", free: "bool", premium: "bool" }] },
  root: section("comparison-table", {},
    head("comparison-table", false, false),
    c("Box", { ui: "scroll", css: "overflow-x-auto rounded-lg inset-ring inset-ring-border" },
      c("Table", { ui: "table", css: "w-full text-left" },
        c("TableHead", { ui: "thead", css: "bg-muted" },
          c("TableRow", {},
            c("TableHeadCell", { ui: "th", scope: "col", css: "px-6 py-4 font-semibold" }, $("feature")),
            c("TableHeadCell", { ui: "th-plan", scope: "col", css: "px-6 py-4 text-center font-semibold" }, $("free")),
            c("TableHeadCell", { ui: "th-plan-2", scope: "col", css: "px-6 py-4 text-center font-semibold" }, $("premium")))),
        c("TableBody", {},
          each($("rows"), "r", c("TableRow", { ui: "row", css: "border-t border-border" },
            c("TableHeadCell", { ui: "feature", scope: "row", css: "px-6 py-4 font-normal" }, $("r.feature")),
            c("TableCell", { ui: "cell", css: "px-6 py-4 text-center" },
              when($("r.free"), icon("check", { ui: "yes", css: "mx-auto size-4 text-primary" }), c("Inline", { ui: "sr", css: "sr-only" }, $("yes"))),
              unless($("r.free"), icon("x", { ui: "no", css: "mx-auto size-4 text-muted-foreground" }), c("Inline", { ui: "sr-2", css: "sr-only" }, $("no")))),
            c("TableCell", { ui: "cell-2", css: "px-6 py-4 text-center" },
              when($("r.premium"), icon("check", { ui: "yes-2", css: "mx-auto size-4 text-primary" }), c("Inline", { ui: "sr-3", css: "sr-only" }, $("yes"))),
              unless($("r.premium"), icon("x", { ui: "no-2", css: "mx-auto size-4 text-muted-foreground" }), c("Inline", { ui: "sr-4", css: "sr-only" }, $("no")))))))))),
});

export const testimonialQuote = block({
  id: "testimonial-quote", title: "Testimonial quote", category: "testimonials",
  description: "One large quote with author on a pink panel.",
  schema: { label: "string", quote: "string", name: "string", role: "string", avatar: img },
  root: c("Block", { tag: "section", "aria-label": $("label"), css: "py-24" },
    c("Container", { ui: "container", css: "mx-auto max-w-page px-6 lg:px-0" },
      c("Box", { ui: "panel", css: "flex flex-col items-center gap-8 rounded-lg bg-chart-5 px-12 py-20 text-center text-foreground" },
        h("blockquote", { ui: "quote", css: "max-w-3xl text-3xl leading-10 font-medium" }, c("Text", {}, $("quote"))),
        c("Group", { ui: "author", css: "gap-4" },
          c("Image", { ui: "avatar", variant: "avatar", src: $("avatar.src"), alt: $("avatar.alt") }),
          c("Stack", { ui: "who", css: "flex flex-col items-start" },
            c("Inline", { ui: "name", css: "font-bold" }, $("name")),
            c("Inline", { kit: "muted" }, $("role"))))))),
});

export const teamGrid = block({
  id: "team-grid", title: "Team grid", category: "about",
  description: "People with avatar, name and role.",
  schema: { title: "string", lead: "string", members: [{ name: "string", role: "string", avatar: img }] },
  root: section("team-grid", {},
    head("team-grid", true),
    c("List", { kit: "grid-3" },
      each($("members"), "m", c("ListItem", { ui: "member", css: "flex flex-col items-center gap-4 rounded-lg bg-muted p-10 text-center" },
        c("Image", { ui: "avatar", variant: "avatar", size: "xl", src: $("m.avatar.src"), alt: $("m.avatar.alt") }),
        c("Title", { as: "h3", kit: "item-title" }, $("m.name")),
        c("Text", { kit: "muted" }, $("m.role")))))),
});

export const blogCards = block({
  id: "blog-cards", title: "Blog cards", category: "content",
  description: "Three latest posts with image, tag, date and excerpt.",
  schema: { title: "string", lead: "string", posts: [{ title: "string", excerpt: "string", date: "string", datetime: "string", tag: "string", href: "string", image: img }] },
  root: section("blog-cards", {},
    head("blog-cards"),
    c("List", { kit: "grid-3" },
      each($("posts"), "post", c("ListItem", { ui: "post", css: "flex flex-col overflow-hidden rounded-lg bg-card" },
        c("Box", { ui: "media", css: "flex aspect-video justify-center overflow-hidden bg-accent pt-8" },
          c("Image", { ui: "image", src: $("post.image.src"), alt: $("post.image.alt"), css: "w-1/3 self-start rounded-t-md" })),
        c("Stack", { ui: "body", css: "flex flex-col gap-4 p-8" },
          c("Group", { ui: "meta", css: "gap-4 text-sm text-muted-foreground" },
            c("Badge", { variant: "outline" }, $("post.tag")),
            h("time", { ui: "date", datetime: $("post.datetime") }, $("post.date"))),
          c("Title", { as: "h3", kit: "item-title" },
            c("Link", { ui: "post-link", href: $("post.href"), css: "text-foreground hover:underline" }, $("post.title"))),
          c("Text", { kit: "muted" }, $("post.excerpt"))))))),
});

export const changelog = block({
  id: "changelog", title: "Changelog", category: "content",
  description: "Release timeline with version badges.",
  schema: { title: "string", lead: "string", items: [{ version: "string", date: "string", datetime: "string", title: "string", text: "string" }] },
  root: section("changelog", { container: "" },
    head("changelog"),
    c("List", { tag: "ol", ui: "list", css: "flex flex-col gap-10 border-l border-border pl-8" },
      each($("items"), "r", c("ListItem", { ui: "item", css: "flex flex-col gap-2" },
        c("Group", { ui: "meta", css: "gap-4" },
          c("Badge", {}, $("r.version")),
          h("time", { ui: "date", datetime: $("r.datetime"), css: "text-sm text-muted-foreground" }, $("r.date"))),
        c("Title", { as: "h3", kit: "item-title" }, $("r.title")),
        c("Text", { kit: "muted" }, $("r.text")))))),
});

export const faqAccordion = block({
  id: "faq-accordion", title: "FAQ accordion", category: "faq",
  description: "Native details/summary list; first item open.",
  schema: { title: "string", lead: "string", items: [{ question: "string", answer: "string", open: "bool" }] },
  root: section("faq-accordion", { container: "" },
    head("faq-accordion", true),
    c("Stack", { ui: "list", css: "flex flex-col gap-4" },
      each($("items"), "item", c("Disclosure", { ui: "item", open: $("item.open"), css: "rounded-lg bg-muted px-8 py-6" },
        c("Summary", { ui: "question", css: "flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium" },
          $("item.question"), icon("chevron-down", { ui: "chevron", css: "size-4 shrink-0" })),
        c("Text", { ui: "answer", css: "pt-4 text-muted-foreground" }, $("item.answer")))))),
  extraCss: `.ui-faq-accordion-question > [data-slot="summary-indicator"] { @apply hidden; }
  .ui-faq-accordion-item[open] .ui-faq-accordion-chevron { @apply rotate-180; }
.ui-faq-accordion-question::-webkit-details-marker { @apply hidden; }`,
});

export const ctaCentered = block({
  id: "cta-centered", title: "CTA centered", category: "cta",
  description: "Primary band with headline and two actions.",
  schema: { title: "string", text: "string", primary: link, secondary: link },
  root: section("cta-centered", { container: "mx-auto flex max-w-page flex-col items-center gap-8 rounded-lg bg-primary px-6 py-20 text-center text-primary-foreground" },
    c("Title", { as: "h2", id: "cta-centered-title", ui: "title", css: "max-w-2xl text-5xl font-bold" }, $("title")),
    c("Text", { ui: "text", css: "max-w-xl text-xl" }, $("text")),
    c("Group", { ui: "actions", css: "flex-wrap justify-center gap-4" },
      c("Button", { variant: "contrast", size: "lg", href: $("primary.href") }, $("primary.label")),
      c("Button", { variant: "secondary", size: "lg", href: $("secondary.href") }, $("secondary.label")))),
});

export const appDownload = block({
  id: "app-download", title: "App download", category: "cta",
  description: "Store buttons beside a phone on a dark panel.",
  schema: { title: "string", text: "string", ios: link, android: link, image: img },
  root: section("app-download", { container: "mx-auto grid max-w-page grid-cols-1 items-center gap-12 overflow-hidden rounded-lg bg-background px-12 pt-16 text-foreground lg:grid-cols-2" },
    c("Stack", { ui: "copy", "data-theme": "dark", css: "flex flex-col items-start gap-6 pb-16" },
      c("Title", { as: "h2", id: "app-download-title", kit: "section-title" }, $("title")),
      c("Text", { ui: "text", css: "text-xl text-muted-foreground" }, $("text")),
      c("Group", { ui: "stores", css: "flex-wrap gap-4" },
        c("Button", { variant: "secondary", size: "lg", href: $("ios.href") }, icon("apple", { ui: "apple", css: "size-6" }), $("ios.label")),
        c("Button", { variant: "outline", size: "lg", href: $("android.href") }, icon("smartphone", { ui: "phone", css: "size-6" }), $("android.label")))),
    c("Image", { ui: "image", src: $("image.src"), alt: $("image.alt"), css: "mx-auto w-1/2 self-end rounded-t-md" })),
  extraCss: `.ui-app-download-container:has(.ui-app-download-copy) { @apply bg-secondary text-secondary-foreground; }`,
});

export const newsletterBand = block({
  id: "newsletter-band", title: "Newsletter band", category: "forms",
  description: "Inline email signup on an accent band.",
  schema: { title: "string", text: "string", label: "string", placeholder: "string", button: "string", action: "string" },
  root: section("newsletter-band", { container: "mx-auto flex max-w-page flex-col items-center justify-between gap-8 rounded-lg bg-accent px-12 py-16 text-accent-foreground lg:flex-row" },
    c("Stack", { ui: "copy", css: "flex flex-col gap-2" },
      c("Title", { as: "h2", id: "newsletter-band-title", kit: "section-title-sm" }, $("title")),
      c("Text", { kit: "muted" }, $("text"))),
    c("Form", { ui: "form", action: $("action"), method: "post", css: "flex w-full max-w-md gap-2" },
      c("Label", { ui: "label", for: "newsletter-band-email", css: "sr-only" }, $("label")),
      c("Input", { ui: "input", id: "newsletter-band-email", type: "email", name: "email", autocomplete: "email", required: true, placeholder: $("placeholder") }),
      c("Button", { type: "submit" }, $("button")))),
});

export const contactForm = block({
  id: "contact-form", title: "Contact form", category: "forms",
  description: "Name, email and message with labels.",
  schema: { title: "string", text: "string", name: field, email: field, message: { label: "string", placeholder: "string" }, send: "string", action: "string" },
  root: section("contact-form", { container: "mx-auto grid max-w-page grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-0" },
    c("Stack", { ui: "copy", css: "flex flex-col gap-4" },
      c("Title", { as: "h2", id: "contact-form-title", kit: "section-title" }, $("title")),
      c("Text", { ui: "text", css: "text-xl text-muted-foreground" }, $("text"))),
    c("Form", { ui: "form", action: $("action"), method: "post", css: "flex flex-col gap-6 rounded-lg bg-muted p-10" },
      fieldNode("contact-form", "name"), fieldNode("contact-form", "email"),
      c("FormItem", { ui: "field-message" },
        c("Label", { ui: "label-message", for: "contact-form-message" }, $("message.label")),
        c("Textarea", { ui: "textarea", id: "contact-form-message", name: "message", rows: "4", placeholder: $("message.placeholder"), required: true })),
      c("Button", { type: "submit", css: "self-start" }, $("send")))),
});

const authCard = (id: string, title: string, fields: Node[], extra: Node[]) => block({
  id, title, category: "forms",
  description: `${title} with labelled fields on a centered card.`,
  schema: { title: "string", text: "string", fields: [field], submit: "string", action: "string", note: "string", link },
  root: section(id, { css: "py-24", container: "mx-auto flex max-w-md flex-col px-6" },
    c("Card", { ui: "card", css: "gap-8 p-10" },
      c("Stack", { ui: "head", css: "flex flex-col gap-2 text-center" },
        c("Title", { as: "h2", id: `${id}-title`, kit: "section-title-sm" }, $("title")),
        c("Text", { kit: "muted" }, $("text"))),
      c("Form", { ui: "form", action: $("action"), method: "post", css: "flex flex-col gap-6" },
        each($("fields"), "f", fieldNode(id, "f")),
        ...fields,
        c("Button", { type: "submit", size: "lg", css: "w-full" }, $("submit"))),
      ...extra)),
});
export const loginCard = authCard("login-card", "Login card", [], [
  c("Text", { ui: "foot", css: "text-center text-sm text-muted-foreground" }, $("note"), " ", c("Link", { href: $("link.href") }, $("link.label")))]);
export const signupCard = authCard("signup-card", "Signup card", [], [
  c("Text", { ui: "foot", css: "text-center text-sm text-muted-foreground" }, $("note"), " ", c("Link", { href: $("link.href") }, $("link.label")))]);

export const settingsPanel = block({
  id: "settings-panel", title: "Settings panel", category: "app",
  description: "Notification switches in a fieldset with a save action.",
  schema: { title: "string", text: "string", options: [{ id: "string", label: "string", checked: "bool" }], save: "string", action: "string" },
  root: section("settings-panel", { container: "mx-auto flex max-w-2xl flex-col px-6" },
    c("Form", { ui: "form", action: $("action"), method: "post", css: "flex flex-col gap-8 rounded-lg bg-card p-10" },
      c("Fieldset", { kit: "stack-6" },
        c("Legend", { ui: "legend", css: "mb-2 flex flex-col gap-2" },
          c("Title", { as: "h2", id: "settings-panel-title", ui: "title", css: "text-2xl font-semibold" }, $("title"))),
        c("Text", { kit: "muted" }, $("text")),
        each($("options"), "o", c("Group", { ui: "option", css: "justify-between gap-4 rounded-md bg-background px-6 py-4" },
          c("Label", { ui: "label", for: $("o.id"), css: "text-base font-normal" }, $("o.label")),
          c("Switch", { ui: "switch", id: $("o.id"), name: $("o.id"), checked: $("o.checked") })))),
      c("Button", { type: "submit", css: "self-end" }, $("save")))),
});

export const dashboardStats = block({
  id: "dashboard-stats", title: "Dashboard stats", category: "app",
  description: "KPI cards for today, streak, week and focus time.",
  schema: { title: "string", cards: [{ label: "string", value: "string", hint: "string" }] },
  root: section("dashboard-stats", {},
    c("Title", { as: "h2", id: "dashboard-stats-title", kit: "section-title-sm" }, $("title")),
    c("List", { ui: "grid", css: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" },
      each($("cards"), "k", c("ListItem", { ui: "card", css: "flex flex-col gap-2 rounded-lg bg-card p-8" },
        c("Inline", { kit: "muted-sm" }, $("k.label")),
        c("Inline", { kit: "section-title-sm" }, $("k.value")),
        c("Inline", { kit: "muted-sm" }, $("k.hint")))))),
});

export const habitsTable = block({
  id: "habits-table", title: "Habits table", category: "app",
  description: "Today's habits with streak, time and status badge.",
  schema: { title: "string", columns: { habit: "string", streak: "string", time: "string", status: "string" }, rows: [{ habit: "string", streak: "string", time: "string", status: "string", tone: "string" }] },
  root: section("habits-table", {},
    c("Title", { as: "h2", id: "habits-table-title", kit: "section-title-sm" }, $("title")),
    c("Box", { ui: "scroll", css: "overflow-x-auto rounded-lg inset-ring inset-ring-border" },
      c("Table", { ui: "table", css: "w-full text-left" },
        c("TableHead", { ui: "thead", css: "bg-muted text-sm text-muted-foreground" },
          c("TableRow", {},
            c("TableHeadCell", { ui: "th", scope: "col", css: "px-6 py-4 font-medium" }, $("columns.habit")),
            c("TableHeadCell", { ui: "th-2", scope: "col", css: "px-6 py-4 font-medium" }, $("columns.streak")),
            c("TableHeadCell", { ui: "th-3", scope: "col", css: "px-6 py-4 font-medium" }, $("columns.time")),
            c("TableHeadCell", { ui: "th-4", scope: "col", css: "px-6 py-4 font-medium" }, $("columns.status")))),
        c("TableBody", {},
          each($("rows"), "r", c("TableRow", { ui: "row", css: "border-t border-border" },
            c("TableHeadCell", { ui: "habit", scope: "row", css: "px-6 py-4 font-medium" }, $("r.habit")),
            c("TableCell", { kit: "cell" }, $("r.streak")),
            c("TableCell", { ui: "cell-2", css: "px-6 py-4 text-muted-foreground" }, $("r.time")),
            c("TableCell", { kit: "cell" },
              c("Badge", { ui: "status", variants: { tone: { done: "bg-primary text-primary-foreground", pending: "bg-muted text-foreground" } }, vary: { tone: $("r.tone") } }, $("r.status"))))))))),
});

export const emptyState = block({
  id: "empty-state", title: "Empty state", category: "app",
  description: "Icon, message and primary action when a list is empty.",
  schema: { title: "string", text: "string", cta: link },
  root: section("empty-state", { container: "mx-auto flex max-w-xl flex-col items-center gap-6 rounded-lg px-6 py-20 text-center inset-ring inset-ring-border" },
    c("IconBadge", { ui: "badge", css: "size-16 rounded-full bg-muted text-muted-foreground" }, icon("inbox", { ui: "icon", css: "size-6" })),
    c("Title", { as: "h2", id: "empty-state-title", ui: "title", css: "text-2xl font-semibold" }, $("title")),
    c("Text", { kit: "muted" }, $("text")),
    c("Button", { href: $("cta.href") }, icon("plus", { kit: "icon-sm" }), $("cta.label"))),
});

export const notFound = block({
  id: "not-found", title: "Not found", category: "app",
  description: "404 page body with a way back.",
  schema: { code: "string", title: "string", text: "string", cta: link },
  root: section("not-found", { css: "py-24", container: "mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center" },
    c("Text", { ui: "code", css: "text-display leading-none font-bold text-primary" }, $("code")),
    c("Title", { as: "h1", id: "not-found-title", ui: "title", css: "text-4xl font-bold" }, $("title")),
    c("Text", { ui: "text", css: "text-xl text-muted-foreground" }, $("text")),
    c("Button", { variant: "secondary", size: "lg", href: $("cta.href") }, $("cta.label"))),
});

export const cookieBanner = block({
  id: "cookie-banner", title: "Cookie banner", category: "overlay",
  description: "Consent notice with accept/decline (static; floating layer gets the only shadow).",
  schema: { label: "string", text: "string", accept: "string", decline: "string" },
  root: c("Block", { tag: "aside", "aria-label": $("label"), css: "px-6 py-8" },
    c("Group", { ui: "card", css: "mx-auto max-w-2xl flex-col justify-between gap-4 rounded-lg bg-popover p-6 text-popover-foreground shadow-lg inset-ring inset-ring-border md:flex-row" },
      c("Text", { ui: "text", css: "text-sm" }, $("text")),
      c("Group", { ui: "actions", css: "shrink-0 gap-2" },
        c("Button", { variant: "ghost", size: "sm", type: "button" }, $("decline")),
        c("Button", { size: "sm", type: "button" }, $("accept"))))),
});

export const footerSimple = block({
  id: "footer-simple", title: "Footer simple", category: "footer",
  description: "Brand, inline links and copyright on one row.",
  schema: { label: "string", brand: "string", href: "string", links: [link], copyright: "string" },
  root: c("Block", { tag: "footer", css: "border-t border-border py-10" },
    c("Container", { ui: "container", css: "mx-auto flex max-w-page flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-0" },
      c("Link", { ui: "brand", href: $("href"), css: "gap-2 text-xl font-bold text-foreground" }, icon("brand-mark", { kit: "icon-sm" }), c("Inline", {}, $("brand"))),
      h("nav", { ui: "nav", "aria-label": $("label") },
        c("List", { ui: "links", css: "flex flex-wrap gap-6" },
          each($("links"), "l", c("ListItem", {}, c("Link", { ui: "link", variant: "muted", href: $("l.href") }, $("l.label")))))),
      c("Text", { kit: "muted-sm" }, $("copyright")))),
});

export const catalogBlocks = [announcementBar, heroCentered, heroSplit, logoCloud, statsRow, featureGrid, featureSplit, steps, integrations, pricingThreeTiers, comparisonTable, testimonialQuote, teamGrid, blogCards, changelog, faqAccordion, ctaCentered, appDownload, newsletterBand, contactForm, loginCard, signupCard, settingsPanel, dashboardStats, habitsTable, emptyState, notFound, cookieBanner, footerSimple];
