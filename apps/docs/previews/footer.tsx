import { Footer, Stack, Text } from '@the_viveksingh/vivek-ui'

const COLUMNS = [
  {
    title: 'Docs',
    links: [
      { label: 'Installation', href: '/docs/installation' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Charts', href: '/docs/charts' },
      { label: 'Playground', href: '/playground' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/@the_viveksingh/vivek-ui' },
      { label: 'GitHub', href: 'https://github.com/intellectwithvivek' },
      { label: 'Page templates', href: '/pages' },
    ],
  },
  {
    title: 'Author',
    links: [
      { label: 'vivekkumarsingh.in', href: 'https://vivekkumarsingh.in/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/singhvvk/' },
    ],
  },
]

export default function FooterPreview() {
  return (
    <Footer
      padding="md"
      columns={COLUMNS}
      brand={
        <Stack gap={2}>
          <Text weight="semibold">VivekUI</Text>
          <Text size="sm" tone="muted">
            104 components, 10 charts, zero runtime dependencies.
          </Text>
        </Stack>
      }
      copyright="MIT licensed. Built by Vivek Kumar Singh."
    />
  )
}
