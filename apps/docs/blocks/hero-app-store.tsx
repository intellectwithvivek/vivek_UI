import { Button, Hero, Image, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function HeroAppStore() {
  return (
    <Hero
      layout="split"
      eyebrow="Personal finance"
      title="Know where every rupee went"
      description="Connect your bank once. We sort every transaction, flag the subscriptions you forgot, and tell you what is left to spend."
      actions={
        <Stack gap={2}>
          <Stack direction="horizontal" gap={3} wrap>
            <Button size="lg" variant="outline">
              Download on the App Store
            </Button>
            <Button size="lg" variant="outline">
              Get it on Google Play
            </Button>
          </Stack>
          <Text size="sm" tone="muted">
            Free for one account. 4.8 ★ from 21,000 reviews.
          </Text>
        </Stack>
      }
      media={
        <Image
          src="/demo/vk-phone.svg"
          alt="The app's home screen on a phone"
          ratio={3 / 4}
          rounded="lg"
          fit="cover"
        />
      }
    />
  )
}
