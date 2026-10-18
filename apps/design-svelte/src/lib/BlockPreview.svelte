<script lang="ts">
  // One block of packages/blocks (codegen Svelte output) rendered with its fixture view data.
  import { Box, Text } from "@saas-design/ui";
  import { registry } from "@saas-design/blocks";
  import { blockData, frameClass } from "$design/blocks";

  let { id }: { id: string } = $props();
  const Preview = $derived(registry[id]);
  const data = $derived(blockData(id));
</script>

<Box class={frameClass(id)}>
  {#if Preview && data}<Preview {data} />{:else}<Text class="ds-meta">No preview data for {id}.</Text>{/if}
</Box>
