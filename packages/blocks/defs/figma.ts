/**
 * The 10 blocks derived from the Figma frame "Home" (1:10). Spacing is snapped to the UI8Kit 8+4 layout
 * scale (see .project/backlog/figma-offgrid-spacing.md); colors are shadcn tokens only.
 */
import { $, block, c, each, h, icon, unless, use, when } from "../scripts/dsl";

const link = { label: "string", href: "string" };
const img = { src: "string", alt: "string" };
const tone = { primary: "bg-primary text-primary-foreground", secondary: "bg-secondary text-secondary-foreground", lilac: "bg-chart-3 text-foreground", sky: "bg-chart-4 text-foreground", pink: "bg-chart-5 text-foreground", muted: "bg-muted text-foreground" };

export const navbar = block({
  id: "navbar", title: "Navbar", category: "navigation", figma: "1:262 › Logo, Menu, Button",
  description: "Brand mark, primary menu and one call to action; inherits the surface color of its parent.",
  schema: { label: "string", brand: "string", href: "string", items: [link], cta: link },
  root: c("Block", { tag: "nav", "aria-label": $("label"), css: "@container flex items-center justify-between gap-4 @5xl:gap-8" },
    c("Link", { ui: "brand", href: $("href"), css: "gap-2 text-2xl leading-none font-bold text-current no-underline hover:no-underline @5xl:text-3xl" },
      icon("brand-mark", { ui: "mark", css: "size-6" }),
      c("Inline", {}, $("brand"))),
    c("List", { ui: "menu", css: "hidden items-center gap-4 lg:flex @5xl:gap-8" },
      each($("items"), "item", c("ListItem", {},
        c("Link", { ui: "menu-link", href: $("item.href"), css: "text-base leading-none whitespace-nowrap text-current hover:underline @5xl:text-lg" }, $("item.label"))))),
    c("Group", { ui: "actions", css: "flex items-center gap-2 @5xl:gap-4" },
      c("ThemeToggle", { ui: "toggle", variant: "current" }),
      c("Button", { ui: "cta", variant: "contrast", href: $("cta.href"), css: "hidden px-6 md:inline-flex @5xl:px-8" }, $("cta.label")),
      c("SheetTrigger", { ui: "trigger", variant: "current", controls: "navbar-menu", css: "lg:hidden" })),
    // show/hide follows the viewport (burger below lg, user decision); menu sizes follow the nav width (@container),
    // so a narrower host (a design-app preview next to the sidebar) gets the compact sizes.
    // mobile menu (below lg): side sheet with the same links; behavior from packages/ui/behaviors/ui8kit.js
    c("Sheet", { ui: "sheet", id: "navbar-menu", side: "right", "aria-label": $("label") },
      c("SheetClose", { ui: "sheet-close", variant: "ghost", css: "self-end" }),
      c("List", { ui: "sheet-menu", css: "flex flex-col gap-2" },
        each($("items"), "item", c("ListItem", {},
          c("Link", { ui: "sheet-link", href: $("item.href"), css: "block rounded-md px-4 py-2 text-lg text-foreground no-underline hover:bg-muted" }, $("item.label"))))),
      c("Button", { ui: "sheet-cta", href: $("cta.href") }, $("cta.label"))),
  ),
});

export const heroPhones = block({
  id: "hero-phones", title: "Hero with phones", category: "hero", figma: "1:262 Hero",
  description: "Full-bleed primary surface with navbar, centered headline, two actions, social badge and tilted app screens.",
  schema: { nav: "@navbar", title: "string", lead: "string", primary: link, secondary: link, badge: "string", screens: [img] },
  root: c("Block", { tag: "header", id: "top", "data-theme": "light", css: "relative isolate m-4 flex flex-col overflow-hidden rounded-lg bg-primary px-6 pt-6 pb-12 text-primary-foreground md:m-8 md:px-10 md:pt-10 xl:aspect-video xl:px-12 xl:pt-12" },
    use("navbar", $("nav")),
    c("Stack", { ui: "content", css: "mx-auto flex max-w-3xl flex-col items-center gap-6 pt-16 text-center md:gap-8 md:pt-20 lg:pt-24" },
      c("Title", { as: "h1", ui: "title", css: "max-w-2xl text-4xl leading-none font-medium md:text-5xl lg:text-6xl" }, $("title")),
      c("Text", { ui: "lead", css: "max-w-2xl text-lg md:text-xl" }, $("lead")),
      c("Group", { ui: "actions", css: "mt-4 flex-wrap justify-center gap-4 md:gap-6" },
        c("Button", { variant: "contrast", size: "xl", href: $("primary.href") }, $("primary.label")),
        c("Button", { ui: "demo", variant: "outline", size: "xl", css: "font-bold inset-ring-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground", href: $("secondary.href") }, icon("play", { ui: "demo-icon", css: "size-4 fill-current" }), $("secondary.label")))),
    c("Badge", { ui: "badge", variant: "secondary", size: "lg", css: "mt-12 self-center xl:mt-auto" }, icon("star", { ui: "badge-icon", css: "size-4 fill-current" }), $("badge")),
    c("Box", { ui: "art", "aria-hidden": "true", css: "pointer-events-none absolute inset-0 -z-10 hidden xl:block" },
      c("Box", { ui: "dot-1", css: "absolute top-33/100 left-9/100 size-16 rounded-full bg-muted" }),
      c("Box", { ui: "dot-2", css: "absolute top-1/2 left-77/100 size-16 rounded-full bg-secondary" }),
      c("Box", { ui: "dot-3", css: "absolute top-33/100 left-80/100 size-16 rounded-full bg-chart-3" }),
      c("Box", { ui: "dot-4", css: "absolute top-77/100 left-61/100 size-16 rounded-full bg-chart-4" }),
      c("Box", { ui: "dot-5", css: "absolute top-58/100 left-21/100 size-16 rounded-full bg-chart-4" }),
      c("Box", { ui: "dot-6", css: "absolute top-52/100 left-20/100 size-16 rounded-full bg-chart-5" }),
      each($("screens"), "screen",
        c("Image", { ui: "screen", src: $("screen.src"), alt: "", decorative: true, css: "absolute w-4/25 origin-top-left rounded-lg ring-4 ring-foreground" }))),
  ),
  extraCss: `.ui-hero-phones-screen:nth-child(7) { @apply top-68/100 -left-2/100 rotate-19; }
.ui-hero-phones-screen:nth-child(8) { @apply top-72/100 left-14/100 -rotate-4; }
.ui-hero-phones-screen:nth-child(9) { @apply top-72/100 left-76/100 z-10 -rotate-14; }
.ui-hero-phones-screen:nth-child(10) { @apply top-62/100 left-82/100 rotate-15; }`,
});


export const featureCards = block({
  id: "feature-cards", title: "Feature cards", category: "features", figma: "1:244 Why",
  description: "Split section header and three muted cards with an icon, title and description.",
  schema: { id: "string", title: "string", lead: "string", items: [{ icon: "string", title: "string", text: "string" }] },
  root: c("Block", { tag: "section", id: $("id"), "aria-labelledby": "feature-cards-title", css: "px-6 md:px-10 lg:px-12 pt-12 lg:pt-20" },
    c("Container", { ui: "container", css: "mx-auto flex w-full max-w-page flex-col gap-8 md:gap-10 lg:gap-12" },
      c("Group", { ui: "head", css: "flex-col items-start justify-between gap-4 lg:flex-row lg:items-center lg:gap-6" },
        c("Title", { as: "h2", id: "feature-cards-title", kit: "section-title-display" }, $("title")),
        c("Text", { ui: "lead", css: "max-w-md text-lg font-light md:text-xl" }, $("lead"))),
      c("Grid", { ui: "grid", css: "grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10" },
        each($("items"), "item",
          c("Card", { ui: "card", css: "gap-6" },
            icon($("item.icon"), { ui: "icon", css: "size-6 text-foreground" }),
            c("Stack", { kit: "stack-4" },
              c("Title", { as: "h3", ui: "card-title", css: "text-xl leading-none font-semibold" }, $("item.title")),
              c("Text", { ui: "card-text", css: "text-base leading-6 text-muted-foreground" }, $("item.text")))))))),
});

export const socialProofSplit = block({
  id: "social-proof-split", title: "Social proof split", category: "social-proof", figma: "1:223 Social Proof",
  description: "Accent panel with an app screen beside a statement and a muted logo strip.",
  schema: { title: "string", screen: img, logos: [img] },
  root: c("Block", { tag: "section", "aria-labelledby": "social-proof-title", css: "px-6 md:px-10 lg:px-12 pt-10" },
    c("Container", { ui: "container", css: "mx-auto grid w-full max-w-page grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16" },
      c("Box", { ui: "panel", css: "aspect-square overflow-hidden rounded-lg bg-accent md:aspect-4/3 lg:aspect-auto lg:h-140" },
        c("Image", { ui: "screen", src: $("screen.src"), alt: $("screen.alt"), css: "size-full object-cover object-top" })),
      c("Stack", { ui: "body", css: "flex flex-col justify-between gap-8 lg:gap-12 lg:py-6" },
        c("Title", { as: "h2", id: "social-proof-title", ui: "title", css: "text-3xl leading-10 font-medium md:text-4xl md:leading-12" }, $("title")),
        c("Group", { ui: "logos", css: "flex-wrap justify-center gap-6 rounded-lg bg-muted px-6 py-6 md:justify-between md:gap-8 md:px-10 md:py-8 lg:px-12 lg:py-10" },
          each($("logos"), "logo", c("Image", { ui: "logo", variant: "logo", src: $("logo.src"), alt: $("logo.alt"), css: "h-8 w-auto md:h-10 lg:h-12 dark:brightness-0 dark:invert" })))))),
});

export const appGallery = block({
  id: "app-gallery", title: "App gallery", category: "media", figma: "1:206 Inside",
  description: "Centered header and a row of colored tiles each framing an app screen; the last tile bleeds off the page.",
  schema: { id: "string", title: "string", lead: "string", tiles: [{ tone: "string", src: "string", alt: "string" }] },
  root: c("Block", { tag: "section", id: $("id"), "aria-labelledby": "app-gallery-title", css: "overflow-x-clip px-6 md:px-10 lg:px-12 pt-16 md:pt-20 lg:pt-28" },
    c("Container", { ui: "container", css: "mx-auto flex w-full max-w-page flex-col gap-10 md:gap-16 lg:gap-20" },
      c("Stack", { kit: "section-head-center" },
        c("Title", { as: "h2", id: "app-gallery-title", kit: "section-title-display" }, $("title")),
        c("Text", { ui: "lead", css: "text-lg font-light md:text-xl" }, $("lead"))),
      c("List", { ui: "tiles", "data-bleed": "inline-end", css: "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:w-5/4 lg:grid-cols-5 lg:gap-10" },
        each($("tiles"), "tile",
          c("ListItem", { ui: "tile", variants: { tone }, vary: { tone: $("tile.tone") }, css: "aspect-1/2 overflow-hidden rounded-lg" },
            when($("tile.src"), c("Image", { ui: "screen", src: $("tile.src"), alt: $("tile.alt"), css: "size-full object-cover object-top" }))))))),
});

export const testimonialCards = block({
  id: "testimonial-cards", title: "Testimonial cards", category: "testimonials", figma: "1:179 Testimonials",
  description: "Left-aligned header and three muted cards with avatar, name, role and quote.",
  schema: { title: "string", lead: "string", items: [{ name: "string", role: "string", quote: "string", avatar: img }] },
  root: c("Block", { tag: "section", "aria-labelledby": "testimonial-cards-title", css: "px-6 md:px-10 lg:px-12 pt-16 md:pt-20 lg:pt-28" },
    c("Container", { ui: "container", css: "mx-auto flex w-full max-w-page flex-col gap-10 md:gap-12 lg:gap-16" },
      c("Stack", { kit: "stack-4" },
        c("Title", { as: "h2", id: "testimonial-cards-title", kit: "section-title-display" }, $("title")),
        c("Text", { ui: "lead", css: "text-xl font-light" }, $("lead"))),
      c("List", { kit: "grid-3" },
        each($("items"), "item",
          c("ListItem", { ui: "item" },
            c("Card", { ui: "card", css: "h-full gap-8" },
              c("Group", { ui: "author", css: "gap-4" },
                c("Image", { ui: "avatar", variant: "avatar", src: $("item.avatar.src"), alt: $("item.avatar.alt") }),
                c("Stack", { kit: "stack-2" },
                  c("Inline", { ui: "name", css: "leading-5 font-bold" }, $("item.name")),
                  c("Inline", { ui: "role", css: "leading-5 text-muted-foreground" }, $("item.role")))),
              c("Text", { tag: "blockquote", ui: "quote", css: "leading-6 text-muted-foreground" }, c("Text", {}, $("item.quote"))))))))),
});

export const ctaSplit = block({
  id: "cta-split", title: "CTA split", category: "cta", figma: "1:170 CTA",
  description: "Accent panel with a display headline on the left and copy plus action aligned right.",
  schema: { title: "string", text: "string", cta: link },
  root: c("Block", { tag: "section", "aria-labelledby": "cta-split-title", css: "px-6 md:px-10 lg:px-12 pt-16 md:pt-20 lg:pt-28" },
    c("Container", { ui: "container", css: "mx-auto w-full max-w-page" },
      c("Stack", { ui: "panel", css: "flex flex-col gap-12 rounded-lg bg-accent p-8 text-accent-foreground md:gap-16 md:p-12 lg:gap-24 lg:p-20" },
        icon("brand-mark", { ui: "mark", css: "size-12 text-foreground md:size-16 lg:size-20" }),
        c("Grid", { ui: "row", css: "grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-12" },
          c("Title", { as: "h2", id: "cta-split-title", ui: "title", css: "max-w-xl text-5xl font-normal md:text-6xl lg:text-display" }, $("title")),
          c("Stack", { ui: "aside", css: "flex flex-col items-start gap-8 md:gap-10 lg:items-end lg:gap-16" },
            c("Text", { ui: "text", css: "max-w-lg text-lg leading-8 font-light md:text-xl lg:text-right" }, $("text")),
            c("Button", { size: "xl", href: $("cta.href"), css: "w-full md:w-auto" }, $("cta.label"))))))),
});

export const pricingTwoPlans = block({
  id: "pricing-two-plans", title: "Pricing, two plans", category: "pricing", figma: "1:84 Pricing",
  description: "Header and two plan cards; the featured plan flips to the dark scope (variables only, same markup).",
  schema: { id: "string", title: "string", lead: "string", plans: [{ theme: "string", name: "string", badge: "string", description: "string", price: "string", period: "string", features: [{ label: "string", included: "bool" }], cta: link }] },
  root: c("Block", { tag: "section", id: $("id"), "aria-labelledby": "pricing-two-plans-title", css: "px-6 md:px-10 lg:px-12 pt-16 md:pt-20 lg:pt-28" },
    c("Container", { ui: "container", css: "mx-auto flex w-full max-w-page flex-col gap-10 md:gap-12 lg:gap-16" },
      c("Stack", { kit: "stack-4" },
        c("Title", { as: "h2", id: "pricing-two-plans-title", kit: "section-title-display" }, $("title")),
        c("Text", { ui: "lead", css: "text-xl font-light" }, $("lead"))),
      c("List", { ui: "plans", css: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10" },
        each($("plans"), "plan",
          c("ListItem", { ui: "plan", "data-theme": $("plan.theme"), variants: { theme: { default: "bg-card", dark: "bg-background inset-ring inset-ring-input" } }, vary: { theme: $("plan.theme") }, css: "flex flex-col gap-8 rounded-lg p-8 pb-10 text-card-foreground md:gap-10 md:p-10 md:pb-12 lg:gap-12 lg:p-16 lg:pb-24" },
            c("Stack", { kit: "stack-4" },
              c("Group", { ui: "plan-name-row", css: "justify-between gap-4" },
                c("Title", { as: "h3", ui: "plan-name", css: "text-2xl leading-6 font-semibold" }, $("plan.name")),
                when($("plan.badge"), c("Badge", {}, $("plan.badge")))),
              c("Text", { ui: "plan-description", css: "leading-5 text-muted-foreground" }, $("plan.description"))),
            c("Stack", { kit: "stack-6" },
              c("Text", { ui: "price", css: "flex items-baseline gap-2" },
                c("Inline", { ui: "price-value", css: "text-4xl font-bold" }, $("plan.price")),
                when($("plan.period"), c("Inline", { kit: "muted" }, $("plan.period")))),
              c("List", { kit: "stack-4" },
                each($("plan.features"), "f",
                  c("ListItem", { ui: "feature", css: "flex h-6 items-center gap-4 leading-5" },
                    when($("f.included"), icon("check", { ui: "feature-check", css: "size-4 text-primary" })),
                    unless($("f.included"), icon("lock", { ui: "feature-lock", css: "size-4 text-muted-foreground" })),
                    $("f.label"))))),
            c("Button", { ui: "plan-cta", variant: "secondary", size: "xl", href: $("plan.cta.href"), css: "mt-auto w-full" }, $("plan.cta.label"))))))),
});

export const faqTiles = block({
  id: "faq-tiles", title: "FAQ tiles", category: "faq", figma: "1:56 FAQ",
  description: "Centered header, a 2×2 grid of colored disclosure tiles and a link to all questions.",
  schema: { id: "string", title: "string", lead: "string", items: [{ tone: "string", question: "string", answer: "string" }], more: link },
  root: c("Block", { tag: "section", id: $("id"), "aria-labelledby": "faq-tiles-title", css: "px-6 md:px-10 lg:px-12 pt-16 md:pt-20 lg:pt-28" },
    c("Container", { ui: "container", css: "mx-auto flex w-full max-w-page flex-col gap-10 md:gap-12 lg:gap-16" },
      c("Stack", { kit: "section-head-center" },
        c("Title", { as: "h2", id: "faq-tiles-title", ui: "title", css: "max-w-3xl text-4xl leading-tight font-bold md:text-5xl lg:text-6xl" }, $("title")),
        c("Text", { ui: "lead", css: "text-xl font-light" }, $("lead"))),
      c("Stack", { kit: "stack-8" },
        c("Grid", { ui: "grid", css: "grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-x-10 lg:gap-y-8" },
          each($("items"), "item",
            c("Disclosure", { ui: "tile", variants: { tone }, vary: { tone: $("item.tone") }, css: "rounded-lg p-2 md:p-4" },
              c("Summary", { ui: "question", css: "flex cursor-pointer list-none items-center gap-4 text-lg font-medium md:text-xl" },
                c("Inline", { ui: "arrow", css: "flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-foreground" }, icon("chevron-down", { ui: "arrow-icon", css: "size-4" })),
                $("item.question")),
              c("Text", { ui: "answer", css: "mx-6 pt-4 pl-12 text-base leading-6" }, $("item.answer"))))),
        c("Link", { ui: "more", href: $("more.href"), css: "self-end text-lg text-foreground hover:underline" }, $("more.label"))))),
  extraCss: `.ui-faq-tiles-question > [data-slot="summary-indicator"] { @apply hidden; }
  .ui-faq-tiles-tile[open] .ui-faq-tiles-arrow-icon { @apply rotate-180; }
.ui-faq-tiles-question::-webkit-details-marker { @apply hidden; }`,
});

export const footerNewsletter = block({
  id: "footer-newsletter", title: "Footer with newsletter", category: "footer", figma: "1:11 Footer",
  description: "Dark-scope footer card: brand and socials, two link columns, newsletter form and copyright bar.",
  schema: { brand: "string", href: "string", text: "string", socials: [{ icon: "string", label: "string", href: "string" }], columns: [{ title: "string", links: [link] }], newsletter: { title: "string", text: "string", label: "string", placeholder: "string", button: "string", action: "string" }, copyright: "string" },
  root: c("Block", { tag: "footer", css: "px-4 md:px-6 lg:px-12 pt-8 pb-8 md:pt-12 md:pb-12 lg:pt-20 lg:pb-24" },
    c("Container", { ui: "container", css: "mx-auto w-full max-w-page" },
      c("Stack", { ui: "panel", "data-theme": "dark", css: "flex flex-col gap-8 rounded-lg bg-background px-6 pt-8 pb-6 text-foreground md:gap-10 md:px-8 md:pt-10 lg:gap-16 lg:px-12 lg:pt-16" },
        c("Grid", { ui: "top", css: "grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-12 lg:gap-6" },
          c("Stack", { ui: "brand", css: "flex flex-col gap-6 md:gap-8 lg:col-span-4" },
            c("Link", { ui: "brand-link", href: $("href"), css: "gap-2 text-3xl leading-none font-bold text-foreground" }, icon("brand-mark", { ui: "mark", css: "size-6" }), c("Inline", {}, $("brand"))),
            c("Text", { ui: "text", css: "max-w-xs leading-6 text-muted-foreground" }, $("text")),
            c("List", { ui: "socials", css: "flex gap-4" },
              each($("socials"), "s", c("ListItem", {},
                c("Link", { ui: "social", href: $("s.href"), "aria-label": $("s.label"), css: "text-muted-foreground hover:text-foreground" }, icon($("s.icon"), { ui: "social-icon", css: "size-6" })))))),
          each($("columns"), "col",
            c("Stack", { ui: "column", tag: "div", css: "flex flex-col gap-6 lg:col-span-2" },
              c("Title", { as: "h2", ui: "column-title", css: "text-base leading-5 font-semibold" }, $("col.title")),
              c("List", { kit: "stack-4" },
                each($("col.links"), "l", c("ListItem", {}, c("Link", { ui: "link", href: $("l.href"), css: "leading-5 text-muted-foreground hover:text-foreground" }, $("l.label"))))))),
          c("Stack", { ui: "newsletter", css: "flex flex-col gap-4 lg:col-span-3 lg:col-start-10" },
            c("Title", { as: "h2", ui: "newsletter-title", css: "text-base leading-5 font-semibold" }, $("newsletter.title")),
            c("Text", { kit: "muted-sm" }, $("newsletter.text")),
            c("Form", { ui: "form", action: $("newsletter.action"), method: "post", css: "flex flex-col gap-4" },
              c("Label", { ui: "label", for: "footer-newsletter-email", css: "sr-only" }, $("newsletter.label")),
              c("Input", { ui: "input", id: "footer-newsletter-email", type: "email", name: "email", autocomplete: "email", required: true, placeholder: $("newsletter.placeholder"), css: "bg-card" }),
              c("Button", { ui: "submit", type: "submit", css: "w-full font-normal" }, $("newsletter.button"))))),
        c("Text", { ui: "copyright", css: "border-t border-border pt-6 text-center leading-5 text-muted-foreground md:pt-8" }, $("copyright"))))),
});

export const figmaBlocks = [navbar, heroPhones, featureCards, socialProofSplit, appGallery, testimonialCards, ctaSplit, pricingTwoPlans, faqTiles, footerNewsletter];
