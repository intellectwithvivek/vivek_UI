import { Badge, Button, Hero } from '@the_viveksingh/vivek-ui'

export default function HeroCentered() {
  return (
    <Hero
      eyebrow={<Badge variant="soft">Now in public beta</Badge>}
      title="Ship the interface, not the infrastructure"
      description="One hundred and nine components with no runtime dependencies, no CSS-in-JS and no build plugin. Install one package and import a stylesheet."
      actions={
        <>
          <Button size="lg">Start building</Button>
          <Button size="lg" variant="outline">
            Read the docs
          </Button>
        </>
      }
    />
  )
}
