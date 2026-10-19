import { pageTitle } from "$design/site";
import { Badge, Box, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Form, Image, Inline, Input, Label, List, ListItem, Text } from "@saas-design/ui/react";
import type { DashboardStatsData, NewsletterBandData, PricingTwoPlansData, TestimonialCardsData } from "@saas-design/blocks/react";
import { blockData } from "$design/blocks";
import { PageHeader } from "../components/PageHeader";
import { Section } from "../components/Section";

export const title = pageTitle("Widgets");

// Widgets: small compositions of packages/ui components, fed by the same fixture view data as the blocks.
const pricing = blockData("pricing-two-plans") as PricingTwoPlansData;
const testimonials = blockData("testimonial-cards") as TestimonialCardsData;
const stats = blockData("dashboard-stats") as DashboardStatsData;
const newsletter = blockData("newsletter-band") as NewsletterBandData;
const plan = pricing.plans[pricing.plans.length - 1]!;
const quote = testimonials.items[0]!;

export function WidgetsPage() {
  return (
    <>
      <PageHeader title="Widgets" lead="Compositions of @saas-design/ui components (Card, Badge, Button, Input, Image) with fixture data. Blocks are built from the same pieces." />
      <Section id="w-plan" title="Plan card">
        <Card className="ds-widget">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            {plan.badge ? <Badge className="ds-widget-badge">{plan.badge}</Badge> : null}
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="ds-widget-value">{plan.price}<Inline className="ds-meta"> {plan.period}</Inline></Text>
            <List className="ds-widget-list">
              {plan.features.map((f) => <ListItem className={f.included ? "ds-name" : "ds-meta"} key={f.label}>{f.included ? "✓" : "–"} {f.label}</ListItem>)}
            </List>
          </CardContent>
          <CardFooter><Button href={plan.cta.href}>{plan.cta.label}</Button></CardFooter>
        </Card>
      </Section>
      <Section id="w-quote" title="Testimonial card">
        <Card className="ds-widget">
          <CardContent>
            <Text>{quote.quote}</Text>
            <Box className="ds-widget-person">
              <Image src={quote.avatar.src} alt={quote.avatar.alt} variant="avatar" size="md" />
              <Box><Text className="ds-name">{quote.name}</Text><Text className="ds-meta">{quote.role}</Text></Box>
            </Box>
          </CardContent>
        </Card>
      </Section>
      <Section id="w-stats" title="Stat cards">
        <List className="ds-grid">
          {stats.cards.map((c) => (
            <ListItem key={c.label}>
              <Card>
                <CardHeader><CardDescription>{c.label}</CardDescription><CardTitle>{c.value}</CardTitle></CardHeader>
                <CardContent><Text className="ds-meta">{c.hint}</Text></CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      </Section>
      <Section id="w-newsletter" title="Newsletter form">
        <Form className="ds-widget ds-widget-form" action={newsletter.action} method="post">
          <Label htmlFor="w-email">{newsletter.label}</Label>
          <Input id="w-email" name="email" type="email" placeholder={newsletter.placeholder} required />
          <Button type="submit">{newsletter.button}</Button>
        </Form>
      </Section>
    </>
  );
}
