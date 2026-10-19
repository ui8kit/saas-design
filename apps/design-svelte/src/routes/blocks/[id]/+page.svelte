<script lang="ts">
  import { pageTitle } from "$design/site";
  import { List, ListItem, Text } from "@saas-design/ui";
  import BlockPreview from "$lib/BlockPreview.svelte";
  import PageHeader from "$lib/PageHeader.svelte";
  import Pager from "$lib/Pager.svelte";
  import Section from "$lib/Section.svelte";
  let { data } = $props();
</script>

<svelte:head><title>{pageTitle(data.meta.title, "Blocks")}</title></svelte:head>
<PageHeader eyebrow="blocks / {data.meta.category}" title={data.meta.title} lead={data.meta.description}>
  <Text class="ds-meta">React: {data.meta.name} · Svelte: {data.meta.name} · templ: blocks.{data.meta.name} · Figma: {data.meta.figma ?? "catalog (no Figma node)"}</Text>
</PageHeader>
<Section label="Preview">
  {#key data.meta.id}<BlockPreview id={data.meta.id} />{/key}
</Section>
<Section id="classes-title" title="Semantic classes (packages/adapter)" titleClass="ds-h3">
  <List class="ds-toc">{#each data.meta.classes as c}<ListItem class="ds-chip">.{c}</ListItem>{/each}</List>
</Section>
<Pager prev={data.prev} next={data.next} />
