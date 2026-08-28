'use client'

import { Alert, Button, Field, Form, Input, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function FormPreview() {
  const [done, setDone] = useState<string | null>(null)

  return (
    <Stack gap={3}>
      <Text size="sm" tone="muted">
        Submit empty to see native rules reported readably, with focus moved to the first failure.
        The confirm rule is one line of `validate`. The two-second submit shows `submitting` driving
        the button.
      </Text>
      <Form
        messages={{
          email: {
            valueMissing: 'We need an email to reach you',
            typeMismatch: 'That does not look like an email',
          },
          password: { valueMissing: 'Pick a password', tooShort: 'At least 8 characters' },
        }}
        onSubmit={async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          setDone(String(values.email))
        }}
        validate={(values) =>
          values.password !== values.confirm ? { confirm: 'Passwords do not match' } : null
        }
      >
        {({ errors, submitting }) => (
          <Stack gap={4} style={{ maxWidth: '24rem' }}>
            {done ? (
              <Alert title="Account created" tone="success">
                <Text size="sm">Signed up as {done}.</Text>
              </Alert>
            ) : null}
            <Field error={errors.email} label="Email" required>
              <Input autoComplete="email" name="email" required type="email" />
            </Field>
            <Field error={errors.password} label="Password" required>
              <Input
                autoComplete="new-password"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </Field>
            <Field error={errors.confirm} label="Confirm password" required>
              <Input autoComplete="new-password" name="confirm" required type="password" />
            </Field>
            <Button loading={submitting} type="submit">
              Create account
            </Button>
          </Stack>
        )}
      </Form>
    </Stack>
  )
}
