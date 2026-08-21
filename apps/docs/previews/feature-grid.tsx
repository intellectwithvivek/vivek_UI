import { FeatureGrid } from '@the_viveksingh/vivek-ui'

function Dot() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
    </svg>
  )
}

const FEATURES = [
  {
    id: 'deps',
    icon: <Dot />,
    title: 'Zero dependencies',
    description: 'Nothing in your lockfile but React. Nothing to audit, nothing to deprecate.',
  },
  {
    id: 'css',
    icon: <Dot />,
    title: 'Static CSS, one file',
    description:
      'No CSS-in-JS runtime. Variants are data attributes, themes are custom properties.',
  },
  {
    id: 'rsc',
    icon: <Dot />,
    title: 'Server-safe by default',
    description: 'Half the library needs no client boundary, so your bundles stay small.',
  },
  {
    id: 'a11y',
    icon: <Dot />,
    title: 'Accessible on purpose',
    description: 'Keyboard maps from the WAI-ARIA practices, with an axe assertion per component.',
  },
]

export default function FeatureGridPreview() {
  return (
    <FeatureGrid
      padding="md"
      eyebrow="Why this one"
      title="The constraints are the product"
      features={FEATURES}
      columns={{ base: 1, sm: 2 }}
    />
  )
}
