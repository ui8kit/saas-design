<script lang="ts">
  import { LinkPlain, List, ListItem, Text } from "@saas-design/ui";
  import { guideGroups, guideHref, repo } from "$design/guides";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";
</script>

<svelte:head><title>Instructions · Habitus Design</title></svelte:head>
<PageHeader title="Instructions" lead="Guides for building a new app or brand with this repo: setup, tokens, blocks and codegen, the Figma parser, checks and deploy. Each link opens the document on GitHub." eyebrow={repo} />
{#each guideGroups as g}
  <Section id="guides-{g.id}" title={g.title}>
    <List class="ds-cards">
      {#each g.guides as guide}
        <ListItem class="ds-card">
          <LinkPlain class="ds-card-link" href={guideHref(guide.path)}>{guide.title}</LinkPlain>
          <Text class="ds-meta">{guide.text}</Text>
          <Text class="ds-meta">{guide.path}</Text>
        </ListItem>
      {/each}
    </List>
  </Section>
{/each}
