<script lang="ts">
  import { LinkPlain, List, ListItem } from "@saas-design/ui";
  import { nav } from "$design/nav";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";
</script>

<svelte:head><title>Habitus Design System</title></svelte:head>
<PageHeader
  title="Habitus Design System"
  lead="Foundations, primitives, components, widgets and blocks generated from the Figma file. Every page renders the generated packages with one DOM (React 19 in apps/design-react, Svelte 5 in apps/design-svelte, Go templ in apps/site): shadcn HSL tokens, semantic ui-* classes from the adapter, fixtures that conform to @ui8kit/contract."
/>
<Section id="sections-title" title="Sections">
  <List class="ds-cards">
    {#each nav.slice(1, 3).flatMap((g) => g.items) as item}
      <ListItem class="ds-card"><LinkPlain class="ds-card-link" href={item.href}>{item.label}</LinkPlain></ListItem>
    {/each}
  </List>
</Section>
