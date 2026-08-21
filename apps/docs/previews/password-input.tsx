'use client'

// A predicate or validator prop is a function, and a function cannot cross from a
// Server Component into a Client Component. This preview therefore has to be a client
// component itself - the same constraint applies in any app that uses these props.
import { Field, PasswordInput, Stack } from '@the_viveksingh/vivek-ui'

export default function PasswordInputPreview({ name }: { name: string }) {
  if (name === 'strength') {
    return (
      <Field label="Choose a password" help="At least 12 characters, mixed case, and a digit.">
        <PasswordInput
          strength
          rules={[
            { id: 'length', label: 'At least 12 characters', test: (v) => v.length >= 12 },
            {
              id: 'case',
              label: 'Upper and lower case',
              test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
            },
            { id: 'digit', label: 'At least one digit', test: (v) => /\d/.test(v) },
            { id: 'symbol', label: 'At least one symbol', test: (v) => /[^\w\s]/.test(v) },
          ]}
          defaultValue="Passw0rd"
        />
      </Field>
    )
  }
  return (
    <Stack gap={3}>
      <PasswordInput placeholder="Your password" autoComplete="current-password" />
      <PasswordInput size="sm" defaultVisible defaultValue="already visible" />
      <PasswordInput invalid defaultValue="short" />
    </Stack>
  )
}
