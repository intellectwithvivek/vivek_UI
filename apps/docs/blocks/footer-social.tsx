import { Footer, IconButton, Stack } from '@the_viveksingh/vivek-ui'

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

const Glyph = ({ d }: { d: string }) => (
  <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
    <path d={d} fill="currentColor" />
  </svg>
)

export default function FooterSocial() {
  return (
    <Footer
      brand="Halcyon"
      columns={COLUMNS}
      copyright="© 2026 Halcyon."
      social={
        <Stack direction="horizontal" gap={1}>
          <IconButton asChild aria-label="Halcyon on GitHub" variant="ghost" size="sm">
            <a href="https://github.com/halcyon">
              <Glyph d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
            </a>
          </IconButton>
          <IconButton asChild aria-label="Halcyon on LinkedIn" variant="ghost" size="sm">
            <a href="https://www.linkedin.com/company/halcyon">
              <Glyph d="M4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2.5 8.5h3V21h-3zM9 8.5h2.9v1.7h.1c.4-.8 1.4-1.9 3.3-1.9 3.5 0 4.2 2.3 4.2 5.3V21h-3v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9z" />
            </a>
          </IconButton>
          <IconButton asChild aria-label="Halcyon on YouTube" variant="ghost" size="sm">
            <a href="https://www.youtube.com/@halcyon">
              <Glyph d="M23 12s0-3.4-.4-5a2.7 2.7 0 0 0-1.9-1.9C19 4.7 12 4.7 12 4.7s-7 0-8.7.4A2.7 2.7 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a2.7 2.7 0 0 0 1.9 1.9c1.7.4 8.7.4 8.7.4s7 0 8.7-.4a2.7 2.7 0 0 0 1.9-1.9c.4-1.6.4-5 .4-5ZM9.8 15.2V8.8l5.7 3.2z" />
            </a>
          </IconButton>
        </Stack>
      }
    />
  )
}
