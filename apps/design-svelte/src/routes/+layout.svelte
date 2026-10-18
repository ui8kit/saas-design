<script lang="ts">
  // App frame, same DOM as apps/design-react/src/components/Layout.tsx.
  import "$lib/styles/app.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { Box, Container, LinkPlain, Sheet, SheetClose } from "@saas-design/ui";
  import NavTree from "$lib/NavTree.svelte";
  import Sidebar from "$lib/Sidebar.svelte";
  import Topbar from "$lib/Topbar.svelte";

  let { children } = $props();
  // shared vanilla behaviors (theme toggle, sheet): same script as apps/site, loaded client-side only
  onMount(() => { import("../../../../packages/ui/behaviors/ui8kit.js"); });
</script>

<LinkPlain class="ui-skip" href="#content">Skip to content</LinkPlain>
<Topbar />
<Sheet id="ds-nav-sheet" side="left" aria-label="Design system navigation">
  <SheetClose variant="ghost" class="ds-sheet-close" aria-label="Close navigation" />
  <NavTree prefix="sheet" path={page.url.pathname} />
</Sheet>
<Box class="ds-shell">
  <Sidebar path={page.url.pathname} />
  <Container tag="main" class="ds-main" id="content">
    {@render children()}
  </Container>
</Box>
