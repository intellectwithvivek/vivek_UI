import { Button, Card, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'
import { LINKS } from '../lib/links'

/**
 * The support ask.
 *
 * Deliberately understated and placed after the value, not before it: the library is MIT
 * and stays that way, so this is a thank-you, not a gate.
 */
export function SupportCta() {
  return (
    <Card padding="lg" variant="outline">
      <Card.Header>
        <Heading level={2} size="lg">
          Free forever, MIT licensed
        </Heading>
      </Card.Header>
      <Card.Body>
        <Text tone="muted">
          There is no paid tier, no pro components and no telemetry. If it saved you a weekend, a
          coffee is a kind way to say so — and a star on the repo helps other people find it.
        </Text>
      </Card.Body>
      <Card.Footer>
        <Stack direction="horizontal" gap={3} wrap>
          <Button asChild>
            <a href={LINKS.buyMeACoffee} rel="noopener noreferrer" target="_blank">
              ☕ Buy me a coffee
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={LINKS.repo} rel="noopener noreferrer" target="_blank">
              ★ Star on GitHub
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={LINKS.sponsors} rel="noopener noreferrer" target="_blank">
              GitHub Sponsors
            </a>
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  )
}
