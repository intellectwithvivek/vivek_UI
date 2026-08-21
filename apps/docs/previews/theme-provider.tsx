'use client'

import { Badge, Button, Stack, Text, ThemeProvider, useTheme } from '@the_viveksingh/vivek-ui'

function Controls() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <Stack gap={3} align="start">
      <Stack direction="horizontal" gap={2} align="center" wrap>
        <Text size="sm" tone="muted">
          theme
        </Text>
        <Badge tone="primary">{theme}</Badge>
        <Text size="sm" tone="muted">
          resolvedTheme
        </Text>
        <Badge tone="neutral">{resolvedTheme}</Badge>
      </Stack>
      <Stack direction="horizontal" gap={2} wrap>
        <Button size="sm" variant="outline" onClick={() => setTheme('light')}>
          Light
        </Button>
        <Button size="sm" variant="outline" onClick={() => setTheme('dark')}>
          Dark
        </Button>
        <Button size="sm" variant="outline" onClick={() => setTheme('system')}>
          System
        </Button>
      </Stack>
    </Stack>
  )
}

export default function ThemeProviderPreview() {
  return (
    <Stack gap={3}>
      <ThemeProvider storageKey="vk-docs-preview-theme" defaultTheme="system">
        <Controls />
      </ThemeProvider>
      <Text size="sm" tone="muted">
        This preview writes to its own storage key, so experimenting here does not fight the site
        theme. In an app you mount one ThemeProvider at the root and inject themeScript in the head
        to stop the first-paint flash.
      </Text>
    </Stack>
  )
}
