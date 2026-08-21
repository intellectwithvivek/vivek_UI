import { Clock, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function ClockPreview({ name }: { name: string }) {
  if (name === 'zones') {
    return (
      <Stack gap={2}>
        <Text size="sm" tone="muted">
          Mumbai
        </Text>
        <Clock timeZone="Asia/Kolkata" showSeconds />
        <Text size="sm" tone="muted">
          London
        </Text>
        <Clock timeZone="Europe/London" showSeconds />
        <Text size="sm" tone="muted">
          New York
        </Text>
        <Clock timeZone="America/New_York" showSeconds hour12 />
      </Stack>
    )
  }
  if (name === 'format') {
    return (
      <Stack gap={2}>
        <Clock format={{ dateStyle: 'full', timeStyle: 'short' }} />
        <Clock format={{ hour: '2-digit', minute: '2-digit' }} hour12={false} />
      </Stack>
    )
  }
  return (
    <Stack gap={2}>
      <Clock showSeconds />
      <Text size="sm" tone="muted">
        Renders a placeholder on the server and hydrates to the visitor&apos;s local time, so the
        markup never mismatches.
      </Text>
    </Stack>
  )
}
