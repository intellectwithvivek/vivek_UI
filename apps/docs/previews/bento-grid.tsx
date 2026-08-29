import { BentoGrid, Heading, Image, Stack, Text } from '@the_viveksingh/vivek-ui'
import { placeholderImage } from '../lib/placeholder-image'

function Cell({ title, body }: { title: string; body: string }) {
  return (
    <Stack gap={2} className="preview-panel" style={{ height: '100%' }}>
      <Heading level={3} size="md">
        {title}
      </Heading>
      <Text size="sm" tone="muted">
        {body}
      </Text>
    </Stack>
  )
}

export default function BentoGridPreview({ name }: { name: string }) {
  if (name === 'dense') {
    return (
      <BentoGrid cols={{ base: 2, sm: 4 }} gap={3} rowHeight="6rem" dense>
        <BentoGrid.Item colSpan={2}>
          <Cell title="Zero dependencies" body="Nothing to audit but React." />
        </BentoGrid.Item>
        <BentoGrid.Item>
          <Cell title="109 components" body="Plus ten charts." />
        </BentoGrid.Item>
        <BentoGrid.Item>
          <Cell title="MIT" body="Free, forever." />
        </BentoGrid.Item>
        <BentoGrid.Item colSpan={3}>
          <Cell title="Server-safe" body="Half the library needs no client boundary." />
        </BentoGrid.Item>
      </BentoGrid>
    )
  }
  return (
    <BentoGrid cols={{ base: 1, sm: 2, lg: 4 }} gap={3} rowHeight="7rem">
      <BentoGrid.Item colSpan={{ base: 1, lg: 2 }} rowSpan={2}>
        <Cell
          title="One install"
          body="Components, charts and tokens arrive in a single package with no runtime dependencies."
        />
      </BentoGrid.Item>
      <BentoGrid.Item colSpan={{ base: 1, sm: 2 }}>
        <Image
          src={placeholderImage({ seed: 'bento-cover', width: 1200, height: 500, label: 'Cover' })}
          alt=""
          fit="cover"
          rounded="sm"
          style={{ blockSize: '100%' }}
        />
      </BentoGrid.Item>
      <BentoGrid.Item>
        <Cell title="1268 tests" body="Every component has an axe assertion." />
      </BentoGrid.Item>
      <BentoGrid.Item>
        <Cell title="ESM + CJS" body="With correct types in all three resolution modes." />
      </BentoGrid.Item>
    </BentoGrid>
  )
}
