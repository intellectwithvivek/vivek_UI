'use client'

import { Button, Container, Pricing, Stack, Switch, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const BASE = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 12,
    description: 'For solo makers.',
    features: ['1 seat', '5 GB storage', 'Email support'],
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 39,
    description: 'For small teams.',
    features: ['10 seats', '100 GB storage', 'Shared workspaces', 'Priority support'],
    highlighted: true,
    badge: 'Best value',
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 99,
    description: 'For whole companies.',
    features: ['Unlimited seats', '1 TB storage', 'SSO and audit log', 'Dedicated manager'],
  },
]

export default function PricingWithToggle() {
  const [yearly, setYearly] = useState(false)
  const plans = BASE.map((plan) => ({
    ...plan,
    price: `$${yearly ? Math.round(plan.monthly * 0.8) : plan.monthly}`,
    period: yearly ? '/month, billed yearly' : '/month',
    cta: (
      <Button fullWidth variant={plan.highlighted ? 'solid' : 'outline'}>
        Choose {plan.name}
      </Button>
    ),
  }))

  return (
    <>
      <Container size="md" style={{ paddingBlockStart: '3rem' }}>
        <Stack align="center" gap={2}>
          <Switch
            label={yearly ? 'Billed yearly — saving 20%' : 'Bill yearly and save 20%'}
            checked={yearly}
            onChange={(event) => setYearly(event.target.checked)}
          />
          <Text size="sm" tone="muted">
            Switch any time. Yearly plans are refundable for 30 days.
          </Text>
        </Stack>
      </Container>
      <Pricing padding="md" title="Pick a plan" plans={plans} />
    </>
  )
}
