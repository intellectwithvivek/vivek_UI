import { Portal, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function PortalPreview() {
  return (
    <Stack gap={3}>
      <Text>This paragraph renders here, in the normal flow.</Text>
      <Portal>
        <Text
          className="preview-portal-note"
          style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 50 }}
        >
          Portalled to document.body
        </Text>
      </Portal>
      <Text size="sm" tone="muted">
        The note pinned to the corner of the viewport left this container entirely - that is what
        escapes an ancestor overflow or transform.
      </Text>
    </Stack>
  )
}
