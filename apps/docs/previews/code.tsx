import { Code, Stack, Text } from '@the_viveksingh/vivek-ui'

const SNIPPET = [
  "import { Button } from '@the_viveksingh/vivek-ui'",
  '',
  'export default function App() {',
  '  return <Button>Ship it</Button>',
  '}',
].join('\n')

export default function CodePreview({ name }: { name: string }) {
  if (name === 'block') {
    return <Code block>{SNIPPET}</Code>
  }
  return (
    <Stack gap={3}>
      <Text>
        Install it with <Code>npm i @the_viveksingh/vivek-ui</Code>, then import the stylesheet.
      </Text>
      <Text size="sm" tone="muted">
        Inline code keeps the surrounding line height, so a paragraph containing <Code>Code</Code>{' '}
        does not grow taller than its neighbours.
      </Text>
    </Stack>
  )
}
