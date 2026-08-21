import { Field, Select, Stack } from '@the_viveksingh/vivek-ui'

const REGIONS = [
  { value: 'ap-south-1', label: 'Mumbai (ap-south-1)' },
  { value: 'eu-west-1', label: 'Ireland (eu-west-1)' },
  { value: 'us-east-1', label: 'Virginia (us-east-1)' },
  { value: 'sa-east-1', label: 'Sao Paulo (sa-east-1)', disabled: true },
]

export default function SelectPreview({ name }: { name: string }) {
  if (name === 'field') {
    return (
      <Field label="Region" help="Data never leaves the region you pick.">
        <Select options={REGIONS} placeholder="Choose a region" />
      </Field>
    )
  }
  if (name === 'children') {
    return (
      <Select defaultValue="team">
        <optgroup label="Paid">
          <option value="team">Team</option>
          <option value="enterprise">Enterprise</option>
        </optgroup>
        <optgroup label="Free">
          <option value="hobby">Hobby</option>
        </optgroup>
      </Select>
    )
  }
  return (
    <Stack gap={3}>
      <Select size="sm" options={REGIONS} placeholder="Small" />
      <Select size="md" options={REGIONS} placeholder="Medium" />
      <Select size="lg" options={REGIONS} placeholder="Large" />
      <Select invalid options={REGIONS} placeholder="Invalid" />
    </Stack>
  )
}
