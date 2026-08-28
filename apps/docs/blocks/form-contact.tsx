import {
  Button,
  Container,
  Field,
  Input,
  Section,
  Select,
  Stack,
  Textarea,
} from '@the_viveksingh/vivek-ui'

export default function FormContact() {
  return (
    <Section>
      <Container size="sm">
        <Section.Header
          eyebrow="Contact"
          title="Tell us what you need"
          description="A person replies within one working day."
        />
        <form onSubmit={(event) => event.preventDefault()}>
          <Stack gap={4}>
            <Field label="Your name" required>
              <Input autoComplete="name" />
            </Field>
            <Field label="Work email" required help="We only use it to reply.">
              <Input type="email" autoComplete="email" />
            </Field>
            <Field label="Topic">
              <Select
                options={[
                  { value: 'sales', label: 'Sales' },
                  { value: 'support', label: 'Support' },
                  { value: 'partnership', label: 'Partnership' },
                ]}
                placeholder="Choose one"
              />
            </Field>
            <Field label="Message" required>
              <Textarea rows={5} />
            </Field>
            <div>
              <Button type="submit">Send message</Button>
            </div>
          </Stack>
        </form>
      </Container>
    </Section>
  )
}
