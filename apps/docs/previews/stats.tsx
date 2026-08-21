import { Stats } from '@the_viveksingh/vivek-ui'

const ITEMS = [
  { id: 'components', value: '83', label: 'Components', description: 'Plus six chart types' },
  { id: 'deps', value: '0', label: 'Runtime dependencies', description: 'React is a peer' },
  { id: 'size', value: '40.5 kB', label: 'Whole library', description: 'Minified and gzipped' },
  { id: 'tests', value: '1268', label: 'Tests', description: 'Every component has an axe check' },
]

export default function StatsPreview({ name }: { name: string }) {
  if (name === 'bare') {
    return <Stats padding="sm" items={ITEMS.slice(0, 3)} columns={3} />
  }
  return (
    <Stats
      padding="md"
      eyebrow="By the numbers"
      title="What one install gives you"
      items={ITEMS}
      columns={{ base: 2, lg: 4 }}
    />
  )
}
