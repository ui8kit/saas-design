<script lang="ts">
  import { colors } from "$lib/foundations";
  const groups = [
    { id: "light", title: "shadcn tokens · light", items: colors.light },
    { id: "dark", title: "shadcn tokens · dark (.dark)", items: colors.dark },
    { id: "brand", title: "App-level brand tokens (apps only, never packages/)", items: colors.brand },
  ];
</script>

<svelte:head><title>Colors · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Colors</h1>
  <p class="ds-lead">shadcn HSL token set from fixtures/tokens/tokens.json (mapped from Figma variables). Markup only uses token utilities through the adapter.</p>
</header>
{#each groups as g}
  <section class="ds-section" aria-labelledby="colors-{g.id}">
    <h2 class="ds-h2" id="colors-{g.id}">{g.title}</h2>
    <ul class="ds-grid">
      {#each g.items as c}
        <li class="ds-sample {g.id === 'dark' ? 'dark ds-sample-dark' : ''}">
          <span class="ds-swatch ds-swatch-{c.name}"></span>
          <span class="ds-name">--{c.name}</span>
          <span class="ds-meta">{c.hsl}</span>
          <span class="ds-meta">{c.hex} · {c.source}</span>
        </li>
      {/each}
    </ul>
  </section>
{/each}
