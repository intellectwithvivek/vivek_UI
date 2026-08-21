import { Field, Input, Stack } from '@the_viveksingh/vivek-ui'

export default function InputPreview({ name }: { name: string }) {
  if (name === 'field') {
    return (
      <Stack gap={4}>
        <Field label="Work email" help="We only use this for billing receipts.">
          <Input type="email" placeholder="you@company.com" />
        </Field>
        <Field label="Subdomain" error="That subdomain is already taken.">
          <Input invalid defaultValue="acme" />
        </Field>
      </Stack>
    )
  }
  if (name === 'types') {
    return (
      <Stack gap={3}>
        <Input type="search" placeholder="Search components" />
        <Input type="number" defaultValue={12} min={1} max={99} />
        <Input type="date" defaultValue="2026-08-21" />
        <Input disabled defaultValue="Disabled" />
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </Stack>
  )
}
