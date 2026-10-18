<script lang="ts">
  // The design-system navigation (sidebar and mobile Sheet). The current page link carries a static aria-current in its own branch.
  import { Block, Box, LinkPlain, List, ListItem, Text } from "@saas-design/ui";
  import { nav } from "$design/nav";
  let { prefix, path }: { prefix: string; path: string } = $props();
</script>

<Block tag="nav" aria-label="Design system">
  {#each nav as group, gi}
    <Box class="ds-nav-group">
      <Text class="ds-nav-title" id="{prefix}-group-{gi}">{group.title}</Text>
      <List class="ds-nav-list" aria-labelledby="{prefix}-group-{gi}">
        {#each group.items as item}
          <ListItem>
            {#if path === item.href}
              <LinkPlain class="ds-nav-link" href={item.href} aria-current="page">{item.label}</LinkPlain>
            {:else}
              <LinkPlain class="ds-nav-link" href={item.href}>{item.label}</LinkPlain>
            {/if}
          </ListItem>
        {/each}
      </List>
    </Box>
  {/each}
</Block>
