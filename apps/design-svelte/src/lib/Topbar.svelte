<script lang="ts">
  import { designName } from "$design/site";
  // Mobile top bar (hidden from lg): brand, theme toggle, Sheet trigger for the navigation.
  import { Block, Box, LinkPlain, SheetTrigger, ThemeToggle } from "@saas-design/ui";
</script>

<Block tag="header" class="ds-topbar">
  <LinkPlain class="ds-brand" href="/">{designName}</LinkPlain>
  <Box class="ds-topbar-actions">
    <ThemeToggle variant="ghost" />
    <SheetTrigger variant="ghost" controls="ds-nav-sheet" aria-label="Open navigation" />
  </Box>
</Block>
