import { pageTitle } from "$design/site";
import { LinkPlain, List, ListItem, Text } from "@saas-design/ui/react";
import { blocks, categories } from "$design/blocks";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = pageTitle("Blocks");

export function BlocksPage() {
  return (
    <>
      <PageHeader title="Blocks" lead={`${blocks.length} page sections from packages/blocks, generated from one DSL into React 19, Svelte 5 and Go templ with identical DOM. Previews use fixtures/views/blocks.json (contract records).`} />
      {categories.map((cat) => (
        <Section id={`cat-${cat.id}`} title={cat.id} key={cat.id}>
          <List className="ds-cards">
            {cat.blocks.map((b) => (
              <ListItem className="ds-card" key={b.id}>
                <LinkPlain className="ds-card-link" href={`/blocks/${b.id}`}>{b.title}</LinkPlain>
                <Text className="ds-meta">{b.description}</Text>
              </ListItem>
            ))}
          </List>
        </Section>
      ))}
    </>
  );
}
