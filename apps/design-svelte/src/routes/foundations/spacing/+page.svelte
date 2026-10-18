<script lang="ts">
  import { Inline, List, ListItem } from "@saas-design/ui";
  import { spaceSteps, spacing } from "$design/foundations";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";
  const px = (steps: string[]) => steps.map((s) => `${s} (${Number(s) * 4}px)`).join(" · ");
</script>

<svelte:head><title>Spacing · Habitus Design</title></svelte:head>
<PageHeader title="Spacing" lead="8 + 4 px grid: one Tailwind step is 4px. Layout scope (blocks, apps) uses even steps (8px rhythm); control scope (primitives) may also use 4px half-steps. Enforced by ui8px lint." />
<Section id="space-scopes" title="Allowed steps per scope">
  <List class="ds-rows">
    <ListItem class="ds-row"><Inline class="ds-row-label">layout</Inline><Inline class="ds-meta">{px(spacing.layout)}</Inline></ListItem>
    <ListItem class="ds-row"><Inline class="ds-row-label">control</Inline><Inline class="ds-meta">{px(spacing.control)}</Inline></ListItem>
  </List>
</Section>
<Section id="space-scale" title="Scale">
  <List class="ds-rows">
    {#each spaceSteps as s}<ListItem class="ds-row"><Inline class="ds-row-label">{s} · {Number(s) * 4}px</Inline><Inline class="ds-box ds-space-{s}" /></ListItem>{/each}
  </List>
</Section>
