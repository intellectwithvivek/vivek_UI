import { Stack, Text, ThemeToggle } from '@the_viveksingh/vivek-ui'

export default function ThemeTogglePreview({ name }: { name: string }) {
  if (name === 'modes') {
    return (
      <Stack gap={4}>
        <Stack direction="horizontal" gap={3} align="center">
          <ThemeToggle mode="toggle" />
          <Text size="sm" tone="muted">
            mode=&quot;toggle&quot; flips between light and dark
          </Text>
        </Stack>
        <Stack direction="horizontal" gap={3} align="center">
          <ThemeToggle mode="cycle" />
          <Text size="sm" tone="muted">
            mode=&quot;cycle&quot; walks light, dark, system
          </Text>
        </Stack>
      </Stack>
    )
  }
  return (
    <Stack direction="horizontal" gap={3} align="center">
      <ThemeToggle />
      <ThemeToggle variant="outline" />
      <ThemeToggle variant="solid" size="lg" round />
    </Stack>
  )
}
