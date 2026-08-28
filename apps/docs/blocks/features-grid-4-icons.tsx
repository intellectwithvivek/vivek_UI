import { FeatureGrid } from '@the_viveksingh/vivek-ui'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" height="22" viewBox="0 0 24 24" width="22">
    <path d={d} {...stroke} />
  </svg>
)

const STEPS = [
  {
    id: 'connect',
    icon: <Icon d="M4 12h16M12 4v16" />,
    title: 'Connect',
    description: 'Point it at your repository. Read-only, revocable, thirty seconds.',
  },
  {
    id: 'build',
    icon: <Icon d="M4 6h16v12H4z" />,
    title: 'Build',
    description: 'Every push gets a preview URL with its own database.',
  },
  {
    id: 'test',
    icon: <Icon d="M5 12l5 5L20 7" />,
    title: 'Test',
    description: 'Your suite, our machines, in parallel. Flaky tests are quarantined, not ignored.',
  },
  {
    id: 'ship',
    icon: <Icon d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
    title: 'Ship',
    description: 'Promote a preview to production with one click, or none.',
  },
]

export default function FeaturesGrid4Icons() {
  return (
    <FeatureGrid
      align="start"
      background="muted"
      eyebrow="How it works"
      title="From push to production in four steps"
      features={STEPS}
      columns={{ base: 1, sm: 2, lg: 4 }}
    />
  )
}
