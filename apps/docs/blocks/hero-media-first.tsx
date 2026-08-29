import { Button, Hero, Image } from '@the_viveksingh/vivek-ui'

export default function HeroMediaFirst() {
  return (
    <Hero
      layout="split"
      mediaPosition="start"
      eyebrow="Hardware"
      title="A keyboard you can hear yourself think on"
      description="Low-profile switches, a case machined from one block, and a battery measured in months."
      actions={<Button size="lg">Pre-order — ₹14,900</Button>}
      media={
        <Image
          src="/demo/vk-keys.svg"
          alt="The keyboard photographed from above"
          ratio={4 / 3}
          rounded="lg"
        />
      }
    />
  )
}
