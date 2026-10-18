<script lang="ts">
  import BlockPreview from "$lib/BlockPreview.svelte";
  let { data } = $props();
</script>

<svelte:head><title>{data.meta.title} · Blocks · Habitus Design</title></svelte:head>
<header class="ds-header">
  <p class="ds-meta">blocks / {data.meta.category}</p>
  <h1 class="ds-title">{data.meta.title}</h1>
  <p class="ds-lead">{data.meta.description}</p>
  <p class="ds-meta">React: {data.meta.name} · Svelte: {data.meta.name} · templ: blocks.{data.meta.name} · Figma: {data.meta.figma ?? "catalog (no Figma node)"}</p>
</header>
<section class="ds-section" aria-label="Preview">
  {#key data.meta.id}<BlockPreview id={data.meta.id} />{/key}
</section>
<section class="ds-section" aria-labelledby="classes-title">
  <h2 class="ds-h3" id="classes-title">Semantic classes (packages/adapter)</h2>
  <ul class="ds-toc">{#each data.meta.classes as c}<li class="ds-chip">.{c}</li>{/each}</ul>
</section>
<nav class="ds-pager" aria-label="Blocks">
  {#if data.prev}<a class="ds-toc-link" href="/blocks/{data.prev.id}">← {data.prev.title}</a>{:else}<span></span>{/if}
  {#if data.next}<a class="ds-toc-link" href="/blocks/{data.next.id}">{data.next.title} →</a>{/if}
</nav>
