import { Stack, Text } from '@the_viveksingh/vivek-ui'

export default function TextPreview({ name }: { name: string }) {
  if (name === 'tones') {
    return (
      <Stack gap={2}>
        <Text>Default body copy</Text>
        <Text tone="muted">Muted, for secondary detail</Text>
        <Text tone="primary">Primary, for emphasis on brand</Text>
        <Text tone="danger">Danger, for an error message</Text>
      </Stack>
    )
  }
  if (name === 'clamp') {
    return (
      <Stack gap={4} style={{ maxWidth: '24rem' }}>
        <Text truncate>
          A single line that is far too long to fit in this container and gets an ellipsis instead
          of wrapping.
        </Text>
        <Text lineClamp={2} tone="muted">
          lineClamp cuts the paragraph off after a set number of lines. This one stops after two,
          however much copy follows it, which keeps a card grid from going ragged when one item has
          more to say than the rest.
        </Text>
      </Stack>
    )
  }
  return (
    <Stack gap={2}>
      <Text size="lg" weight="semibold">
        Large and semibold
      </Text>
      <Text>Default size, default weight</Text>
      <Text size="sm" tone="muted">
        Small and muted
      </Text>
    </Stack>
  )
}
