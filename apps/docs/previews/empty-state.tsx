import { Button, EmptyState, Stack } from '@the_viveksingh/vivek-ui'

function InboxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12h4l2 3h6l2-3h4M3 12l2-7h14l2 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function EmptyStatePreview({ name }: { name: string }) {
  if (name === 'minimal') {
    return <EmptyState size="sm" title="No results" description="Try a different search term." />
  }
  return (
    <EmptyState
      icon={<InboxIcon />}
      title="No invoices yet"
      description="Once you send your first invoice it will show up here, along with its payment status."
      actions={
        <Stack direction="horizontal" gap={3} wrap justify="center">
          <Button>Create invoice</Button>
          <Button variant="outline">Import from CSV</Button>
        </Stack>
      }
    />
  )
}
