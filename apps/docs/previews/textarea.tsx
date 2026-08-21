import { Field, Stack, Textarea } from '@the_viveksingh/vivek-ui'

export default function TextareaPreview({ name }: { name: string }) {
  if (name === 'field') {
    return (
      <Field label="Release notes" help="Markdown is supported.">
        <Textarea rows={4} placeholder="What changed in this version?" />
      </Field>
    )
  }
  if (name === 'invalid') {
    return (
      <Field label="Summary" error="A summary is required.">
        <Textarea invalid rows={3} defaultValue="" />
      </Field>
    )
  }
  return (
    <Stack gap={3}>
      <Textarea placeholder="Default, resizable vertically" />
      <Textarea size="sm" resize="none" placeholder="Small, resize disabled" />
    </Stack>
  )
}
