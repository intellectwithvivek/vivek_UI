import { LogoCloud, Text } from '@the_viveksingh/vivek-ui'

const LOGOS = [
  { id: 'northwind', alt: 'Northwind', node: <Text weight="semibold">NORTHWIND</Text> },
  { id: 'acme', alt: 'Acme Corp', node: <Text weight="semibold">ACME</Text> },
  { id: 'globex', alt: 'Globex', node: <Text weight="semibold">GLOBEX</Text> },
  { id: 'initech', alt: 'Initech', node: <Text weight="semibold">INITECH</Text> },
  { id: 'umbrella', alt: 'Umbrella', node: <Text weight="semibold">UMBRELLA</Text> },
]

export default function LogoCloudPreview() {
  return <LogoCloud padding="md" title="Trusted by teams shipping every day" logos={LOGOS} />
}
