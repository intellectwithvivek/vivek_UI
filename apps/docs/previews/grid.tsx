import { Box, Grid } from '@the_viveksingh/vivek-ui'

const CELLS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six']

export default function GridPreview({ name }: { name: string }) {
  if (name === 'responsive') {
    return (
      <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={3}>
        {CELLS.map((cell) => (
          <Box key={cell} className="preview-tile">
            {cell}
          </Box>
        ))}
      </Grid>
    )
  }
  return (
    <Grid minItemWidth="10rem" gap={3}>
      {CELLS.map((cell) => (
        <Box key={cell} className="preview-tile">
          {cell}
        </Box>
      ))}
    </Grid>
  )
}
