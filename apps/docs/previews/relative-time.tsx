import { RelativeTime, Stack, Text } from '@the_viveksingh/vivek-ui'

const NOW = new Date(2026, 7, 21, 12, 0)

export default function RelativeTimePreview({ name }: { name: string }) {
  if (name === 'numeric') {
    return (
      <Stack gap={2}>
        <Text size="sm" tone="muted">
          numeric=&quot;auto&quot; prefers words
        </Text>
        <RelativeTime date={new Date(2026, 7, 20, 12, 0)} now={NOW} numeric="auto" />
        <Text size="sm" tone="muted">
          numeric=&quot;always&quot; keeps the count
        </Text>
        <RelativeTime date={new Date(2026, 7, 20, 12, 0)} now={NOW} numeric="always" />
      </Stack>
    )
  }
  return (
    <Stack gap={2}>
      <RelativeTime date={new Date(2026, 7, 21, 11, 58)} now={NOW} />
      <RelativeTime date={new Date(2026, 7, 21, 9, 0)} now={NOW} />
      <RelativeTime date={new Date(2026, 7, 18, 12, 0)} now={NOW} />
      <RelativeTime date={new Date(2026, 4, 21, 12, 0)} now={NOW} />
      <Text size="sm" tone="muted">
        The absolute timestamp stays in the title attribute and in the datetime attribute, so the
        exact moment is never lost.
      </Text>
    </Stack>
  )
}
