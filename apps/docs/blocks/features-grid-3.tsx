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

const FEATURES = [
  {
    id: 'speed',
    icon: <Icon d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
    title: 'Fast by default',
    description:
      'Static CSS and no runtime styling engine, so nothing recomputes while your user waits.',
  },
  {
    id: 'a11y',
    icon: <Icon d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 8h16M12 8v6m0 0-3 8m3-8 3 8" />,
    title: 'Accessible on arrival',
    description: 'Keyboard maps from the WAI-ARIA practices and an axe assertion in every test.',
  },
  {
    id: 'deps',
    icon: <Icon d="M12 3 3 8v8l9 5 9-5V8l-9-5Zm0 0v18M3 8l9 5 9-5" />,
    title: 'Zero dependencies',
    description: 'One package, nothing underneath it. No transitive advisories to chase.',
  },
  {
    id: 'themes',
    icon: <Icon d="M12 3a9 9 0 1 0 0 18 3 3 0 0 0 0-6 3 3 0 0 1 0-6 3 3 0 0 0 0-6Z" />,
    title: 'Themed with variables',
    description: 'Change one custom property and the whole system moves with it.',
  },
  {
    id: 'rsc',
    icon: <Icon d="M4 6h16M4 12h16M4 18h10" />,
    title: 'Server components first',
    description: "Only the components that hold state carry 'use client'. The rest ship no JS.",
  },
  {
    id: 'types',
    icon: <Icon d="m8 6-6 6 6 6M16 6l6 6-6 6" />,
    title: 'Types that mean something',
    description: 'Strict TypeScript throughout, with props tables generated from the declarations.',
  },
]

export default function FeaturesGrid3() {
  return (
    <FeatureGrid
      eyebrow="Why this one"
      title="Everything a product needs, nothing it does not"
      description="The parts you would otherwise rebuild on every project, done once and done properly."
      features={FEATURES}
      columns={{ base: 1, sm: 2, lg: 3 }}
    />
  )
}
