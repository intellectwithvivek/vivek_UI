import { Button, Pricing } from '@the_viveksingh/vivek-ui'

const PLANS = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 'Free',
    description: 'For side projects and prototypes.',
    features: ['All 102 components', 'All 10 charts', 'Design tokens', 'Community support'],
    cta: <Button variant="outline">Start building</Button>,
  },
  {
    id: 'team',
    name: 'Team',
    price: 'Free',
    period: '/forever',
    description: 'The same library. There is no paid tier.',
    features: [
      'Everything in Hobby',
      'Commercial use under MIT',
      'No seat limits',
      'No attribution required',
    ],
    cta: <Button>Install it</Button>,
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Free',
    description: 'Audit it, fork it, vendor it.',
    features: [
      'Zero runtime dependencies',
      'Readable source',
      'Semantic versioning',
      'MIT licence',
    ],
    cta: <Button variant="outline">Read the licence</Button>,
  },
]

export default function PricingPreview() {
  return (
    <Pricing
      padding="md"
      eyebrow="Pricing"
      title="Every plan is the same plan"
      description="It is free software. The table exists to show the component, not to sell you anything."
      plans={PLANS}
      columns={{ base: 1, md: 3 }}
    />
  )
}
