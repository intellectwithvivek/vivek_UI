import { Badge, Card, Grid, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { byCategory, registry } from '../../../lib/registry'

export const metadata: Metadata = {
  title: 'All components',
  description: `Every component in the library, grouped by category, with its rendering mode.`,
}

export default function ComponentsIndexPage() {
  const groups = byCategory(registry.components)
  const serverSafe = registry.components.filter((entry) => !entry.isClient).length

  return (
    <>
      <header className="doc-header">
        <Heading level={1}>All components</Heading>
        <Text size="lg">
          {registry.components.length} components. {serverSafe} render in a Server Component with no
          client JavaScript; the other {registry.components.length - serverSafe} declare{' '}
          <code>'use client'</code> because they genuinely need state, effects or event handlers.
        </Text>
      </header>

      {groups.map(([category, entries]) => (
        <section key={category}>
          <Heading level={2} size="lg">
            {category}{' '}
            <Text as="span" size="md" tone="muted">
              ({entries.length})
            </Text>
          </Heading>
          <Grid cols={{ base: 1, md: 2, xl: 3 }} gap={4} minItemWidth="16rem">
            {entries.map((entry) => (
              <Card interactive key={entry.slug} padding="md" variant="outline">
                <Card.Header>
                  <Stack align="center" direction="horizontal" gap={2} justify="between">
                    <Heading level={3} size="md">
                      <Link href={`/docs/components/${entry.slug}`}>{entry.title}</Link>
                    </Heading>
                    {entry.isClient ? (
                      <Badge size="sm" title="Declares 'use client'" tone="warning">
                        client
                      </Badge>
                    ) : (
                      <Badge size="sm" title="Renders on the server" tone="success">
                        server
                      </Badge>
                    )}
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <Text lineClamp={3} size="sm" tone="muted">
                    {entry.description || `The ${entry.title} component.`}
                  </Text>
                </Card.Body>
              </Card>
            ))}
          </Grid>
        </section>
      ))}
    </>
  )
}
