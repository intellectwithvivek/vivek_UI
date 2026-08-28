'use client'

import {
  Badge,
  Button,
  Container,
  CTA,
  DataTable,
  FAQ,
  Heading,
  Pricing,
  Section,
  Stack,
  Switch,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/*
 * A pricing page.
 *
 * Two things usually break here. The comparison table is unreadable on a phone, because a
 * six-column table can only scroll sideways - so this one uses the `responsive="stack"`
 * behaviour and turns into one block per row below its breakpoint. And the monthly/annual
 * toggle is normally a pair of divs; here it is a real checkbox, which means it is
 * announced, focusable and operable with Space.
 */

const MATRIX = [
  { feature: 'Projects', starter: '3', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Team members', starter: '1', team: 'Up to 20', enterprise: 'Unlimited' },
  { feature: 'Version history', starter: '7 days', team: '1 year', enterprise: 'Forever' },
  { feature: 'SSO and SAML', starter: '—', team: '—', enterprise: 'Included' },
  { feature: 'Audit log', starter: '—', team: '90 days', enterprise: 'Forever' },
  { feature: 'Support', starter: 'Community', team: 'Email, 1 day', enterprise: 'Dedicated' },
  { feature: 'Uptime SLA', starter: '—', team: '99.9%', enterprise: '99.99%' },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'For one person, trying it out.',
      features: ['3 projects', '7-day history', 'Community support'],
      cta: (
        <Button fullWidth variant="outline">
          Start free
        </Button>
      ),
    },
    {
      id: 'team',
      name: 'Team',
      // Two months free on the annual plan, quoted as a monthly figure either way.
      price: annual ? '$24' : '$29',
      period: '/user/month',
      description: 'For a team shipping regularly.',
      features: ['Unlimited projects', '1 year of history', '90-day audit log', 'Email support'],
      cta: <Button fullWidth>Start 14-day trial</Button>,
      highlighted: true,
      badge: 'Most popular',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Talk to us',
      description: 'For procurement, security review and an SLA.',
      features: ['Everything in Team', 'SSO and SAML', 'Permanent audit log', '99.99% SLA'],
      cta: (
        <Button fullWidth variant="outline">
          Contact sales
        </Button>
      ),
    },
  ]

  return (
    <>
      <Section padding="xl">
        <Container size="md">
          <Stack align="center" gap={4}>
            <Badge variant="soft">Pricing</Badge>
            <Heading align="center" level={1} size="2xl">
              Priced per person, not per feature
            </Heading>
            <Text align="center" size="lg" tone="muted">
              Every plan includes every feature we have shipped. The tiers differ in scale and in
              what your security team needs, not in what the product can do.
            </Text>
            <Switch
              checked={annual}
              description={annual ? 'Two months free.' : 'Switch to annual and save two months.'}
              label="Bill annually"
              onChange={(event) => setAnnual(event.target.checked)}
            />
          </Stack>
        </Container>
      </Section>

      <Pricing plans={plans} />

      <Section padding="lg">
        <Container size="lg">
          <Stack gap={6}>
            <Heading level={2} size="lg">
              What is in each plan
            </Heading>
            {/*
              A four-column comparison on a 390px screen can only scroll sideways, which is
              a swipe-and-forget. `responsive="stack"` turns each row into its own labelled
              block below the breakpoint, so the comparison survives the phone.
            */}
            <DataTable
              caption="Feature comparison across the three plans"
              columns={[
                { key: 'feature', header: 'Feature' },
                { key: 'starter', header: 'Starter' },
                { key: 'team', header: 'Team' },
                { key: 'enterprise', header: 'Enterprise' },
              ]}
              data={MATRIX}
              responsive="stack"
              rowHeader="feature"
              rowKey="feature"
            />
          </Stack>
        </Container>
      </Section>

      <FAQ
        items={[
          {
            id: 'change',
            question: 'Can I change plan later?',
            answer:
              'Any time, in both directions. Upgrades take effect immediately and are prorated; downgrades take effect at the end of the current period.',
          },
          {
            id: 'trial',
            question: 'What happens when the trial ends?',
            answer:
              'The workspace drops to Starter. Nothing is deleted — projects beyond the third become read-only until you upgrade.',
          },
          {
            id: 'invoice',
            question: 'Do you invoice annually?',
            answer:
              'Yes, on the Team and Enterprise plans. Purchase orders and bank transfer are both fine.',
          },
          {
            id: 'nonprofit',
            question: 'Is there a discount for non-profits or education?',
            answer: 'Yes — 50% on any plan. Email us from your institutional address.',
          },
        ]}
        name="Pricing FAQ"
        title="Questions about billing"
      />

      <CTA
        actions={<Button size="lg">Start your trial</Button>}
        description="Fourteen days of the Team plan. No card up front."
        title="Try it on a real project"
        background="muted"
      />
    </>
  )
}
