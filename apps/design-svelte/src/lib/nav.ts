import catalog from "$packages/blocks/catalog.json";

export type NavItem = { label: string; href: string };
export type NavGroup = { title: string; items: NavItem[] };

export const nav: NavGroup[] = [
  { title: "Getting started", items: [{ label: "Overview", href: "/" }] },
  {
    title: "Foundations",
    items: [
      { label: "Colors", href: "/foundations/colors" },
      { label: "Typography", href: "/foundations/typography" },
      { label: "Spacing", href: "/foundations/spacing" },
      { label: "Radius", href: "/foundations/radius" },
      { label: "Shadows", href: "/foundations/shadows" },
    ],
  },
  {
    title: "Library",
    items: [
      { label: "Primitives", href: "/primitives" },
      { label: "Components", href: "/components" },
      { label: "Widgets", href: "/widgets" },
      { label: "Blocks", href: "/blocks" },
    ],
  },
  { title: "Blocks", items: catalog.map((b) => ({ label: b.title, href: `/blocks/${b.id}` })) },
];
