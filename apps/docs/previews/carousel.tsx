import { Carousel, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'

const SLIDES = [
  { title: 'Zero dependencies', body: 'Nothing in your lockfile but React.' },
  { title: 'Static CSS', body: 'One stylesheet, no runtime style engine.' },
  { title: 'Server-safe', body: 'Half the library needs no client boundary.' },
  { title: 'Accessible', body: 'Keyboard maps from the WAI-ARIA practices.' },
  { title: 'MIT', body: 'Free for commercial work, with no attribution.' },
]

export default function CarouselPreview({ name }: { name: string }) {
  const multiple = name === 'multiple'
  return (
    <Carousel
      slidesPerView={multiple ? { base: 1, sm: 2, lg: 3 } : 1}
      gap={4}
      loop
      showArrows
      showDots
      label="Why VivekUI"
    >
      {SLIDES.map((slide) => (
        <Stack key={slide.title} gap={2} className="preview-panel" style={{ minHeight: '8rem' }}>
          <Heading level={4} size="md">
            {slide.title}
          </Heading>
          <Text size="sm" tone="muted">
            {slide.body}
          </Text>
        </Stack>
      ))}
    </Carousel>
  )
}
