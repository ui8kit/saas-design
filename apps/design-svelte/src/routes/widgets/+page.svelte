<script lang="ts">
  import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Image, Input, Label, List, ListItem, Text } from "@saas-design/ui";
  import { blockData } from "$design/blocks";
  import type { DashboardStatsData, NewsletterBandData, PricingTwoPlansData, TestimonialCardsData } from "@saas-design/blocks";

  // Widgets: small compositions of packages/ui components, fed by the same fixture view data as the blocks.
  const pricing = blockData("pricing-two-plans") as PricingTwoPlansData;
  const testimonials = blockData("testimonial-cards") as TestimonialCardsData;
  const stats = blockData("dashboard-stats") as DashboardStatsData;
  const newsletter = blockData("newsletter-band") as NewsletterBandData;
  const plan = pricing.plans[pricing.plans.length - 1]!;
  const quote = testimonials.items[0]!;
</script>

<svelte:head><title>Widgets · Habitus Design</title></svelte:head>
<header class="ds-header">
  <h1 class="ds-title">Widgets</h1>
  <p class="ds-lead">Compositions of @saas-design/ui components (Card, Badge, Button, Input, Image) with fixture data. Blocks are built from the same pieces.</p>
</header>

<section class="ds-section" aria-labelledby="w-plan">
  <h2 class="ds-h2" id="w-plan">Plan card</h2>
  <Card class="ds-widget">
    <CardHeader>
      <CardTitle>{plan.name}</CardTitle>
      {#if plan.badge}<Badge class="ds-widget-badge">{plan.badge}</Badge>{/if}
      <CardDescription>{plan.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Text class="ds-widget-value">{plan.price}<span class="ds-meta"> {plan.period}</span></Text>
      <List class="ds-widget-list">
        {#each plan.features as f}<ListItem class={f.included ? "ds-name" : "ds-meta"}>{f.included ? "✓" : "–"} {f.label}</ListItem>{/each}
      </List>
    </CardContent>
    <CardFooter><Button href={plan.cta.href}>{plan.cta.label}</Button></CardFooter>
  </Card>
</section>

<section class="ds-section" aria-labelledby="w-quote">
  <h2 class="ds-h2" id="w-quote">Testimonial card</h2>
  <Card class="ds-widget">
    <CardContent>
      <Text>{quote.quote}</Text>
      <div class="ds-widget-person">
        <Image src={quote.avatar.src} alt={quote.avatar.alt} variant="avatar" size="md" />
        <div><p class="ds-name">{quote.name}</p><p class="ds-meta">{quote.role}</p></div>
      </div>
    </CardContent>
  </Card>
</section>

<section class="ds-section" aria-labelledby="w-stats">
  <h2 class="ds-h2" id="w-stats">Stat cards</h2>
  <ul class="ds-grid">
    {#each stats.cards as c}
      <li>
        <Card>
          <CardHeader><CardDescription>{c.label}</CardDescription><CardTitle>{c.value}</CardTitle></CardHeader>
          <CardContent><p class="ds-meta">{c.hint}</p></CardContent>
        </Card>
      </li>
    {/each}
  </ul>
</section>

<section class="ds-section" aria-labelledby="w-newsletter">
  <h2 class="ds-h2" id="w-newsletter">Newsletter form</h2>
  <form class="ds-widget ds-widget-form" action={newsletter.action} method="post">
    <Label for="w-email">{newsletter.label}</Label>
    <Input id="w-email" name="email" type="email" placeholder={newsletter.placeholder} required />
    <Button type="submit">{newsletter.button}</Button>
  </form>
</section>
