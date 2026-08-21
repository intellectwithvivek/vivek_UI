import { Rating, Stack } from '@the_viveksingh/vivek-ui'

export default function RatingPreview({ name }: { name: string }) {
  if (name === 'readOnly') {
    return (
      <Stack gap={3}>
        <Rating value={4} readOnly label="Average rating" />
        <Rating value={3.5} allowHalf readOnly size="sm" label="With halves" />
      </Stack>
    )
  }
  return (
    <Stack gap={4}>
      <Rating defaultValue={4} label="How was your experience?" allowClear />
      <Rating defaultValue={3} allowHalf size="lg" label="Half steps" />
      <Rating defaultValue={2} max={10} size="sm" label="Out of ten" />
    </Stack>
  )
}
