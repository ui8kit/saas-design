<script lang="ts">
  import { nav } from "$design/nav";
</script>

<svelte:head><title>Habitus Design System</title></svelte:head>

<header class="ds-header">
  <h1 class="ds-title">Habitus Design System</h1>
  <p class="ds-lead">
    Foundations, primitives, components, widgets and blocks generated from the Figma file. Every page renders the same
    Svelte 5 packages the site uses in Go templ: shadcn HSL tokens, semantic ui-* classes from the adapter, fixtures that
    conform to @ui8kit/contract.
  </p>
</header>

<section class="ds-section" aria-labelledby="sections-title">
  <h2 class="ds-h2" id="sections-title">Sections</h2>
  <ul class="ds-cards">
    {#each nav.slice(1, 3).flatMap((g) => g.items) as item}
      <li class="ds-card"><a class="ds-card-link" href={item.href}>{item.label}</a></li>
    {/each}
  </ul>
</section>
