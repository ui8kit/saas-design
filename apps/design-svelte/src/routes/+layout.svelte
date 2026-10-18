<script lang="ts">
  import "$lib/styles/app.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { Sheet, SheetClose, SheetTrigger, ThemeToggle } from "@saas-design/ui";
  import { nav } from "$design/nav";

  let { children } = $props();
  // shared vanilla behaviors (theme toggle, sheet): same script as apps/site, loaded client-side only
  onMount(() => { import("../../../../packages/ui/behaviors/ui8kit.js"); });
</script>

{#snippet navTree(prefix: string)}
  <nav aria-label="Design system">
    {#each nav as group, gi}
      <div class="ds-nav-group">
        <p class="ds-nav-title" id="{prefix}-group-{gi}">{group.title}</p>
        <ul class="ds-nav-list" aria-labelledby="{prefix}-group-{gi}">
          {#each group.items as item}
            <li>
              <a class="ds-nav-link" href={item.href} aria-current={page.url.pathname === item.href ? "page" : undefined}>{item.label}</a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>
{/snippet}

<a class="ui-skip" href="#content">Skip to content</a>
<header class="ds-topbar">
  <a class="ds-brand" href="/">Habitus Design</a>
  <div class="ds-topbar-actions">
    <ThemeToggle variant="ghost" />
    <SheetTrigger variant="ghost" controls="ds-nav-sheet" aria-label="Open navigation" />
  </div>
</header>
<Sheet id="ds-nav-sheet" side="left" aria-label="Design system navigation">
  <SheetClose variant="ghost" class="ds-sheet-close" aria-label="Close navigation" />
  {@render navTree("sheet")}
</Sheet>
<div class="ds-shell">
  <aside class="ds-sidebar">
    <div class="ds-sidebar-head">
      <a class="ds-brand" href="/">Habitus Design</a>
      <ThemeToggle variant="ghost" size="sm" />
    </div>
    {@render navTree("side")}
  </aside>
  <main class="ds-main" id="content">
    {@render children()}
  </main>
</div>
