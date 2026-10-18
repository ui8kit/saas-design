<script lang="ts">
  import { Inline, List, ListItem } from "@saas-design/ui";
  import { radii, radius } from "$design/foundations";
  import PageHeader from "$lib/PageHeader.svelte";
</script>

<svelte:head><title>Radius · Habitus Design</title></svelte:head>
<PageHeader title="Radius" lead="--radius is {radius.base} ({radius.px}px, from Figma). rounded-sm/md/lg/xl derive from it (×0.25 / ×0.5 / ×1 / ×1.5)." />
<List class="ds-grid">
  {#each radii as r}<ListItem class="ds-sample"><Inline class="ds-tile ds-radius-{r}" /><Inline class="ds-name">rounded-{r}</Inline></ListItem>{/each}
</List>
