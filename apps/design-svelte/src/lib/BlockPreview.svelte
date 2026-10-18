<script lang="ts">
  import { registry } from "@saas-design/blocks";
  import { blockData } from "$design/blocks";

  let { id }: { id: string } = $props();
  const Block = $derived(registry[id]);
  const data = $derived(blockData(id));
</script>

<div class="ds-frame">
  {#if Block && data}<Block {data} />{:else}<p class="ds-meta">No preview data for {id}.</p>{/if}
</div>
