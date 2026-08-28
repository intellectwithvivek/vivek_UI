import { Badge, Footer, Stack, Text } from '@the_viveksingh/vivek-ui'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Components', href: '#' },
      { label: 'Charts', href: '#' },
      { label: 'Templates', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Installation', href: '#' },
      { label: 'Theming', href: '#' },
      { label: 'Accessibility', href: '#' },
      { label: 'TypeScript', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
]

export default function FooterWithBadges() {
  return (
    <Footer
      brand="Palisade"
      columns={COLUMNS}
      copyright={
        <Stack direction="horizontal" gap={2} wrap align="center">
          <Text as="span" size="sm" tone="muted">
            © 2026 Palisade Security.
          </Text>
          <Badge size="sm" variant="outline">
            SOC 2 Type II
          </Badge>
          <Badge size="sm" variant="outline">
            ISO 27001
          </Badge>
          <Badge size="sm" variant="outline">
            GDPR
          </Badge>
        </Stack>
      }
    />
  )
}
