import { Input, Label, Stack } from '@the_viveksingh/vivek-ui'

export default function LabelPreview({ name }: { name: string }) {
  if (name === 'required') {
    return (
      <Stack gap={2}>
        <Label htmlFor="preview-label-email" required>
          Work email
        </Label>
        <Input id="preview-label-email" type="email" required placeholder="you@company.com" />
      </Stack>
    )
  }
  return (
    <Stack gap={2}>
      <Label htmlFor="preview-label-name">Full name</Label>
      <Input id="preview-label-name" placeholder="Vivek Kumar Singh" />
    </Stack>
  )
}
