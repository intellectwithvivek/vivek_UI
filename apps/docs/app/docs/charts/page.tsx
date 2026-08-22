import { Alert, Card, Grid, Heading, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock } from '../../../components/code-block'
import { pageMeta } from '../../../lib/page-meta'
import { PACKAGE_NAME, registry } from '../../../lib/registry'

export const metadata: Metadata = pageMeta({
  title: 'Charts',
  description:
    'Six React chart components in pure SVG with no charting dependency: line, area, bar, pie and donut, sparkline and progress ring. Server-rendered and accessible.',
  path: '/docs/charts',
  keywords: ['react charts no dependencies', 'react svg charts', 'lightweight react chart library'],
})

export default function ChartsIndexPage() {
  return (
    <>
      <header className="doc-header">
        <Heading level={1}>Charts</Heading>
        <Text size="lg">
          {registry.charts.length} chart types in pure inline SVG. No d3, no canvas library, no
          charting dependency — 8.14 kB for all of them.
        </Text>
      </header>

      <section>
        <Heading level={2} size="lg">
          Import
        </Heading>
        <Text tone="muted">
          Charts live at their own subpath, with their own stylesheet, so an app that never draws a
          chart pays nothing for them.
        </Text>
        <CodeBlock
          code={`import { LineChart } from '${PACKAGE_NAME}/charts'
import '${PACKAGE_NAME}/charts.css'`}
        />
      </section>

      <section>
        <Heading level={2} size="lg">
          Accessibility
        </Heading>
        <Alert icon={null} tone="info">
          <Text size="sm">
            Every chart renders a real <code>&lt;table&gt;</code> fallback, so a screen-reader user
            gets the actual numbers rather than "image". No series is encoded by colour alone: each
            carries a distinct dash pattern and marker shape, on a colourblind-safe palette with a
            lifted dark-mode ramp.
          </Text>
        </Alert>
      </section>

      <section>
        <Heading level={2} size="lg">
          The set
        </Heading>
        <Grid cols={{ base: 1, md: 2 }} gap={4}>
          {registry.charts.map((entry) => (
            <Card interactive key={entry.slug} variant="outline">
              <Card.Header>
                <Heading level={3} size="md">
                  <Link href={`/docs/charts/${entry.slug}`}>{entry.title}</Link>
                </Heading>
              </Card.Header>
              <Card.Body>
                <Text size="sm" tone="muted">
                  {entry.description || `The ${entry.title} chart.`}
                </Text>
              </Card.Body>
            </Card>
          ))}
        </Grid>
      </section>
    </>
  )
}
