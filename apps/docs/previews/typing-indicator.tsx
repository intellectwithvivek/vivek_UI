import { Stack, Text, TypingIndicator } from '@the_viveksingh/vivek-ui'

export default function TypingIndicatorPreview({ name }: { name: string }) {
  if (name === 'withLabel') {
    return (
      <Stack gap={3} align="start">
        <TypingIndicator showLabel label="Assistant is typing" />
        <TypingIndicator showLabel label="Priya is typing" size="sm" dots={4} />
      </Stack>
    )
  }
  return (
    <Stack gap={3} align="start">
      <TypingIndicator />
      <TypingIndicator size="sm" />
      <Text size="sm" tone="muted">
        Set active={'{false}'} to stop the animation without unmounting, which keeps the row height
        stable.
      </Text>
      <TypingIndicator active={false} />
    </Stack>
  )
}
