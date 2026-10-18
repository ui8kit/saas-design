<script lang="ts">
  import { font, typeScale, typeSteps } from "$design/foundations";
</script>

<svelte:head><title>Typography · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Typography</h1>
  <p class="ds-lead">Family {font.sans} (--font-sans). Tailwind type steps used by the adapter, and the Figma type scale they were derived from.</p>
</header>
<section class="ds-section" aria-labelledby="type-steps">
  <h2 class="ds-h2" id="type-steps">Type steps</h2>
  <ul class="ds-rows">
    {#each typeSteps as t}
      <li class="ds-row"><span class="ds-row-label">text-{t}</span><span class="ds-type-{t}">Build better habits</span></li>
    {/each}
  </ul>
</section>
<section class="ds-section" aria-labelledby="type-figma">
  <h2 class="ds-h2" id="type-figma">Figma type scale</h2>
  <ul class="ds-rows">
    {#each typeScale as s}
      <li class="ds-row">
        <span class="ds-row-label">{s.size}px / {s.weight}</span>
        <span class="ds-meta">{s.tailwind ?? "no Tailwind step (display)"} · used {s.count}×</span>
      </li>
    {/each}
  </ul>
</section>
