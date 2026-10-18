<script lang="ts">
  import Stub from "$lib/Stub.svelte";
  let { data } = $props();
</script>
<Stub title={data.meta.title} />
