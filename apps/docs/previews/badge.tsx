import { Badge, Stack } from '@the_viveksingh/vivek-ui'

export default function BadgePreview() {
  return (
    <Stack direction="horizontal" gap={2} wrap align="center">
      <Badge tone="primary">Primary</Badge>
      <Badge tone="success" variant="solid">
        Live
      </Badge>
      <Badge tone="warning" variant="outline">
        Beta
      </Badge>
      <Badge tone="danger" pill>
        Deprecated
      </Badge>
      <Badge tone="neutral">Neutral</Badge>
    </Stack>
  )
}
