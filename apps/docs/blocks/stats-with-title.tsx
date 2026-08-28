import { Stats } from '@the_viveksingh/vivek-ui'

export default function StatsWithTitle() {
  return (
    <Stats
      eyebrow="By the numbers"
      title="What a year of shipping looks like"
      description="Every figure is from the public status page and the changelog."
      items={[
        { id: 'releases', value: '52', label: 'Releases', description: 'One a week, on Tuesdays' },
        { id: 'components', value: '109', label: 'Components' },
        { id: 'downloads', value: '1.8M', label: 'Downloads' },
      ]}
      columns={{ base: 1, sm: 3 }}
    />
  )
}
