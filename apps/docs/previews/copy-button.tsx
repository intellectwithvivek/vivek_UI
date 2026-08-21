import { CopyButton, Stack } from '@the_viveksingh/vivek-ui'

export default function CopyButtonPreview({ name }: { name: string }) {
  if (name === 'variants') {
    return (
      <Stack direction="horizontal" gap={3} wrap align="center">
        <CopyButton value="npm i @the_viveksingh/vivek-ui" />
        <CopyButton value="pnpm add @the_viveksingh/vivek-ui" variant="outline" />
        <CopyButton value="yarn add @the_viveksingh/vivek-ui" variant="ghost" size="sm" />
      </Stack>
    )
  }
  return (
    <CopyButton
      value="npm i @the_viveksingh/vivek-ui"
      label="Copy install command"
      copiedLabel="Copied"
    />
  )
}
