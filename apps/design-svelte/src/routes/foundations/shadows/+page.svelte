<script lang="ts">
  import { pageTitle } from "$design/site";
  import { Inline, List, ListItem } from "@saas-design/ui";
  import { shadows, shadowTokens } from "$design/foundations";
  import PageHeader from "$lib/PageHeader.svelte";
</script>

<svelte:head><title>{pageTitle("Shadows")}</title></svelte:head>
<PageHeader title="Shadows" lead="{shadowTokens.$comment} The Tailwind shadow steps stay available for app-level surfaces." />
<List class="ds-grid">
  {#each shadows as s}<ListItem class="ds-sample"><Inline class="ds-tile ds-radius-lg ds-shadow-{s}" /><Inline class="ds-name">{s === "base" ? "shadow" : `shadow-${s}`}</Inline></ListItem>{/each}
</List>
