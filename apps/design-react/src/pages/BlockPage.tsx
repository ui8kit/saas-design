import { pageTitle } from "$design/site";
import { List, ListItem, Text } from "@saas-design/ui/react";
import { blocks } from "$design/blocks";
import { BlockPreview } from "../components/BlockPreview";
import { PageHeader } from "../components/PageHeader";
import { Pager } from "../components/Pager";
import { Section } from "../components/Section";

export const title = (id: string) => pageTitle(blocks.find((b) => b.id === id)!.title, "Blocks");

export function BlockPage({ id }: { id: string }) {
  const i = blocks.findIndex((b) => b.id === id);
  const meta = blocks[i]!;
  return (
    <>
      <PageHeader eyebrow={`blocks / ${meta.category}`} title={meta.title} lead={meta.description}>
        <Text className="ds-meta">React: {meta.name} · Svelte: {meta.name} · templ: blocks.{meta.name} · Figma: {meta.figma ?? "catalog (no Figma node)"}</Text>
      </PageHeader>
      <Section label="Preview"><BlockPreview id={meta.id} /></Section>
      <Section id="classes-title" title="Semantic classes (packages/adapter)" titleClass="ds-h3">
        <List className="ds-toc">{meta.classes.map((c) => <ListItem className="ds-chip" key={c}>.{c}</ListItem>)}</List>
      </Section>
      <Pager prev={blocks[i - 1]} next={blocks[i + 1]} />
    </>
  );
}
