import { pageTitle } from "$design/site";
import { Inline, List, ListItem } from "@saas-design/ui/react";
import { spaceSteps, spacing } from "$design/foundations";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = pageTitle("Spacing");
const px = (steps: string[]) => steps.map((s) => `${s} (${Number(s) * 4}px)`).join(" · ");

export function SpacingPage() {
  return (
    <>
      <PageHeader title="Spacing" lead="8 + 4 px grid: one Tailwind step is 4px. Layout scope (blocks, apps) uses even steps (8px rhythm); control scope (primitives) may also use 4px half-steps. Enforced by ui8px lint." />
      <Section id="space-scopes" title="Allowed steps per scope">
        <List className="ds-rows">
          <ListItem className="ds-row"><Inline className="ds-row-label">layout</Inline><Inline className="ds-meta">{px(spacing.layout)}</Inline></ListItem>
          <ListItem className="ds-row"><Inline className="ds-row-label">control</Inline><Inline className="ds-meta">{px(spacing.control)}</Inline></ListItem>
        </List>
      </Section>
      <Section id="space-scale" title="Scale">
        <List className="ds-rows">
          {spaceSteps.map((s) => <ListItem className="ds-row" key={s}><Inline className="ds-row-label">{s} · {Number(s) * 4}px</Inline><Inline className={`ds-box ds-space-${s}`} /></ListItem>)}
        </List>
      </Section>
    </>
  );
}
