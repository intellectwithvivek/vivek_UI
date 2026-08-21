import { Stack, Switch } from '@the_viveksingh/vivek-ui'

export default function SwitchPreview({ name }: { name: string }) {
  if (name === 'labelPosition') {
    return (
      <Stack gap={3}>
        <Switch label="Control before label (default)" defaultChecked />
        <Switch label="Control after label" labelPosition="start" defaultChecked />
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Switch
        label="Two-factor authentication"
        description="Require a one-time code at sign-in."
        defaultChecked
      />
      <Switch label="Weekly digest" description="A summary of activity every Monday." />
      <Switch label="Disabled" disabled />
    </Stack>
  )
}
