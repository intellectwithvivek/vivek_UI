import { Stats } from '@the_viveksingh/vivek-ui'

export default function StatsPrimary() {
  return (
    <Stats
      background="primary"
      items={[
        { id: 'teams', value: '2,000+', label: 'Teams' },
        { id: 'countries', value: '61', label: 'Countries' },
        {
          id: 'saved',
          value: '3 weeks',
          label: 'Saved per project',
          description: 'Median, self-reported',
        },
      ]}
      columns={{ base: 1, sm: 3 }}
    />
  )
}
