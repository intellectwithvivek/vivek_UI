import { ScrollArea, Stack, Text } from '@the_viveksingh/vivek-ui'

const ROWS = Array.from({ length: 20 }, (_, i) => `Row ${i + 1}`)

export default function ScrollAreaPreview({ name }: { name: string }) {
  if (name === 'horizontal') {
    return (
      <ScrollArea orientation="horizontal">
        <Stack direction="horizontal" gap={3} style={{ width: 'max-content' }}>
          {ROWS.map((row) => (
            <Text key={row} className="preview-tile">
              {row}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
    )
  }
  return (
    <ScrollArea style={{ height: '10rem' }}>
      <Stack gap={2}>
        {ROWS.map((row) => (
          <Text key={row}>{row}</Text>
        ))}
      </Stack>
    </ScrollArea>
  )
}
