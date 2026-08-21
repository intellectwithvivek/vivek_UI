import { RadioGroup, Stack } from '@the_viveksingh/vivek-ui'

const PLANS = [
  { value: 'starter', label: 'Starter', description: 'Up to 3 projects' },
  { value: 'team', label: 'Team', description: 'Unlimited projects, 10 seats' },
  { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit log, SLA' },
]

export default function RadioGroupPreview({ name }: { name: string }) {
  if (name === 'horizontal') {
    return (
      <RadioGroup
        name="preview-billing"
        label="Billing period"
        orientation="horizontal"
        defaultValue="annual"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'annual', label: 'Annual' },
        ]}
      />
    )
  }
  return (
    <Stack gap={4}>
      <RadioGroup name="preview-plan" label="Plan" defaultValue="team" options={PLANS} />
    </Stack>
  )
}
