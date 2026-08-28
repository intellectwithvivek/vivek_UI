import { Container, Heading, Section, Stack, Text } from '@the_viveksingh/vivek-ui'

const LINKS = [
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export default function FooterCentered() {
  return (
    <Section as="footer" padding="md" background="muted">
      <Container>
        <Stack align="center" gap={3}>
          <Heading level={2} size="sm">
            Overtone
          </Heading>
          <nav aria-label="Footer">
            <Stack direction="horizontal" gap={4} wrap justify="center">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{ color: 'var(--vk-color-muted)', textDecoration: 'none' }}
                >
                  <Text as="span" size="sm">
                    {link.label}
                  </Text>
                </a>
              ))}
            </Stack>
          </nav>
          <Text size="sm" tone="muted">
            © 2026 Overtone. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Section>
  )
}
