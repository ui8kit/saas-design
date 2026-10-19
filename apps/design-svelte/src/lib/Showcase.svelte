<script lang="ts">
  import { pageTitle } from "$design/site";
  // Primitives / Components pages: every brick of packages/ui of one kind, from packages/ui/showcase.json.
  import type { Component } from "svelte";
  import { LinkPlain, List, ListItem, Text } from "@saas-design/ui";
  import showcase from "$packages/ui/showcase.json";
  import PageHeader from "./PageHeader.svelte";
  import Section from "./Section.svelte";
  import ShowcasePart from "./ShowcasePart.svelte";

  let { kind, title, lead }: { kind: "primitive" | "component"; title: string; lead: string } = $props();

  // Every generated Svelte 5 part of packages/ui, keyed "<dir>/<file>" (the `file` of a part in showcase.json).
  const modules = import.meta.glob<{ default: Component<Record<string, unknown>> }>("../../../../packages/ui/svelte/src/primitives/*/*.svelte", { eager: true });
  const parts: Record<string, Component<Record<string, unknown>>> = {};
  for (const [path, mod] of Object.entries(modules)) parts[path.split("/").slice(-2).join("/").replace(/\.svelte$/, "")] = mod.default;

  const bricks = $derived(showcase.filter((b) => b.kind === kind));
  const slug = (id: string) => id.replace(/^ui\./, "").replaceAll(".", "-");
</script>

<svelte:head><title>{pageTitle(title)}</title></svelte:head>
<PageHeader {title} {lead}>
  <List class="ds-toc">
    {#each bricks as b}<ListItem><LinkPlain class="ds-toc-link" href="#{slug(b.id)}">{slug(b.id)}</LinkPlain></ListItem>{/each}
  </List>
</PageHeader>
{#each bricks as b}
  <Section sectionId={slug(b.id)} id="{slug(b.id)}-title" title={b.id}>
    {#if b.docs}<Text class="ds-text">{b.docs}</Text>{/if}
    {#each b.parts as part}<ShowcasePart {part} Comp={parts[part.file]} />{/each}
  </Section>
{/each}
