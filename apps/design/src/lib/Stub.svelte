<script lang="ts">
  let { title }: { title: string } = $props();
</script>

<svelte:head><title>{title} · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">{title}</h1>
  <p class="ds-lead">Coming next.</p>
</header>
