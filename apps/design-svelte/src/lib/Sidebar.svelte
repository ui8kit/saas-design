<script lang="ts">
  // Desktop sidebar (from lg): brand, theme toggle, navigation.
  import { Block, Box, LinkPlain, ThemeToggle } from "@saas-design/ui";
  import NavTree from "./NavTree.svelte";
  let { path }: { path: string } = $props();
</script>

<Block tag="aside" class="ds-sidebar">
  <Box class="ds-sidebar-head">
    <LinkPlain class="ds-brand" href="/">Habitus Design</LinkPlain>
    <ThemeToggle variant="ghost" size="sm" />
  </Box>
  <NavTree prefix="side" {path} />
</Block>
