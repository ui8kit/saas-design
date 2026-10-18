<script lang="ts">
  import { shadows, shadowTokens } from "$lib/foundations";
</script>

<svelte:head><title>Shadows · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Shadows</h1>
  <p class="ds-lead">{shadowTokens.$comment} The Tailwind shadow steps stay available for app-level surfaces.</p>
</header>
<ul class="ds-grid">
  {#each shadows as s}
    <li class="ds-sample"><span class="ds-tile ds-radius-lg ds-shadow-{s}"></span><span class="ds-name">{s === "base" ? "shadow" : `shadow-${s}`}</span></li>
  {/each}
</ul>
