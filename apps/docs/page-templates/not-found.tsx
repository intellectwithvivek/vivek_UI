'use client'

import {
  Button,
  Card,
  Container,
  EmptyState,
  Grid,
  Heading,
  Input,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

const DESTINATIONS = [
  {
    href: '/docs',
    title: 'Documentation',
    description: 'Installation, theming and the component reference.',
  },
  {
    href: '/docs/components',
    title: 'Components',
    description: 'All ninety-one, with live examples and props tables.',
  },
  {
    href: '/docs/charts',
    title: 'Charts',
    description: 'Six charts, each with an accessible data table.',
  },
  {
    href: '/pages',
    title: 'Page templates',
    description: 'Whole pages you can copy, from a landing page to a checkout.',
  },
]

/*
 * A 404 that does something.
 *
 * The status code is the important detail: a large "404" on the page is invisible to
 * assistive technology unless it is in the accessibility tree, so the error is announced
 * through a real heading and a live region rather than through typography. The search box
 * and the destination list are there because a shrug is not a recovery path.
 */
export default function NotFoundPage() {
  return (
    <Section padding="xl">
      <Container size="md">
        <Stack gap={8}>
          <EmptyState
            actions={
              <>
                <Button size="lg">Back to the homepage</Button>
                <Button size="lg" variant="outline">
                  Search the docs
                </Button>
              </>
            }
            description="The page you asked for does not exist, or it moved and we did not leave a redirect. Both are our fault rather than yours."
            icon={
              <svg aria-hidden="true" fill="none" height="48" viewBox="0 0 24 24" width="48">
                <path
                  d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v5m0 3.5h.01"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            }
            size="lg"
            title="404 — we cannot find that page"
          />

          <Card padding="lg">
            <form onSubmit={(event) => event.preventDefault()}>
              <Stack gap={3}>
                <Heading level={2} size="md">
                  Search instead
                </Heading>
                <Stack direction="horizontal" gap={2}>
                  <Input
                    aria-label="Search the documentation"
                    name="q"
                    placeholder="Try “focus trap” or “DataTable”"
                    style={{ flex: 1 }}
                    type="search"
                  />
                  <Button type="submit">Search</Button>
                </Stack>
              </Stack>
            </form>
          </Card>

          <Stack gap={4}>
            <Heading level={2} size="md">
              Or try one of these
            </Heading>
            <Grid gap={4} minItemWidth="15rem">
              {DESTINATIONS.map((item) => (
                <Card interactive key={item.title} padding="md">
                  <Stack gap={1}>
                    <Heading level={3} size="sm">
                      <a href={item.href}>{item.title}</a>
                    </Heading>
                    <Text size="sm" tone="muted">
                      {item.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          <Text size="sm" tone="muted">
            Arrived here from a link on our own site? Tell us and we will fix it —
            hello@northwind.example.
          </Text>
        </Stack>
      </Container>
    </Section>
  )
}
