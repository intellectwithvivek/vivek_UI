import { Badge, Button, Hero, Stack, Text } from '@the_viveksingh/vivek-ui'
import { LIBRARY_VERSION_LABEL } from '../lib/version'

export default function HeroPreview({ name }: { name: string }) {
  if (name === 'split') {
    return (
      <Hero
        layout="split"
        padding="md"
        eyebrow={<Badge tone="primary">{LIBRARY_VERSION_LABEL}</Badge>}
        title="One package. No dependencies."
        description="83 components, 6 charts and a token system that your CSS can always override."
        actions={
          <Stack direction="horizontal" gap={3} wrap>
            <Button>Get started</Button>
            <Button variant="outline">Browse components</Button>
          </Stack>
        }
        media={
          <div className="preview-tile" style={{ minHeight: '10rem' }}>
            <Text tone="muted">Any node: a screenshot, a video, a live chart</Text>
          </div>
        }
      />
    )
  }
  return (
    <Hero
      padding="md"
      eyebrow="Free and MIT licensed"
      title="Build the whole interface with one install"
      description="Components, charts and design tokens with zero runtime dependencies, server-safe by default."
      actions={
        <Stack direction="horizontal" gap={3} wrap justify="center">
          <Button>Get started</Button>
          <Button variant="outline">View on npm</Button>
        </Stack>
      }
    />
  )
}
