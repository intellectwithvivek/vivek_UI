import { Carousel, Heading, Image, Stack, Text } from '@the_viveksingh/vivek-ui'
import { placeholderImage } from '../lib/placeholder-image'

const SLIDES = [
  { id: 'dusk', title: 'Zero dependencies', body: 'Nothing in your lockfile but React.' },
  { id: 'forest', title: 'Static CSS', body: 'One stylesheet, no runtime style engine.' },
  { id: 'ember', title: 'Server-safe', body: 'Half the library needs no client boundary.' },
  { id: 'ocean', title: 'Accessible', body: 'Keyboard maps from the WAI-ARIA practices.' },
  { id: 'orchid', title: 'MIT', body: 'Free for commercial work, with no attribution.' },
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
        <Stack key={slide.id} gap={3}>
          <Image
            src={placeholderImage({ seed: slide.id, width: 1200, height: multiple ? 800 : 500 })}
            alt=""
            ratio={multiple ? 3 / 2 : 12 / 5}
            rounded="md"
          />
          <Stack gap={1}>
            <Heading level={3} size="md">
              {slide.title}
            </Heading>
            <Text size="sm" tone="muted">
              {slide.body}
            </Text>
          </Stack>
        </Stack>
      ))}
    </Carousel>
  )
}
