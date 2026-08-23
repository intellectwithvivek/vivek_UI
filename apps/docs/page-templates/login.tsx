'use client'

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Field,
  Heading,
  Input,
  PasswordInput,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import { type FormEvent, useState } from 'react'

/*
 * A sign-in page.
 *
 * The thing sign-in forms get wrong is using the placeholder as the label. It disappears the
 * moment someone types, it is unreadable at its default contrast, and it was never announced
 * as a label in the first place. Every field here has a real one.
 *
 * The other half is `autoComplete`. Password managers and browser autofill are driven
 * entirely by these values - `username` and `current-password` are what make a saved login
 * offer itself. Omit them and every returning user types their password by hand.
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true)
    // Stand-in for the real call. The point of the demo is the failure path.
    setTimeout(() => {
      setBusy(false)
      setError(
        String(data.get('password')) === 'correct-horse'
          ? null
          : 'That email and password do not match an account.',
      )
    }, 600)
  }

  return (
    <Section padding="xl">
      <Container size="sm">
        <Stack align="center" gap={6}>
          <Stack align="center" gap={2}>
            <Heading align="center" level={1} size="xl">
              Sign in to Northwind
            </Heading>
            <Text align="center" tone="muted">
              New here?{' '}
              <Button asChild variant="link">
                <a href="#signup">Create an account</a>
              </Button>
            </Text>
          </Stack>

          <Card padding="lg" style={{ width: '100%', maxWidth: '26rem' }}>
            <form noValidate onSubmit={submit}>
              <Stack gap={4}>
                {/*
                  Rendered only on failure, and it is a real alert, so a screen reader is
                  told about it rather than the user discovering the form did nothing.
                */}
                {error ? (
                  <Alert role="alert" title="Could not sign you in" tone="danger">
                    <Text size="sm">{error}</Text>
                  </Alert>
                ) : null}

                <Field label="Email" required>
                  <Input
                    autoComplete="username"
                    inputMode="email"
                    name="email"
                    placeholder="you@company.com"
                    required
                    type="email"
                  />
                </Field>

                <Field
                  label="Password"
                  required
                  help={
                    <Button asChild size="sm" variant="link">
                      <a href="#reset">Forgotten your password?</a>
                    </Button>
                  }
                >
                  <PasswordInput autoComplete="current-password" name="password" required />
                </Field>

                <Checkbox label="Keep me signed in on this device" name="remember" />

                <Button fullWidth loading={busy} size="lg" type="submit">
                  Sign in
                </Button>

                <Divider label="or" />

                <Stack gap={2}>
                  <Button fullWidth type="button" variant="outline">
                    Continue with GitHub
                  </Button>
                  <Button fullWidth type="button" variant="outline">
                    Continue with Google
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Card>

          <Text align="center" size="sm" tone="muted">
            By signing in you agree to the terms of service and the privacy policy.
          </Text>
        </Stack>
      </Container>
    </Section>
  )
}
