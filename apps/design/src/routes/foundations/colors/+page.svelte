<script lang="ts">
  import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ThemeToggle } from "@saas-design/ui";
  import { colors } from "$lib/foundations";
  const groups = [
    { id: "light", title: "shadcn tokens · light", items: colors.light },
    { id: "dark", title: "shadcn tokens · dark (.dark)", items: colors.dark },
    { id: "brand", title: "App-level brand tokens · light (apps only, never packages/)", items: colors.brand },
    { id: "brand-dark", title: "App-level brand tokens · dark", items: colors.brandDark },
  ];
</script>

<svelte:head><title>Colors · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Colors</h1>
  <p class="ds-lead">shadcn HSL token set from fixtures/tokens/tokens.json (mapped from Figma variables). Markup only uses token utilities through the adapter.</p>
</header>
<section class="ds-section" aria-labelledby="colors-preview">
  <h2 class="ds-h2" id="colors-preview">Light / dark preview</h2>
  <p class="ds-text">The same components rendered under each token set (scoped with data-theme, independent of the page theme). Toggle the page theme with <ThemeToggle variant="ghost" size="sm" />.</p>
  <div class="ds-modes">
    {#each [["light", "Light"], ["dark", "Dark"]] as [mode, label]}
      <div class="ds-mode {mode === 'dark' ? 'dark' : ''}" data-theme={mode}>
        <p class="ds-name">{label}</p>
        <Card>
          <CardHeader><CardTitle>Premium</CardTitle><CardDescription>All features you need</CardDescription></CardHeader>
          <CardContent>
            <div class="ds-mode-row">
              <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
            </div>
            <div class="ds-mode-row"><Badge>Popular</Badge><Badge variant="secondary">New</Badge><span class="ds-meta">muted-foreground text</span></div>
          </CardContent>
        </Card>
        <ul class="ds-mode-swatches">
          {#each ["chart-3", "chart-4", "chart-5", "accent", "muted"] as c}<li class="ds-mode-swatch ds-swatch-{c}"><span class="ds-mode-swatch-label">{c}</span></li>{/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

{#each groups as g}
  <section class="ds-section" aria-labelledby="colors-{g.id}">
    <h2 class="ds-h2" id="colors-{g.id}">{g.title}</h2>
    <ul class="ds-grid">
      {#each g.items as c}
        <li class="ds-sample {g.id.includes('dark') ? 'dark ds-sample-dark' : 'ds-sample-light'}" data-theme={g.id.includes("dark") ? "dark" : "light"}>
          <span class="ds-swatch ds-swatch-{c.name}"></span>
          <span class="ds-name">--{c.name}</span>
          <span class="ds-meta">{c.hsl}</span>
          <span class="ds-meta">{c.hex} · {c.source}</span>
        </li>
      {/each}
    </ul>
  </section>
{/each}
