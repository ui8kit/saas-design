<script lang="ts">
  import { spaceSteps, spacing } from "$design/foundations";
</script>

<svelte:head><title>Spacing · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Spacing</h1>
  <p class="ds-lead">8 + 4 px grid: one Tailwind step is 4px. Layout scope (blocks, apps) uses even steps (8px rhythm); control scope (primitives) may also use 4px half-steps. Enforced by ui8px lint.</p>
</header>
<section class="ds-section" aria-labelledby="space-scopes">
  <h2 class="ds-h2" id="space-scopes">Allowed steps per scope</h2>
  <ul class="ds-rows">
    <li class="ds-row"><span class="ds-row-label">layout</span><span class="ds-meta">{spacing.layout.map((s) => `${s} (${Number(s) * 4}px)`).join(" · ")}</span></li>
    <li class="ds-row"><span class="ds-row-label">control</span><span class="ds-meta">{spacing.control.map((s) => `${s} (${Number(s) * 4}px)`).join(" · ")}</span></li>
  </ul>
</section>
<section class="ds-section" aria-labelledby="space-scale">
  <h2 class="ds-h2" id="space-scale">Scale</h2>
  <ul class="ds-rows">
    {#each spaceSteps as s}
      <li class="ds-row"><span class="ds-row-label">{s} · {Number(s) * 4}px</span><span class="ds-box ds-space-{s}"></span></li>
    {/each}
  </ul>
</section>
