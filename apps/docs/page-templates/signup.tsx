'use client'

import {
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Field,
  Heading,
  Input,
  PasswordInput,
  Progress,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useId, useState } from 'react'

/**
 * Score a password out of four, and say why in words.
 *
 * A meter that only changes colour communicates nothing to a colour-blind user and nothing
 * at all to a screen reader, so the rating is text as well as a bar, and the text lives in a
 * live region that updates as it changes.
 */
function rate(value: string): { score: number; label: string; hint: string } {
  if (value.length === 0) return { score: 0, label: 'Empty', hint: 'Use at least 12 characters.' }
  let score = 0
  if (value.length >= 12) score++
  if (value.length >= 16) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  if (/\d/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  const hints = [
    'Use at least 12 characters.',
    'Longer is the single biggest improvement.',
    'Add a symbol, or make it longer.',
    'Nearly there — a few more characters.',
    'That will do nicely.',
  ]
  return { score, label: labels[score] ?? 'Very weak', hint: hints[score] ?? '' }
}

export default function SignupPage() {
  const [password, setPassword] = useState('')
  const strength = rate(password)
  const meterId = useId()

  return (
    <Section padding="xl">
      <Container size="sm">
        <Stack align="center" gap={6}>
          <Stack align="center" gap={2}>
            <Heading align="center" level={1} size="xl">
              Create your account
            </Heading>
            <Text align="center" tone="muted">
              Free forever. No card, no trial clock.
            </Text>
          </Stack>

          <Card padding="lg" style={{ width: '100%', maxWidth: '28rem' }}>
            <form onSubmit={(event) => event.preventDefault()}>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={3}>
                  <Field label="First name" required style={{ flex: 1 }}>
                    <Input autoComplete="given-name" name="given-name" required />
                  </Field>
                  <Field label="Last name" required style={{ flex: 1 }}>
                    <Input autoComplete="family-name" name="family-name" required />
                  </Field>
                </Stack>

                <Field
                  help="We send one confirmation email and nothing else."
                  label="Work email"
                  required
                >
                  <Input
                    autoComplete="email"
                    inputMode="email"
                    name="email"
                    placeholder="you@company.com"
                    required
                    type="email"
                  />
                </Field>

                <Stack gap={2}>
                  <Field label="Password" required>
                    <PasswordInput
                      aria-describedby={meterId}
                      autoComplete="new-password"
                      name="new-password"
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      value={password}
                    />
                  </Field>

                  <Progress
                    label={`Password strength: ${strength.label}`}
                    max={4}
                    size="sm"
                    tone={
                      strength.score >= 3 ? 'success' : strength.score >= 2 ? 'warning' : 'danger'
                    }
                    value={strength.score}
                  />

                  {/*
                    Always mounted, so the screen reader is already watching it. A live region
                    created at the moment it gains text is frequently never announced.
                  */}
                  <Text aria-live="polite" id={meterId} size="sm" tone="muted">
                    {strength.label}. {strength.hint}
                  </Text>
                </Stack>

                <Checkbox
                  description="You can delete your account and all its data at any time."
                  label="I agree to the terms of service and the privacy policy"
                  name="terms"
                  required
                />

                <Button fullWidth size="lg" type="submit">
                  Create account
                </Button>

                <Divider label="or" />

                <Button fullWidth type="button" variant="outline">
                  Continue with GitHub
                </Button>
              </Stack>
            </form>
          </Card>

          <Text align="center" size="sm" tone="muted">
            Already have an account?{' '}
            <Button asChild variant="link">
              <a href="#login">Sign in</a>
            </Button>
          </Text>
        </Stack>
      </Container>
    </Section>
  )
}
