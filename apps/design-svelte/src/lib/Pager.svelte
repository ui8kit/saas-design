<script lang="ts">
  // Previous / next block links at the bottom of a block page.
  import { Block, Inline, LinkPlain } from "@saas-design/ui";
  import type { BlockMeta } from "$design/blocks";
  let { prev, next }: { prev?: BlockMeta; next?: BlockMeta } = $props();
</script>

<Block tag="nav" class="ds-pager" aria-label="Blocks">
  {#if prev}<LinkPlain class="ds-toc-link" href="/blocks/{prev.id}">← {prev.title}</LinkPlain>{:else}<Inline />{/if}
  {#if next}<LinkPlain class="ds-toc-link" href="/blocks/{next.id}">{next.title} →</LinkPlain>{/if}
</Block>
