import type { ComponentType } from "react";
import * as ui from "@saas-design/ui/react";
import { LinkPlain, List, ListItem, Text } from "@saas-design/ui/react";
import showcase from "@saas-design/ui/showcase.json";
import { PageHeader } from "./PageHeader";
import { Section } from "./Section";
import { ShowcasePart } from "./ShowcasePart";

// Generated React parts of packages/ui, by exported name (the `name` of a part in showcase.json).
const parts = ui as unknown as Record<string, ComponentType<Record<string, unknown>> | undefined>;
const slug = (id: string) => id.replace(/^ui\./, "").replaceAll(".", "-");

// Primitives / Components pages: every brick of packages/ui of one kind, from packages/ui/showcase.json.
export function Showcase({ kind, title, lead }: { kind: "primitive" | "component"; title: string; lead: string }) {
  const bricks = showcase.filter((b) => b.kind === kind);
  return (
    <>
      <PageHeader title={title} lead={lead}>
        <List className="ds-toc">
          {bricks.map((b) => <ListItem key={b.id}><LinkPlain className="ds-toc-link" href={`#${slug(b.id)}`}>{slug(b.id)}</LinkPlain></ListItem>)}
        </List>
      </PageHeader>
      {bricks.map((b) => (
        <Section key={b.id} sectionId={slug(b.id)} id={`${slug(b.id)}-title`} title={b.id}>
          {b.docs ? <Text className="ds-text">{b.docs}</Text> : null}
          {b.parts.map((part) => <ShowcasePart key={part.name} part={part} Comp={parts[part.name]} />)}
        </Section>
      ))}
    </>
  );
}
