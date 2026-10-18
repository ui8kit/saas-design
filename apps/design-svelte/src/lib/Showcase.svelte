<script lang="ts">
  import type { Component } from "svelte";
  import showcase from "$packages/ui/showcase.json";

  let { kind, title, lead }: { kind: "primitive" | "component"; title: string; lead: string } = $props();

  // Every generated Svelte 5 part of packages/ui, keyed "<dir>/<file>" (the `file` of a part in showcase.json).
  const modules = import.meta.glob<{ default: Component<Record<string, unknown>> }>("../../../../packages/ui/svelte/src/primitives/*/*.svelte", { eager: true });
  const parts: Record<string, Component<Record<string, unknown>>> = {};
  for (const [path, mod] of Object.entries(modules)) parts[path.split("/").slice(-2).join("/").replace(/\.svelte$/, "")] = mod.default;

  const bricks = showcase.filter((b) => b.kind === kind);
  const slug = (id: string) => id.replace(/^ui\./, "").replaceAll(".", "-");
</script>

<svelte:head><title>{title} · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">{title}</h1>
  <p class="ds-lead">{lead}</p>
  <ul class="ds-toc">
    {#each bricks as b}<li><a class="ds-toc-link" href="#{slug(b.id)}">{slug(b.id)}</a></li>{/each}
  </ul>
</header>

{#each bricks as b}
  <section class="ds-section" id={slug(b.id)} aria-labelledby="{slug(b.id)}-title">
    <h2 class="ds-h2" id="{slug(b.id)}-title">{b.id}</h2>
    {#if b.docs}<p class="ds-text">{b.docs}</p>{/if}
    {#each b.parts as part}
      {@const Comp = parts[part.file]}
      <article class="ds-part">
        <h3 class="ds-h3">{part.name}</h3>
        {#if part.docs}<p class="ds-meta">{part.docs}</p>{/if}
        {#if Comp}
          <ul class="ds-preview">
            {#each part.cases as c}
              <li class="ds-case">
                <span class="ds-meta">{c.id}</span>
                <div class="ds-case-body">
                  {#if part.children}<Comp {...c.props}>{part.name}</Comp>{:else}<Comp {...c.props} />{/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
        {#if part.props.length}
          <table class="ds-table">
            <thead><tr><th class="ds-th">Prop</th><th class="ds-th">Type</th><th class="ds-th">Notes</th></tr></thead>
            <tbody>
              {#each part.props as p}
                <tr><td class="ds-td ds-name">{p.name}</td><td class="ds-td ds-meta">{p.type}</td><td class="ds-td ds-meta">{p.docs}</td></tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </article>
    {/each}
  </section>
{/each}
