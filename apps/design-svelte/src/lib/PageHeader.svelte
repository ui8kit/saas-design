<script lang="ts">
  // The header of every page: the page's one Block (semantic <header>). Pages open on it (block-root rule).
  import type { Snippet } from "svelte";
  import { Block, Text, Title } from "@saas-design/ui";
  let { title, lead, eyebrow, children }: { title: string; lead?: string; eyebrow?: string; children?: Snippet } = $props();
</script>

<Block tag="header" class="ds-header">
  {#if eyebrow}<Text class="ds-meta">{eyebrow}</Text>{/if}
  <Title as={1} class="ds-title">{title}</Title>
  {#if lead}<Text class="ds-lead">{lead}</Text>{/if}
  {@render children?.()}
</Block>
