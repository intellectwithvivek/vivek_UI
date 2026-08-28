import { Badge, Button, Hero } from '@the_viveksingh/vivek-ui'

export default function HeroFullscreenDark() {
  return (
    <Hero
      minHeight="screen"
      overlay="dark"
      backdrop={
        <div
          style={{
            blockSize: '100%',
            background: 'radial-gradient(circle at 30% 20%, #3b82f6 0%, #0f172a 55%, #020617 100%)',
          }}
        />
      }
      eyebrow={<Badge variant="outline">Launching 12 September</Badge>}
      title="The last deploy button you will ever click"
      description="Push to main. We build, test, preview and ship — and roll back on our own if the error rate moves."
      actions={
        <>
          <Button size="lg">Join the waitlist</Button>
          <Button size="lg" variant="ghost">
            How it works
          </Button>
        </>
      }
    />
  )
}
