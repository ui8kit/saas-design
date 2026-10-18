<script lang="ts">
  import { Inline, List, ListItem } from "@saas-design/ui";
  import { font, typeScale, typeSteps } from "$design/foundations";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";
</script>

<svelte:head><title>Typography · Habitus Design</title></svelte:head>
<PageHeader title="Typography" lead="Family {font.sans} (--font-sans). Tailwind type steps used by the adapter, and the Figma type scale they were derived from." />
<Section id="type-steps" title="Type steps">
  <List class="ds-rows">
    {#each typeSteps as t}<ListItem class="ds-row"><Inline class="ds-row-label">text-{t}</Inline><Inline class="ds-type-{t}">Build better habits</Inline></ListItem>{/each}
  </List>
</Section>
<Section id="type-figma" title="Figma type scale">
  <List class="ds-rows">
    {#each typeScale as s}
      <ListItem class="ds-row">
        <Inline class="ds-row-label">{s.size}px / {s.weight}</Inline>
        <Inline class="ds-meta">{s.tailwind ?? "no Tailwind step (display)"} · used {s.count}×</Inline>
      </ListItem>
    {/each}
  </List>
</Section>
