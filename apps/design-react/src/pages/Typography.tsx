import { Inline, List, ListItem } from "@saas-design/ui/react";
import { font, typeScale, typeSteps } from "$design/foundations";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = "Typography · Habitus Design";

export function TypographyPage() {
  return (
    <>
      <PageHeader title="Typography" lead={`Family ${font.sans} (--font-sans). Tailwind type steps used by the adapter, and the Figma type scale they were derived from.`} />
      <Section id="type-steps" title="Type steps">
        <List className="ds-rows">
          {typeSteps.map((t) => <ListItem className="ds-row" key={t}><Inline className="ds-row-label">text-{t}</Inline><Inline className={`ds-type-${t}`}>Build better habits</Inline></ListItem>)}
        </List>
      </Section>
      <Section id="type-figma" title="Figma type scale">
        <List className="ds-rows">
          {typeScale.map((s) => (
            <ListItem className="ds-row" key={`${s.size}-${s.weight}-${s.family}`}>
              <Inline className="ds-row-label">{s.size}px / {s.weight}</Inline>
              <Inline className="ds-meta">{s.tailwind ?? "no Tailwind step (display)"} · used {s.count}×</Inline>
            </ListItem>
          ))}
        </List>
      </Section>
    </>
  );
}
