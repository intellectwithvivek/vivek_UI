import { Field, Input, Select, Stack, Textarea } from '@the_viveksingh/vivek-ui'

export default function FieldPreview({ name }: { name: string }) {
  if (name === 'controls') {
    return (
      <Stack gap={4} style={{ maxWidth: '24rem' }}>
        <Field label="Bio" help="Markdown is not supported.">
          <Textarea rows={3} />
        </Field>
        <Field label="Role">
          <Select
            placeholder="Choose one"
            options={[
              { value: 'dev', label: 'Developer' },
              { value: 'des', label: 'Designer' },
            ]}
          />
        </Field>
      </Stack>
    )
  }
  return (
    <Stack gap={4} style={{ maxWidth: '24rem' }}>
      <Field help="We will never share it." label="Email" required>
        <Input autoComplete="email" type="email" />
      </Field>
      <Field error="That is not an email address." label="Email">
        <Input defaultValue="not-an-email" type="email" />
      </Field>
    </Stack>
  )
}
