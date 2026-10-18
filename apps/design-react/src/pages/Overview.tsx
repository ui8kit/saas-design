import { LinkPlain, List, ListItem } from "@saas-design/ui/react";
import { nav } from "$design/nav";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = "Habitus Design System";

export function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Habitus Design System"
        lead="Foundations, primitives, components, widgets and blocks generated from the Figma file. Every page renders the generated packages with one DOM (React 19 in apps/design-react, Svelte 5 in apps/design-svelte, Go templ in apps/site): shadcn HSL tokens, semantic ui-* classes from the adapter, fixtures that conform to @ui8kit/contract."
      />
      <Section id="sections-title" title="Sections">
        <List className="ds-cards">
          {nav.slice(1, 3).flatMap((g) => g.items).map((item) => (
            <ListItem className="ds-card" key={item.href}><LinkPlain className="ds-card-link" href={item.href}>{item.label}</LinkPlain></ListItem>
          ))}
        </List>
      </Section>
    </>
  );
}
