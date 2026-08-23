import { Alert, Badge, Card, Code, Grid, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock } from '../../components/code-block'
import { SupportCta } from '../../components/support-cta'
import { pageMeta } from '../../lib/page-meta'
import { PACKAGE_NAME, registry } from '../../lib/registry'

export const metadata: Metadata = pageMeta({
  title: 'Introduction',
  // Derived, not written down: this said 83 at 91, and nothing rendered differently.
  description: `VivekUI is a free React component library with zero runtime dependencies: ${registry.components.length} accessible components and ${registry.charts.length} SVG charts, one install, one CSS import, no config.`,
  path: '/docs',
  keywords: ['react component library', 'zero dependency react ui', 'free react components'],
})

const serverSafe = registry.components.filter((entry) => !entry.isClient).length

export default function DocsIndexPage() {
  return (
    <>
      <header className="doc-header">
        <Heading level={1}>Introduction</Heading>
        <Text size="lg">
          {registry.components.length} React components and {registry.charts.length} charts with{' '}
          <strong>zero runtime dependencies</strong>. One install, one CSS import, no configuration.
        </Text>
        <Stack direction="horizontal" gap={2} wrap>
          <Badge tone="primary">v{registry.version}</Badge>
          <Badge tone="success">{serverSafe} server safe</Badge>
          <Badge tone="neutral">MIT</Badge>
        </Stack>
      </header>

      <section>
        <Heading level={2} size="lg">
          The whole setup
        </Heading>
        <CodeBlock code={`npm install ${PACKAGE_NAME}`} plain filename="terminal" />
        <CodeBlock code={`import '${PACKAGE_NAME}/styles.css'`} filename="app/layout.tsx" plain />
        <Text tone="muted">
          That is it. No config file, no CLI, no Tailwind, no PostCSS plugin, no provider.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          What makes it different
        </Heading>
        <Grid cols={{ base: 1, md: 2 }} gap={4}>
          <Card>
            <Card.Header>
              <Heading level={3} size="md">
                A dependency, not a snippet
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text size="sm" tone="muted">
                Copy-paste kits hand you the source and the maintenance with it. This is a normal
                package: <Code>npm update</Code> and you have the fixes.
              </Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>
              <Heading level={3} size="md">
                Your CSS always wins
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text size="sm" tone="muted">
                Every selector is wrapped in <Code>:where()</Code>, which has specificity zero. One
                flat class of your own beats the library, with no <Code>!important</Code>.{' '}
                <Link href="/docs/styling">How overriding works</Link>.
              </Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>
              <Heading level={3} size="md">
                Server safe by default
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text size="sm" tone="muted">
                {serverSafe} of {registry.components.length} components carry no{' '}
                <Code>'use client'</Code>. <Link href="/docs/server-components">Which and why</Link>
                .
              </Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>
              <Heading level={3} size="md">
                Responsive with no props
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text size="sm" tone="muted">
                Container queries, not viewport queries — a grid inside a narrow sidebar stacks like
                it would on a phone. <Link href="/docs/responsive">How</Link>.
              </Text>
            </Card.Body>
          </Card>
        </Grid>
      </section>

      <section>
        <Heading level={2} size="lg">
          This site is the proof
        </Heading>
        <Alert icon={null} tone="info">
          <Text size="sm">
            Every page you are looking at is built with this library and nothing else — no Tailwind,
            no second component library. The header is <Code>Navbar</Code>, the sidebar is{' '}
            <Code>Sidebar</Code>, search is <Code>CommandPalette</Code>, the props tables are{' '}
            <Code>Table</Code>, this box is <Code>Alert</Code>. If something here looks wrong, that
            is a bug report.
          </Text>
        </Alert>
      </section>

      <section>
        <Heading level={2} size="lg">
          Next
        </Heading>
        <Stack gap={2}>
          <Text>
            <Link href="/docs/installation">Installation</Link> — npm, yarn, pnpm, and the Next.js
            and Vite setups.
          </Text>
          <Text>
            <Link href="/docs/components">All components</Link> — every one, with generated props
            tables.
          </Text>
          <Text>
            <Link href="/playground">Playground</Link> — every export in scope, edit and run.
          </Text>
        </Stack>
      </section>
      <div className="support">
        <SupportCta />
      </div>
    </>
  )
}
