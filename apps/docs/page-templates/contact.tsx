'use client'

import {
  Alert,
  Button,
  Card,
  Container,
  Field,
  Grid,
  Heading,
  Input,
  MapEmbed,
  Section,
  Select,
  Stack,
  Text,
  Textarea,
} from '@the_viveksingh/vivek-ui'
import { type FormEvent, useState } from 'react'

const HOURS = [
  ['Monday – Thursday', '09:00 – 18:00'],
  ['Friday', '09:00 – 16:00'],
  ['Saturday – Sunday', 'Closed'],
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <Section padding="xl">
      <Container size="lg">
        <Stack gap={8}>
          <Stack gap={2}>
            <Heading level={1} size="2xl">
              Talk to us
            </Heading>
            <Text size="lg" tone="muted">
              Questions about the product, a partnership, or an invoice — this reaches a person,
              usually within a working day.
            </Text>
          </Stack>

          <Grid gap={6} minItemWidth="20rem">
            <Card padding="lg">
              {sent ? (
                <Alert role="status" title="Message sent" tone="success">
                  <Text size="sm">
                    Thanks — we have it. You will get a reply at the address you gave us.
                  </Text>
                </Alert>
              ) : (
                <form onSubmit={submit}>
                  <Stack gap={4}>
                    <Field label="Your name" required>
                      <Input autoComplete="name" name="name" required />
                    </Field>

                    <Field label="Email" required>
                      <Input
                        autoComplete="email"
                        inputMode="email"
                        name="email"
                        required
                        type="email"
                      />
                    </Field>

                    <Field label="What is this about?" required>
                      <Select
                        name="topic"
                        options={[
                          { value: 'sales', label: 'Sales and pricing' },
                          { value: 'support', label: 'Technical support' },
                          { value: 'partner', label: 'Partnerships' },
                          { value: 'billing', label: 'Billing' },
                          { value: 'other', label: 'Something else' },
                        ]}
                        placeholder="Choose a topic"
                        required
                      />
                    </Field>

                    <Field
                      help="The more detail you give us, the better the first reply will be."
                      label="Message"
                      required
                    >
                      <Textarea name="message" required rows={6} />
                    </Field>

                    <Button size="lg" type="submit">
                      Send message
                    </Button>
                  </Stack>
                </form>
              )}
            </Card>

            <Stack gap={6}>
              <Card padding="lg">
                <Stack gap={3}>
                  <Heading level={2} size="md">
                    Northwind HQ
                  </Heading>
                  <Text tone="muted">
                    12 Baltic Wharf
                    <br />
                    Bristol BS1 6XN
                    <br />
                    United Kingdom
                  </Text>
                  <Stack gap={1}>
                    <Text size="sm">
                      <strong>General</strong> hello@northwind.example
                    </Text>
                    <Text size="sm">
                      <strong>Support</strong> support@northwind.example
                    </Text>
                    <Text size="sm">
                      <strong>Phone</strong> +44 117 496 0000
                    </Text>
                  </Stack>
                </Stack>
              </Card>

              <Card padding="lg">
                <Stack gap={3}>
                  <Heading level={2} size="md">
                    Opening hours
                  </Heading>
                  <Stack gap={2}>
                    {HOURS.map(([days, time]) => (
                      <Stack direction="horizontal" justify="between" key={days}>
                        <Text size="sm">{days}</Text>
                        <Text size="sm" tone="muted">
                          {time}
                        </Text>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/*
                OpenStreetMap rather than Google. A Google embed sets cookies the moment it
                paints, which in the EU needs consent before it loads rather than after -
                switch `provider` to "google" and the component puts a consent step in front
                of the frame instead of loading it.
              */}
              <MapEmbed
                lat={51.4478}
                lon={-2.6}
                ratio={16 / 10}
                title="Northwind HQ, Baltic Wharf, Bristol"
                zoom={15}
              />
            </Stack>
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}
