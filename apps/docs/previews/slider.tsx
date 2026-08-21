import { Slider, Stack } from '@the_viveksingh/vivek-ui'

export default function SliderPreview({ name }: { name: string }) {
  if (name === 'range') {
    return (
      <Slider
        range
        defaultValue={[200, 800]}
        min={0}
        max={1000}
        step={50}
        showValue
        aria-label="Price range"
      />
    )
  }
  if (name === 'marks') {
    return (
      <Slider
        defaultValue={3}
        min={1}
        max={5}
        step={1}
        marks
        showValue
        aria-label="Team size"
        tone="success"
      />
    )
  }
  return (
    <Stack gap={6}>
      <Slider defaultValue={40} showValue aria-label="Volume" />
      <Slider defaultValue={70} size="lg" tone="warning" showValue aria-label="Brightness" />
      <Slider defaultValue={25} disabled showValue aria-label="Disabled" />
    </Stack>
  )
}
