import { Stats } from '@the_viveksingh/vivek-ui'

export default function StatsBand() {
  return (
    <Stats
      background="muted"
      items={[
        { id: 'uptime', value: '99.99%', label: 'Uptime', description: 'Last 12 months' },
        { id: 'requests', value: '4.2B', label: 'Requests a month' },
        { id: 'regions', value: '35', label: 'Edge regions' },
        { id: 'p99', value: '38 ms', label: 'p99 latency' },
      ]}
    />
  )
}
