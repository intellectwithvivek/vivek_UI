import { AspectRatio, Box, Text } from '@the_viveksingh/vivek-ui'

export default function AspectRatioPreview({ name }: { name: string }) {
  if (name === 'square') {
    return (
      <Box style={{ maxWidth: '12rem' }}>
        <AspectRatio ratio={1} className="preview-tile">
          <Text tone="muted">1 / 1</Text>
        </AspectRatio>
      </Box>
    )
  }
  return (
    <AspectRatio ratio={16 / 9} className="preview-tile">
      <Text tone="muted">16 / 9 - reserves its height, so nothing shifts once the media loads</Text>
    </AspectRatio>
  )
}
