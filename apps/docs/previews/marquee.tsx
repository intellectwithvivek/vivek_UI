import { Marquee, Text } from '@the_viveksingh/vivek-ui'

const ITEMS = [
  'Zero runtime dependencies',
  '105 components',
  '10 charts',
  'MIT licensed',
  'Server-safe by default',
  '40.5 kB gzipped',
]

export default function MarqueePreview({ name }: { name: string }) {
  if (name === 'reverse') {
    return (
      <Marquee direction="right" speed={30} pauseOnHover>
        {ITEMS.map((item) => (
          <Text key={item} className="preview-tile">
            {item}
          </Text>
        ))}
      </Marquee>
    )
  }
  return (
    <Marquee speed={40} gap={4} gradient pauseOnHover>
      {ITEMS.map((item) => (
        <Text key={item} className="preview-tile">
          {item}
        </Text>
      ))}
    </Marquee>
  )
}
