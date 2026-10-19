<script lang="ts">
  import { pageTitle } from "$design/site";
  import { Badge, Box, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Inline, List, ListItem, Text, ThemeToggle } from "@saas-design/ui";
  import { colors } from "$design/foundations";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";
  const groups = [
    { id: "light", title: "shadcn tokens · light", items: colors.light },
    { id: "dark", title: "shadcn tokens · dark (.dark)", items: colors.dark },
    { id: "brand", title: "App-level brand tokens · light (apps only, never packages/)", items: colors.brand },
    { id: "brand-dark", title: "App-level brand tokens · dark", items: colors.brandDark },
  ];
  const modes = [["light", "Light"], ["dark", "Dark"]] as const;
  const swatches = ["chart-3", "chart-4", "chart-5", "accent", "muted"];
</script>

<svelte:head><title>{pageTitle("Colors")}</title></svelte:head>
<PageHeader title="Colors" lead="shadcn HSL token set from fixtures/tokens/tokens.json (mapped from Figma variables). Markup only uses token utilities through the adapter." />
<Section id="colors-preview" title="Light / dark preview">
  <Text class="ds-text">The same components rendered under each token set (scoped with data-theme, independent of the page theme). Toggle the page theme with <ThemeToggle variant="ghost" size="sm" />.</Text>
  <Box class="ds-modes">
    {#each modes as [mode, label]}
      <Box class="ds-mode {mode === 'dark' ? 'dark' : ''}" data-theme={mode}>
        <Text class="ds-name">{label}</Text>
        <Card>
          <CardHeader><CardTitle>Premium</CardTitle><CardDescription>All features you need</CardDescription></CardHeader>
          <CardContent>
            <Box class="ds-mode-row">
              <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
            </Box>
            <Box class="ds-mode-row"><Badge>Popular</Badge><Badge variant="secondary">New</Badge><Inline class="ds-meta">muted-foreground text</Inline></Box>
          </CardContent>
        </Card>
        <List class="ds-mode-swatches">
          {#each swatches as c}<ListItem class="ds-mode-swatch ds-swatch-{c}"><Inline class="ds-mode-swatch-label">{c}</Inline></ListItem>{/each}
        </List>
      </Box>
    {/each}
  </Box>
</Section>
{#each groups as g}
  <Section id="colors-{g.id}" title={g.title}>
    <List class="ds-grid">
      {#each g.items as c}
        <ListItem class="ds-sample {g.id.includes('dark') ? 'dark ds-sample-dark' : 'ds-sample-light'}" data-theme={g.id.includes("dark") ? "dark" : "light"}>
          <Inline class="ds-swatch ds-swatch-{c.name}" />
          <Inline class="ds-name">--{c.name}</Inline>
          <Inline class="ds-meta">{c.hsl}</Inline>
          <Inline class="ds-meta">{c.hex} · {c.source}</Inline>
        </ListItem>
      {/each}
    </List>
  </Section>
{/each}
