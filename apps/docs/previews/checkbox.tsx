import { Checkbox, Stack } from '@the_viveksingh/vivek-ui'

export default function CheckboxPreview({ name }: { name: string }) {
  if (name === 'states') {
    return (
      <Stack gap={3}>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled and checked" disabled defaultChecked />
        <Checkbox label="Invalid" invalid />
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Checkbox
        label="Email me about releases"
        description="Roughly once a month. Unsubscribe from any email."
        defaultChecked
      />
      <Checkbox
        label="Share anonymous usage data"
        description="Helps decide which components to build next."
      />
    </Stack>
  )
}
