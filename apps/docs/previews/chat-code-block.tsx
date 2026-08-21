import { ChatCodeBlock, Stack } from '@the_viveksingh/vivek-ui'

const SNIPPET = [
  "import { Button, ToastProvider, useToast } from '@the_viveksingh/vivek-ui'",
  '',
  'function Save() {',
  '  const { toast } = useToast()',
  "  return <Button onClick={() => toast({ title: 'Saved' })}>Save</Button>",
  '}',
].join('\n')

export default function ChatCodeBlockPreview({ name }: { name: string }) {
  if (name === 'wrap') {
    return (
      <ChatCodeBlock
        language="bash"
        wrap
        code="npm install @the_viveksingh/vivek-ui && echo 'now import @the_viveksingh/vivek-ui/styles.css once, at the root of your app'"
      />
    )
  }
  return (
    <Stack gap={4}>
      <ChatCodeBlock filename="save-button.tsx" language="tsx" code={SNIPPET} />
    </Stack>
  )
}
