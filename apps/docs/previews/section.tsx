import { Button, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function SectionPreview({ name }: { name: string }) {
  if (name === 'header') {
    return (
      <Section padding="sm" background="muted">
        <Section.Header
          eyebrow="Pricing"
          title="Simple, predictable billing"
          description="No seat minimums and no annual lock-in."
          align="center"
        />
      </Section>
    )
  }
  return (
    <Section padding="sm" background="muted">
      <Stack gap={3} align="start">
        <Text size="lg" weight="semibold">
          A page section
        </Text>
        <Text tone="muted">
          Section owns the vertical rhythm and the inner Container, so a page becomes a list of
          sections rather than a pile of wrappers.
        </Text>
        <Button size="sm">Call to action</Button>
      </Stack>
    </Section>
  )
}
