<script lang="ts">
  import { LinkPlain, List, ListItem, Text } from "@saas-design/ui";
  import { blocks, categories } from "$design/blocks";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";
</script>

<svelte:head><title>Blocks · Habitus Design</title></svelte:head>
<PageHeader title="Blocks" lead="{blocks.length} page sections from packages/blocks, generated from one DSL into React 19, Svelte 5 and Go templ with identical DOM. Previews use fixtures/views/blocks.json (contract records)." />
{#each categories as cat}
  <Section id="cat-{cat.id}" title={cat.id}>
    <List class="ds-cards">
      {#each cat.blocks as b}
        <ListItem class="ds-card">
          <LinkPlain class="ds-card-link" href="/blocks/{b.id}">{b.title}</LinkPlain>
          <Text class="ds-meta">{b.description}</Text>
        </ListItem>
      {/each}
    </List>
  </Section>
{/each}
