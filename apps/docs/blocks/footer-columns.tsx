import { Footer } from '@the_viveksingh/vivek-ui'

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

export default function FooterColumns() {
  return <Footer brand="Northwind" columns={COLUMNS} copyright="© 2026 Northwind. MIT licensed." />
}
