'use client'

import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Field,
  Grid,
  Heading,
  Input,
  RadioGroup,
  Section,
  Select,
  Stack,
  Stepper,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/*
 * Checkout.
 *
 * The single highest-impact thing on a payment form is `autoComplete`. Browser autofill and
 * every password manager are driven entirely by these tokens - `cc-number`, `cc-exp`,
 * `cc-csc`, `postal-code`, `address-line1`. With them the browser fills the form in one tap;
 * without them the customer types sixteen digits on a phone and a good share of them stop.
 *
 * `inputMode="numeric"` matters for the same reason: it is what raises the number pad rather
 * than the full keyboard.
 */

const ITEMS = [
  { id: 'a', name: 'Team plan', detail: '12 seats · annual', price: 3456 },
  { id: 'b', name: 'Priority support', detail: 'Add-on · annual', price: 480 },
  { id: 'c', name: 'Onboarding session', detail: 'One-off', price: 250 },
]

const money = (pence: number) => `£${pence.toLocaleString('en-GB')}`

export default function CheckoutPage() {
  const [shipping, setShipping] = useState('standard')
  const subtotal = ITEMS.reduce((total, item) => total + item.price, 0)
  const vat = Math.round(subtotal * 0.2)

  return (
    <Section padding="lg">
      <Container size="lg">
        <Stack gap={6}>
          <Stack gap={3}>
            <Heading level={1} size="2xl">
              Checkout
            </Heading>
            <Stepper
              activeStep={1}
              steps={[
                { label: 'Basket', description: 'Three items' },
                { label: 'Details', description: 'Billing and payment' },
                { label: 'Confirm', description: 'Review and pay' },
              ]}
            />
          </Stack>

          <Grid gap={6} minItemWidth="20rem">
            <Stack gap={6}>
              <Card padding="lg">
                <Stack gap={4}>
                  <Heading level={2} size="md">
                    Contact
                  </Heading>
                  <Field help="Your receipt and licence keys go here." label="Email" required>
                    <Input
                      autoComplete="email"
                      inputMode="email"
                      name="email"
                      required
                      type="email"
                    />
                  </Field>
                </Stack>
              </Card>

              <Card padding="lg">
                <Stack gap={4}>
                  <Heading level={2} size="md">
                    Billing address
                  </Heading>
                  <Stack direction="horizontal" gap={3}>
                    <Field label="First name" required style={{ flex: 1 }}>
                      <Input autoComplete="given-name" name="given-name" required />
                    </Field>
                    <Field label="Last name" required style={{ flex: 1 }}>
                      <Input autoComplete="family-name" name="family-name" required />
                    </Field>
                  </Stack>
                  <Field label="Company (optional)">
                    <Input autoComplete="organization" name="organization" />
                  </Field>
                  <Field label="Address" required>
                    <Input autoComplete="address-line1" name="address-line1" required />
                  </Field>
                  <Field label="Address line 2 (optional)">
                    <Input autoComplete="address-line2" name="address-line2" />
                  </Field>
                  <Stack direction="horizontal" gap={3}>
                    <Field label="City" required style={{ flex: 1 }}>
                      <Input autoComplete="address-level2" name="city" required />
                    </Field>
                    <Field label="Postcode" required style={{ flex: 1 }}>
                      <Input autoComplete="postal-code" name="postal-code" required />
                    </Field>
                  </Stack>
                  <Field label="Country" required>
                    <Select
                      autoComplete="country-name"
                      defaultValue="gb"
                      name="country"
                      options={[
                        { value: 'gb', label: 'United Kingdom' },
                        { value: 'ie', label: 'Ireland' },
                        { value: 'in', label: 'India' },
                        { value: 'us', label: 'United States' },
                        { value: 'de', label: 'Germany' },
                      ]}
                      required
                    />
                  </Field>
                </Stack>
              </Card>

              <Card padding="lg">
                <Stack gap={4}>
                  <Heading level={2} size="md">
                    Delivery
                  </Heading>
                  <RadioGroup
                    label="How should we deliver this?"
                    name="shipping"
                    onChange={setShipping}
                    options={[
                      {
                        value: 'standard',
                        label: 'Standard — free',
                        description: 'Licence keys by email within one hour.',
                      },
                      {
                        value: 'invoice',
                        label: 'Invoice first — free',
                        description: 'We send a PO-ready invoice; access starts on payment.',
                      },
                    ]}
                    value={shipping}
                  />
                </Stack>
              </Card>

              <Card padding="lg">
                <Stack gap={4}>
                  <Heading level={2} size="md">
                    Payment
                  </Heading>
                  <Field label="Name on card" required>
                    <Input autoComplete="cc-name" name="cc-name" required />
                  </Field>
                  <Field label="Card number" required>
                    <Input
                      autoComplete="cc-number"
                      inputMode="numeric"
                      name="cc-number"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </Field>
                  <Stack direction="horizontal" gap={3}>
                    <Field label="Expiry" required style={{ flex: 1 }}>
                      <Input
                        autoComplete="cc-exp"
                        inputMode="numeric"
                        name="cc-exp"
                        placeholder="MM/YY"
                        required
                      />
                    </Field>
                    <Field
                      help="Three digits on the back."
                      label="Security code"
                      required
                      style={{ flex: 1 }}
                    >
                      <Input
                        autoComplete="cc-csc"
                        inputMode="numeric"
                        name="cc-csc"
                        placeholder="123"
                        required
                      />
                    </Field>
                  </Stack>
                  <Checkbox
                    defaultChecked
                    label="Billing address is the same as above"
                    name="same-address"
                  />
                </Stack>
              </Card>
            </Stack>

            {/*
              Sticky, so the total stays on screen while the form scrolls. On a long
              checkout the summary otherwise disappears at exactly the moment the customer
              wants to check it.
            */}
            <div style={{ position: 'sticky', top: 'var(--vk-space-4)', alignSelf: 'start' }}>
              <Card padding="lg">
                <Stack gap={4}>
                  <Heading level={2} size="md">
                    Order summary
                  </Heading>

                  <Stack gap={3}>
                    {ITEMS.map((item) => (
                      <Stack direction="horizontal" gap={3} justify="between" key={item.id}>
                        <Stack gap={1}>
                          <Text size="sm" weight="medium">
                            {item.name}
                          </Text>
                          <Text size="sm" tone="muted">
                            {item.detail}
                          </Text>
                        </Stack>
                        <Text size="sm">{money(item.price)}</Text>
                      </Stack>
                    ))}
                  </Stack>

                  <Divider />

                  <Stack gap={2}>
                    <Stack direction="horizontal" justify="between">
                      <Text size="sm" tone="muted">
                        Subtotal
                      </Text>
                      <Text size="sm">{money(subtotal)}</Text>
                    </Stack>
                    <Stack direction="horizontal" justify="between">
                      <Text size="sm" tone="muted">
                        VAT (20%)
                      </Text>
                      <Text size="sm">{money(vat)}</Text>
                    </Stack>
                    <Stack direction="horizontal" justify="between">
                      <Text size="sm" tone="muted">
                        Delivery
                      </Text>
                      <Badge size="sm" tone="success" variant="soft">
                        Free
                      </Badge>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack align="center" direction="horizontal" justify="between">
                    <Text weight="semibold">Total</Text>
                    <Heading level={3} size="md">
                      {money(subtotal + vat)}
                    </Heading>
                  </Stack>

                  <Button fullWidth size="lg">
                    Pay {money(subtotal + vat)}
                  </Button>

                  <Alert tone="info" variant="soft">
                    <Text size="sm">
                      You can cancel within 14 days for a full refund, no questions.
                    </Text>
                  </Alert>
                </Stack>
              </Card>
            </div>
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}
