import { IconButton, Stack } from '@the_viveksingh/vivek-ui'

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function IconButtonPreview({ name }: { name: string }) {
  if (name === 'variants') {
    return (
      <Stack direction="horizontal" gap={3} align="center" wrap>
        <IconButton aria-label="Add item">
          <PlusIcon />
        </IconButton>
        <IconButton variant="outline" aria-label="Add item">
          <PlusIcon />
        </IconButton>
        <IconButton variant="ghost" aria-label="Add item">
          <PlusIcon />
        </IconButton>
        <IconButton round variant="outline" aria-label="Add item">
          <PlusIcon />
        </IconButton>
      </Stack>
    )
  }
  return (
    <Stack direction="horizontal" gap={3} align="center" wrap>
      <IconButton size="sm" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton size="md" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton size="lg" aria-label="Add item">
        <PlusIcon />
      </IconButton>
      <IconButton loading aria-label="Adding item">
        <PlusIcon />
      </IconButton>
      <IconButton disabled aria-label="Add item">
        <PlusIcon />
      </IconButton>
    </Stack>
  )
}
