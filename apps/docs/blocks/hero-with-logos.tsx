import { Button, Hero, LogoCloud } from '@the_viveksingh/vivek-ui'

export default function HeroWithLogos() {
  return (
    <>
      <Hero
        padding="lg"
        eyebrow="Payments"
        title="Accept payments in every country you sell to"
        description="One integration, 135 currencies, payouts in yours. Pricing that does not need a call."
        actions={
          <>
            <Button size="lg">Create an account</Button>
            <Button size="lg" variant="outline">
              Talk to sales
            </Button>
          </>
        }
      />
      <LogoCloud
        padding="sm"
        title="Trusted by finance teams at"
        logos={[
          { alt: 'Meridian' },
          { alt: 'Halcyon' },
          { alt: 'Fieldwork' },
          { alt: 'Northgate' },
          { alt: 'Overtone' },
          { alt: 'Palisade' },
        ]}
      />
    </>
  )
}
