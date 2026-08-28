import { Button, Hero, Input, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function HeroNewsletter() {
  return (
    <Hero
      eyebrow="Weekly, on Thursdays"
      title="The five things that mattered in frontend this week"
      description="No sponsors, no roundup of roundups. Read by 40,000 engineers who would rather not scroll."
      actions={
        <Stack gap={2} style={{ inlineSize: '100%', maxInlineSize: '28rem' }}>
          <form
            onSubmit={(event) => event.preventDefault()}
            style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
          >
            <Input
              aria-label="Email address"
              type="email"
              placeholder="you@company.com"
              required
              size="lg"
              style={{ flex: '1 1 14rem' }}
            />
            <Button size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <Text size="sm" tone="muted">
            One email a week. Unsubscribe in one click.
          </Text>
        </Stack>
      }
    />
  )
}
