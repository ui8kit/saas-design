<!-- Svelte 5 icon component: the same <svg> as svg(name, cls) (Go icons.Icon / icons.SVG, React <Icon>).
     Blocks render <Icon name class />, so the one raw-HTML write of an icon lives here (static registry), never in composition code. -->
<script lang="ts">
  import { svg } from "./icons.generated";
  let { name, class: cls = "" }: { name: string; class?: string } = $props();
</script>

{@html svg(name, cls)}
