<script lang="ts">
  // A page section: <section aria-labelledby> + <h2>. Container, not Block: a page has one Block (its header).
  import type { Snippet } from "svelte";
  import { Container, Title } from "@saas-design/ui";
  let { id, title, titleClass = "ds-h2", label, sectionId, children }: { id?: string; title?: string; titleClass?: string; label?: string; sectionId?: string; children?: Snippet } = $props();
</script>

<Container tag="section" class="ds-section" id={sectionId} aria-labelledby={title ? id : undefined} aria-label={label}>
  {#if title}<Title as={2} class={titleClass} {id}>{title}</Title>{/if}
  {@render children?.()}
</Container>
