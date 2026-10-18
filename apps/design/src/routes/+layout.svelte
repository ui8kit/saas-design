<script lang="ts">
  import "$lib/styles/app.css";
  import { page } from "$app/state";
  import { nav } from "$lib/nav";

  let { children } = $props();
</script>

<a class="ui-skip" href="#content">Skip to content</a>
<div class="ds-shell">
  <aside class="ds-sidebar">
    <a class="ds-brand" href="/">Habitus Design</a>
    <nav aria-label="Design system">
      {#each nav as group}
        <div class="ds-nav-group">
          <p class="ds-nav-title">{group.title}</p>
          <ul class="ds-nav-list">
            {#each group.items as item}
              <li>
                <a class="ds-nav-link" href={item.href} aria-current={page.url.pathname === item.href ? "page" : undefined}>{item.label}</a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </nav>
  </aside>
  <main class="ds-main" id="content">
    {@render children()}
  </main>
</div>
