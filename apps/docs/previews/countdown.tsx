import { Countdown, Stack, Text } from '@the_viveksingh/vivek-ui'

const NOW = new Date(2026, 7, 21, 12, 0, 0)
const LAUNCH = new Date(2026, 7, 24, 9, 30, 0)

export default function CountdownPreview({ name }: { name: string }) {
  if (name === 'compact') {
    return (
      <Stack gap={4}>
        <Countdown
          to={LAUNCH}
          now={NOW}
          format={['hours', 'minutes', 'seconds']}
          showLabels={false}
        />
        <Countdown to={LAUNCH} now={NOW} hideZeroUnits label="Time until launch" />
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Countdown to={LAUNCH} now={NOW} label="Time until v1.0" />
      <Text size="sm" tone="muted">
        Pass `now` to pin the reference time, which is what makes a countdown testable and keeps
        server and client markup identical.
      </Text>
    </Stack>
  )
}
