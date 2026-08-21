import { AnimatedCounter, Heading, Stack, Text } from '@the_viveksingh/vivek-ui'

export default function AnimatedCounterPreview({ name }: { name: string }) {
  if (name === 'formatted') {
    return (
      <Stack gap={4}>
        <Heading level={3} size="2xl">
          <AnimatedCounter
            value={4280}
            format={{ style: 'currency', currency: 'INR', maximumFractionDigits: 0 }}
            locale="en-IN"
          />
        </Heading>
        <Heading level={3} size="2xl">
          <AnimatedCounter value={99.98} suffix="%" format={{ minimumFractionDigits: 2 }} />
        </Heading>
        <Heading level={3} size="2xl">
          <AnimatedCounter value={1268} prefix="~" suffix=" tests" />
        </Heading>
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Heading level={3} size="hero">
        <AnimatedCounter value={83} duration={1200} />
      </Heading>
      <Text tone="muted">
        Counts up when it scrolls into view. With reduced motion requested it renders the final
        number immediately instead of animating.
      </Text>
    </Stack>
  )
}
