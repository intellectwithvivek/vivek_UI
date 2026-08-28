import { Button, Hero, Stats } from '@the_viveksingh/vivek-ui'

export default function HeroWithStats() {
  return (
    <>
      <Hero
        align="start"
        padding="lg"
        eyebrow="Logistics"
        title="Deliveries that arrive when the app said they would"
        description="Route planning, live tracking and proof of delivery in one tool your drivers will actually open."
        actions={
          <>
            <Button size="lg">Book a demo</Button>
            <Button size="lg" variant="ghost">
              See pricing
            </Button>
          </>
        }
      />
      <Stats
        padding="sm"
        items={[
          { id: 'ontime', value: '98.4%', label: 'On-time deliveries' },
          { id: 'drivers', value: '12,000', label: 'Drivers on the road' },
          { id: 'cities', value: '140', label: 'Cities', description: 'Across 11 countries' },
        ]}
      />
    </>
  )
}
