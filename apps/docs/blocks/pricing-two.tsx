import { Button, Container, Pricing, Text } from '@the_viveksingh/vivek-ui'

const PLANS = [
  {
    id: 'free',
    name: 'Personal',
    price: '$0',
    period: 'forever',
    description: 'For one person and one device.',
    features: ['Unlimited notes', 'Sync on one device', 'Export to Markdown'],
    cta: (
      <Button fullWidth variant="outline">
        Download
      </Button>
    ),
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$6',
    period: '/month',
    description: 'For every device you own.',
    features: ['Everything in Personal', 'Sync everywhere', 'Version history', 'Shared notebooks'],
    cta: <Button fullWidth>Upgrade</Button>,
    highlighted: true,
  },
]

export default function PricingTwo() {
  return (
    <>
      <Pricing title="Two plans, no tiers to decode" plans={PLANS} columns={{ base: 1, sm: 2 }} />
      <Container size="md" style={{ paddingBlockEnd: '2rem', textAlign: 'center' }}>
        <Text size="sm" tone="muted">
          Students and teachers get Plus free. Prices exclude VAT where it applies.
        </Text>
      </Container>
    </>
  )
}
