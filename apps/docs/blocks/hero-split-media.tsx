import { Badge, Button, Hero, Image } from '@the_viveksingh/vivek-ui'

export default function HeroSplitMedia() {
  return (
    <Hero
      layout="split"
      eyebrow={<Badge tone="primary">v1.0</Badge>}
      title="Analytics your whole team can read"
      description="Dashboards that load in one request and explain themselves. No query language, no training day."
      actions={
        <>
          <Button size="lg">Try it free</Button>
          <Button size="lg" variant="ghost">
            Watch the demo
          </Button>
        </>
      }
      media={
        <Image
          src="/demo/vk-dash.svg"
          alt="The analytics dashboard showing weekly revenue"
          ratio={4 / 3}
          rounded="lg"
        />
      }
    />
  )
}
