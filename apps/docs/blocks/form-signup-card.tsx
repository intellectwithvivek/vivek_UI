import {
  Button,
  Card,
  Checkbox,
  Container,
  Field,
  Heading,
  Input,
  PasswordInput,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

export default function FormSignupCard() {
  return (
    <Section background="muted">
      <Container size="sm">
        <Card padding="lg" variant="elevated">
          <form onSubmit={(event) => event.preventDefault()}>
            <Stack gap={4}>
              <Stack gap={1}>
                <Heading level={2} size="md">
                  Create your account
                </Heading>
                <Text size="sm" tone="muted">
                  Free for 14 days. No card needed.
                </Text>
              </Stack>
              <Field label="Email" required>
                <Input type="email" autoComplete="email" />
              </Field>
              <Field label="Password" required help="At least 12 characters.">
                <PasswordInput autoComplete="new-password" />
              </Field>
              <Checkbox label="Email me product updates (about one a month)" />
              <Button type="submit" fullWidth>
                Create account
              </Button>
              <Text size="sm" tone="muted">
                By continuing you agree to the terms and privacy policy.
              </Text>
            </Stack>
          </form>
        </Card>
      </Container>
    </Section>
  )
}
