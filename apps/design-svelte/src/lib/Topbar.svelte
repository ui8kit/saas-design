<script lang="ts">
  // Mobile top bar (hidden from lg): brand, theme toggle, Sheet trigger for the navigation.
  import { Block, Box, LinkPlain, SheetTrigger, ThemeToggle } from "@saas-design/ui";
</script>

<Block tag="header" class="ds-topbar">
  <LinkPlain class="ds-brand" href="/">Habitus Design</LinkPlain>
  <Box class="ds-topbar-actions">
    <ThemeToggle variant="ghost" />
    <SheetTrigger variant="ghost" controls="ds-nav-sheet" aria-label="Open navigation" />
  </Box>
</Block>
