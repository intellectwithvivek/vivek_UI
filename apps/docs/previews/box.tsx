import { Box, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function BoxPreview({ name }: { name: string }) {
  if (name === 'as') {
    return (
      <Box as="section" className="preview-panel">
        <Text>Rendered as a section, not a div.</Text>
      </Box>
    )
  }
  return (
    <Stack gap={3}>
      <Box className="preview-panel">
        <Text>A Box is an unstyled div that merges className and style.</Text>
      </Box>
      <Box className="preview-panel" style={{ borderStyle: 'dashed' }}>
        <Text tone="muted">Your style wins: the library adds no specificity.</Text>
      </Box>
    </Stack>
  )
}
