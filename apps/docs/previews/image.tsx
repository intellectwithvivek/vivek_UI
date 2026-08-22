import { Grid, Image, Stack, Text } from '@the_viveksingh/vivek-ui'
import { BROKEN_IMAGE, placeholderImage } from '../lib/placeholder-image'

export default function ImagePreview({ name }: { name: string }) {
  if (name === 'failure') {
    return (
      <Stack gap={4} style={{ maxWidth: '22rem' }}>
        <Image
          alt="A photograph of the Bengaluru office that failed to load"
          fallback="Image unavailable"
          ratio={4 / 3}
          src={BROKEN_IMAGE}
        />
        <Text size="sm" tone="muted">
          A dead URL renders the fallback, not the browser's broken-image icon. The alt text stays
          in the accessibility tree, so the description is not lost with the picture.
        </Text>
      </Stack>
    )
  }

  if (name === 'caption') {
    return (
      <div style={{ maxWidth: '24rem' }}>
        <Image
          alt="Abstract gradient artwork"
          caption="Generated locally as an SVG data URI — no third-party request."
          ratio={16 / 9}
          src={placeholderImage({ seed: 'caption', label: '16 / 9' })}
        />
      </div>
    )
  }

  return (
    <Grid cols={{ base: 1, sm: 3 }} gap={4}>
      <Image
        alt="A wide landscape"
        ratio={16 / 9}
        src={placeholderImage({ seed: 'wide', label: '16 / 9' })}
      />
      <Image
        alt="A square portrait"
        ratio={1}
        src={placeholderImage({ seed: 'square', label: '1 / 1' })}
      />
      <Image
        alt="A circular avatar"
        ratio={1}
        rounded="full"
        src={placeholderImage({ seed: 'round', label: 'full' })}
      />
    </Grid>
  )
}
