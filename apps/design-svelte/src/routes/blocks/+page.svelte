<script lang="ts">
  import { blocks, categories } from "$lib/blocks";
</script>

<svelte:head><title>Blocks · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Blocks</h1>
  <p class="ds-lead">{blocks.length} page sections from packages/blocks, generated from one DSL into Svelte 5 and Go templ with identical DOM. Previews use fixtures/views/blocks.json (contract records).</p>
</header>
{#each categories as cat}
  <section class="ds-section" aria-labelledby="cat-{cat.id}">
    <h2 class="ds-h2" id="cat-{cat.id}">{cat.id}</h2>
    <ul class="ds-cards">
      {#each cat.blocks as b}
        <li class="ds-card">
          <a class="ds-card-link" href="/blocks/{b.id}">{b.title}</a>
          <p class="ds-meta">{b.description}</p>
        </li>
      {/each}
    </ul>
  </section>
{/each}
