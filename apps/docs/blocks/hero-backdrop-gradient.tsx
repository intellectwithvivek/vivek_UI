import { Button, Hero } from '@the_viveksingh/vivek-ui'

export default function HeroBackdropGradient() {
  return (
    <Hero
      overlay="gradient"
      minHeight="half"
      backdrop={<img src="/demo/vk-summit.svg" alt="" />}
      eyebrow="Season 2026"
      title="Higher, lighter, further"
      description="The pack that disappears on your back and reappears in the photos."
      actions={
        <>
          <Button size="lg">Shop the range</Button>
          <Button size="lg" variant="outline">
            Find a stockist
          </Button>
        </>
      }
    />
  )
}
