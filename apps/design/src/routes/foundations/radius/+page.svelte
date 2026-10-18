<script lang="ts">
  import { radii, radius } from "$lib/foundations";
</script>

<svelte:head><title>Radius · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Radius</h1>
  <p class="ds-lead">--radius is {radius.base} ({radius.px}px, from Figma). rounded-sm/md/lg/xl derive from it (×0.25 / ×0.5 / ×1 / ×1.5).</p>
</header>
<ul class="ds-grid">
  {#each radii as r}
    <li class="ds-sample"><span class="ds-tile ds-radius-{r}"></span><span class="ds-name">rounded-{r}</span></li>
  {/each}
</ul>
