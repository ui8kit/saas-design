import { pageTitle } from "$design/site";
import { LinkPlain, List, ListItem, Text } from "@saas-design/ui/react";
import { guideGroups, guideHref, repo } from "$design/guides";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = pageTitle("Instructions");

export function InstructionsPage() {
  return (
    <>
      <PageHeader title="Instructions" lead="Guides for building a new app or brand with this repo: setup, tokens, blocks and codegen, the Figma parser, checks and deploy. Each link opens the document on GitHub." eyebrow={repo} />
      {guideGroups.map((g) => (
        <Section id={`guides-${g.id}`} title={g.title} key={g.id}>
          <List className="ds-cards">
            {g.guides.map((guide) => (
              <ListItem className="ds-card" key={guide.path}>
                <LinkPlain className="ds-card-link" href={guideHref(guide.path)}>{guide.title}</LinkPlain>
                <Text className="ds-meta">{guide.text}</Text>
                <Text className="ds-meta">{guide.path}</Text>
              </ListItem>
            ))}
          </List>
        </Section>
      ))}
    </>
  );
}
