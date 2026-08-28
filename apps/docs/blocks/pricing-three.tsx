import { Button, Pricing } from '@the_viveksingh/vivek-ui'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'For side projects and trying it out.',
    features: ['1 project', '1,000 events a day', 'Community support'],
    cta: (
      <Button fullWidth variant="outline">
        Start free
      </Button>
    ),
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For teams shipping to real users.',
    features: ['Unlimited projects', '1M events a day', 'Email support', 'Custom domains'],
    cta: <Button fullWidth>Start a trial</Button>,
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$99',
    period: '/month',
    description: 'For products with a team behind them.',
    features: ['Everything in Pro', '10M events a day', 'SAML SSO', 'Priority support'],
    cta: (
      <Button fullWidth variant="outline">
        Talk to sales
      </Button>
    ),
  },
]

export default function PricingThree() {
  return (
    <Pricing
      eyebrow="Pricing"
      title="Simple, per month, cancel any time"
      description="Every plan includes every feature. The tiers are about volume, not access."
      plans={PLANS}
    />
  )
}
