<script lang="ts">
  import { pageTitle } from "$design/site";
  import { Badge, Box, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Form, Image, Inline, Input, Label, List, ListItem, Text } from "@saas-design/ui";
  import type { DashboardStatsData, NewsletterBandData, PricingTwoPlansData, TestimonialCardsData } from "@saas-design/blocks";
  import { blockData } from "$design/blocks";
  import PageHeader from "$lib/PageHeader.svelte";
  import Section from "$lib/Section.svelte";

  // Widgets: small compositions of packages/ui components, fed by the same fixture view data as the blocks.
  const pricing = blockData("pricing-two-plans") as PricingTwoPlansData;
  const testimonials = blockData("testimonial-cards") as TestimonialCardsData;
  const stats = blockData("dashboard-stats") as DashboardStatsData;
  const newsletter = blockData("newsletter-band") as NewsletterBandData;
  const plan = pricing.plans[pricing.plans.length - 1]!;
  const quote = testimonials.items[0]!;
</script>

<svelte:head><title>{pageTitle("Widgets")}</title></svelte:head>
<PageHeader title="Widgets" lead="Compositions of @saas-design/ui components (Card, Badge, Button, Input, Image) with fixture data. Blocks are built from the same pieces." />
<Section id="w-plan" title="Plan card">
  <Card class="ds-widget">
    <CardHeader>
      <CardTitle>{plan.name}</CardTitle>
      {#if plan.badge}<Badge class="ds-widget-badge">{plan.badge}</Badge>{/if}
      <CardDescription>{plan.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Text class="ds-widget-value">{plan.price}<Inline class="ds-meta"> {plan.period}</Inline></Text>
      <List class="ds-widget-list">
        {#each plan.features as f}<ListItem class={f.included ? "ds-name" : "ds-meta"}>{f.included ? "✓" : "–"} {f.label}</ListItem>{/each}
      </List>
    </CardContent>
    <CardFooter><Button href={plan.cta.href}>{plan.cta.label}</Button></CardFooter>
  </Card>
</Section>
<Section id="w-quote" title="Testimonial card">
  <Card class="ds-widget">
    <CardContent>
      <Text>{quote.quote}</Text>
      <Box class="ds-widget-person">
        <Image src={quote.avatar.src} alt={quote.avatar.alt} variant="avatar" size="md" />
        <Box><Text class="ds-name">{quote.name}</Text><Text class="ds-meta">{quote.role}</Text></Box>
      </Box>
    </CardContent>
  </Card>
</Section>
<Section id="w-stats" title="Stat cards">
  <List class="ds-grid">
    {#each stats.cards as c}
      <ListItem>
        <Card>
          <CardHeader><CardDescription>{c.label}</CardDescription><CardTitle>{c.value}</CardTitle></CardHeader>
          <CardContent><Text class="ds-meta">{c.hint}</Text></CardContent>
        </Card>
      </ListItem>
    {/each}
  </List>
</Section>
<Section id="w-newsletter" title="Newsletter form">
  <Form class="ds-widget ds-widget-form" action={newsletter.action} method="post">
    <Label for="w-email">{newsletter.label}</Label>
    <Input id="w-email" name="email" type="email" placeholder={newsletter.placeholder} required />
    <Button type="submit">{newsletter.button}</Button>
  </Form>
</Section>
