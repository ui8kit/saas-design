import { pageTitle } from "$design/site";
import { Badge, Box, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Inline, List, ListItem, Text, ThemeToggle } from "@saas-design/ui/react";
import { colors } from "$design/foundations";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = pageTitle("Colors");

const groups = [
  { id: "light", title: "shadcn tokens · light", items: colors.light },
  { id: "dark", title: "shadcn tokens · dark (.dark)", items: colors.dark },
  { id: "brand", title: "App-level brand tokens · light (apps only, never packages/)", items: colors.brand },
  { id: "brand-dark", title: "App-level brand tokens · dark", items: colors.brandDark },
];
const modes = [["light", "Light"], ["dark", "Dark"]] as const;
const swatches = ["chart-3", "chart-4", "chart-5", "accent", "muted"];

export function ColorsPage() {
  return (
    <>
      <PageHeader title="Colors" lead="shadcn HSL token set from fixtures/tokens/tokens.json (mapped from Figma variables). Markup only uses token utilities through the adapter." />
      <Section id="colors-preview" title="Light / dark preview">
        <Text className="ds-text">The same components rendered under each token set (scoped with data-theme, independent of the page theme). Toggle the page theme with <ThemeToggle variant="ghost" size="sm" />.</Text>
        <Box className="ds-modes">
          {modes.map(([mode, label]) => (
            <Box className={`ds-mode ${mode === "dark" ? "dark" : ""}`} data-theme={mode} key={mode}>
              <Text className="ds-name">{label}</Text>
              <Card>
                <CardHeader><CardTitle>Premium</CardTitle><CardDescription>All features you need</CardDescription></CardHeader>
                <CardContent>
                  <Box className="ds-mode-row">
                    <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
                  </Box>
                  <Box className="ds-mode-row"><Badge>Popular</Badge><Badge variant="secondary">New</Badge><Inline className="ds-meta">muted-foreground text</Inline></Box>
                </CardContent>
              </Card>
              <List className="ds-mode-swatches">
                {swatches.map((c) => <ListItem className={`ds-mode-swatch ds-swatch-${c}`} key={c}><Inline className="ds-mode-swatch-label">{c}</Inline></ListItem>)}
              </List>
            </Box>
          ))}
        </Box>
      </Section>
      {groups.map((g) => (
        <Section id={`colors-${g.id}`} title={g.title} key={g.id}>
          <List className="ds-grid">
            {g.items.map((c) => (
              <ListItem className={`ds-sample ${g.id.includes("dark") ? "dark ds-sample-dark" : "ds-sample-light"}`} data-theme={g.id.includes("dark") ? "dark" : "light"} key={c.name}>
                <Inline className={`ds-swatch ds-swatch-${c.name}`} />
                <Inline className="ds-name">--{c.name}</Inline>
                <Inline className="ds-meta">{c.hsl}</Inline>
                <Inline className="ds-meta">{c.hex} · {c.source}</Inline>
              </ListItem>
            ))}
          </List>
        </Section>
      ))}
    </>
  );
}
