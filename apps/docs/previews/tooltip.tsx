import { Button, IconButton, Stack, Tooltip } from '@the_viveksingh/vivek-ui'

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function TooltipPreview({ name }: { name: string }) {
  if (name === 'sides') {
    return (
      <Stack direction="horizontal" gap={4} wrap justify="center">
        <Tooltip content="Above" side="top">
          <Button variant="outline">Top</Button>
        </Tooltip>
        <Tooltip content="To the right" side="right">
          <Button variant="outline">Right</Button>
        </Tooltip>
        <Tooltip content="Below" side="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>
        <Tooltip content="To the left" side="left">
          <Button variant="outline">Left</Button>
        </Tooltip>
      </Stack>
    )
  }
  return (
    <Stack direction="horizontal" gap={4} align="center">
      <Tooltip content="Copied to your clipboard on click">
        <Button>Hover or focus me</Button>
      </Tooltip>
      <Tooltip content="Billed per active seat, per month">
        <IconButton variant="ghost" aria-label="About seat pricing">
          <InfoIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
