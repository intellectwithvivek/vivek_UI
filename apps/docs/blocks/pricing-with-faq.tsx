import { Button, FAQ, Pricing } from '@the_viveksingh/vivek-ui'

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

export default function PricingWithFaq() {
  return (
    <>
      <Pricing eyebrow="Pricing" title="Plans for every stage" plans={PLANS} />
      <FAQ
        padding="md"
        columns={2}
        title="Billing questions"
        items={[
          {
            id: 'trial',
            question: 'Is there a free trial?',
            answer: 'Every paid plan starts with 14 days free. No card until you decide.',
          },
          {
            id: 'change',
            question: 'Can I change plans later?',
            answer: 'Yes, at any time. Upgrades apply immediately; downgrades at the next renewal.',
          },
          {
            id: 'invoice',
            question: 'Do you invoice annually?',
            answer: 'Yes. Annual plans are billed once and are 20% cheaper.',
          },
          {
            id: 'cancel',
            question: 'How do I cancel?',
            answer:
              'From Settings → Billing, in one click. Your data stays exportable for 90 days.',
          },
        ]}
      />
    </>
  )
}
