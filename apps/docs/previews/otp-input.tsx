import { Field, OTPInput, Stack } from '@the_viveksingh/vivek-ui'

export default function OTPInputPreview({ name }: { name: string }) {
  if (name === 'masked') {
    return (
      <Stack gap={4}>
        <OTPInput length={4} mask type="numeric" defaultValue="1234" size="lg" />
        <OTPInput length={8} type="alphanumeric" size="sm" />
      </Stack>
    )
  }
  return (
    <Field label="Verification code" help="Paste the whole code and it fills every box at once.">
      <OTPInput length={6} />
    </Field>
  )
}
