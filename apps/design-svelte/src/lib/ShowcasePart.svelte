<script lang="ts">
  // One part of a brick: every showcase case rendered with the codegen Svelte output (`props` = Svelte prop names), plus its prop table.
  import type { Component } from "svelte";
  import { Block, Box, Inline, List, ListItem, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Text, Title } from "@saas-design/ui";
  import type showcase from "$packages/ui/showcase.json";
  import { sampleChildren } from "$design/samples";

  type Part = (typeof showcase)[number]["parts"][number];
  let { part, Comp }: { part: Part; Comp?: Component<Record<string, unknown>> } = $props();
</script>

<Block tag="article" class="ds-part">
  <Title as={3} class="ds-h3">{part.name}</Title>
  {#if part.docs}<Text class="ds-meta">{part.docs}</Text>{/if}
  {#if Comp}
    <List class="ds-preview">
      {#each part.cases as c}
        <ListItem class="ds-case">
          <Inline class="ds-meta">{c.id}</Inline>
          <Box class="ds-case-body">
            {#if part.children}<Comp {...c.props}>{sampleChildren(part.name)}</Comp>{:else}<Comp {...c.props} />{/if}
          </Box>
        </ListItem>
      {/each}
    </List>
  {/if}
  {#if part.props.length}
    <Table class="ds-table">
      <TableHead>
        <TableRow><TableHeadCell class="ds-th">Prop</TableHeadCell><TableHeadCell class="ds-th">Type</TableHeadCell><TableHeadCell class="ds-th">Notes</TableHeadCell></TableRow>
      </TableHead>
      <TableBody>
        {#each part.props as p}
          <TableRow><TableCell class="ds-td ds-name">{p.name}</TableCell><TableCell class="ds-td ds-meta">{p.type}</TableCell><TableCell class="ds-td ds-meta">{p.docs}</TableCell></TableRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</Block>
