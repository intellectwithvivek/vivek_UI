import { Button, CTA, Stack } from '@the_viveksingh/vivek-ui'

export default function CTAPreview({ name }: { name: string }) {
  if (name === 'primary') {
    return (
      <CTA
        background="primary"
        padding="md"
        eyebrow="Open source"
        title="Ship your next interface this week"
        description="Install once, style with tokens, override with a single class."
        actions={<Button variant="outline">Read the docs</Button>}
      />
    )
  }
  return (
    <CTA
      padding="md"
      title="Ready to try it?"
      description="One npm install and one stylesheet import is the whole setup."
      actions={
        <Stack direction="horizontal" gap={3} wrap justify="center">
          <Button>Get started</Button>
          <Button variant="ghost">Star on GitHub</Button>
        </Stack>
      }
    />
  )
}
