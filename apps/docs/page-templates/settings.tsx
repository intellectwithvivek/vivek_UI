'use client'

import {
  Alert,
  Avatar,
  Button,
  Card,
  Container,
  Divider,
  Field,
  Heading,
  Input,
  Modal,
  Section,
  Select,
  Stack,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
  Text,
  Textarea,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/*
 * Settings pages are a keyboard test wearing a disguise.
 *
 * The tabs implement the full WAI-ARIA tab pattern - arrow keys move between tabs, Home and
 * End jump to the ends, and the panel is only in the tab order when its tab is selected.
 * Each switch is a real checkbox underneath, so it submits with the form and works without
 * JavaScript. And the destructive action asks first, in a dialog that traps focus and gives
 * it back to the button that opened it.
 */
export default function SettingsPage() {
  const [dirty, setDirty] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <Section padding="lg">
      <Container size="md">
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading level={1} size="2xl">
              Settings
            </Heading>
            <Text tone="muted">Changes apply to your account across every workspace.</Text>
          </Stack>

          <Tabs defaultValue="profile" onValueChange={() => setDirty(false)}>
            <TabsList>
              <TabsTab value="profile">Profile</TabsTab>
              <TabsTab value="notifications">Notifications</TabsTab>
              <TabsTab value="security">Security</TabsTab>
            </TabsList>

            <TabsPanels>
              <TabsPanel value="profile">
                <Stack gap={6}>
                  <Card padding="lg">
                    <Stack gap={4}>
                      <Heading level={2} size="md">
                        Your details
                      </Heading>

                      <Stack align="center" direction="horizontal" gap={4}>
                        <Avatar name="Priya Raman" size="xl" />
                        <Stack gap={2}>
                          <Button size="sm" variant="outline">
                            Change photo
                          </Button>
                          <Text size="sm" tone="muted">
                            JPG or PNG, up to 2 MB.
                          </Text>
                        </Stack>
                      </Stack>

                      <Stack direction="horizontal" gap={3}>
                        <Field label="Display name" style={{ flex: 1 }}>
                          <Input
                            defaultValue="Priya Raman"
                            name="name"
                            onChange={() => setDirty(true)}
                          />
                        </Field>
                        <Field label="Pronouns" style={{ flex: 1 }}>
                          <Input
                            defaultValue="they/them"
                            name="pronouns"
                            onChange={() => setDirty(true)}
                          />
                        </Field>
                      </Stack>

                      <Field help="Used for sign-in and receipts." label="Email">
                        <Input
                          autoComplete="email"
                          defaultValue="priya@meridian.example"
                          name="email"
                          onChange={() => setDirty(true)}
                          type="email"
                        />
                      </Field>

                      <Field help="Shown on your public profile." label="Bio">
                        <Textarea
                          defaultValue="Staff engineer. Mostly design systems and build tooling."
                          name="bio"
                          onChange={() => setDirty(true)}
                          rows={3}
                        />
                      </Field>

                      <Field label="Time zone">
                        <Select
                          defaultValue="europe-london"
                          name="timezone"
                          onChange={() => setDirty(true)}
                          options={[
                            { value: 'europe-london', label: 'London (GMT+1)' },
                            { value: 'asia-kolkata', label: 'Kolkata (GMT+5:30)' },
                            { value: 'america-new-york', label: 'New York (GMT−4)' },
                            { value: 'asia-tokyo', label: 'Tokyo (GMT+9)' },
                          ]}
                        />
                      </Field>
                    </Stack>
                  </Card>
                </Stack>
              </TabsPanel>

              <TabsPanel value="notifications">
                <Card padding="lg">
                  <Stack gap={4}>
                    <Heading level={2} size="md">
                      What we email you about
                    </Heading>
                    <Stack gap={3}>
                      <Switch
                        defaultChecked
                        description="Someone assigns you an issue or mentions you in a comment."
                        label="Mentions and assignments"
                        onChange={() => setDirty(true)}
                      />
                      <Switch
                        defaultChecked
                        description="A deploy fails, or an alert fires on a service you own."
                        label="Incidents"
                        onChange={() => setDirty(true)}
                      />
                      <Switch
                        description="A short summary of your team's week, on Friday afternoon."
                        label="Weekly digest"
                        onChange={() => setDirty(true)}
                      />
                      <Switch
                        description="New features and the occasional case study. No more than monthly."
                        label="Product news"
                        onChange={() => setDirty(true)}
                      />
                    </Stack>

                    <Divider />

                    <Field
                      help="Nothing is sent during these hours, except incidents."
                      label="Quiet hours"
                    >
                      <Select
                        defaultValue="22-07"
                        name="quiet"
                        options={[
                          { value: 'off', label: 'Off' },
                          { value: '22-07', label: '22:00 – 07:00' },
                          { value: '20-08', label: '20:00 – 08:00' },
                        ]}
                      />
                    </Field>
                  </Stack>
                </Card>
              </TabsPanel>

              <TabsPanel value="security">
                <Stack gap={6}>
                  <Card padding="lg">
                    <Stack gap={4}>
                      <Heading level={2} size="md">
                        Password and access
                      </Heading>
                      <Field label="Current password">
                        <Input autoComplete="current-password" name="current" type="password" />
                      </Field>
                      <Field help="At least 12 characters." label="New password">
                        <Input autoComplete="new-password" name="new" type="password" />
                      </Field>
                      <Switch
                        defaultChecked
                        description="A code from your authenticator app, in addition to your password."
                        label="Two-factor authentication"
                      />
                      <Button style={{ alignSelf: 'flex-start' }}>Update password</Button>
                    </Stack>
                  </Card>

                  <Card padding="lg">
                    <Stack gap={4}>
                      <Heading level={2} size="md">
                        Danger zone
                      </Heading>
                      <Alert
                        tone="danger"
                        variant="outline"
                        title="Deleting an account is permanent"
                      >
                        <Text size="sm">
                          Every workspace you own, and everything in it, is removed immediately.
                          There is no recovery window.
                        </Text>
                      </Alert>
                      <Button
                        onClick={() => setConfirming(true)}
                        style={{ alignSelf: 'flex-start' }}
                        variant="outline"
                      >
                        Delete my account
                      </Button>
                    </Stack>
                  </Card>
                </Stack>
              </TabsPanel>
            </TabsPanels>
          </Tabs>

          {/*
            A save bar that only appears once something changed. Sticky at the bottom, so on
            a long settings page the control is never scrolled away from the change.
          */}
          {dirty ? (
            <Card
              padding="md"
              style={{ position: 'sticky', bottom: 'var(--vk-space-4)' }}
              variant="elevated"
            >
              <Stack align="center" direction="horizontal" gap={3} justify="between" wrap>
                <Text size="sm">You have unsaved changes.</Text>
                <Stack direction="horizontal" gap={2}>
                  <Button onClick={() => setDirty(false)} size="sm" variant="ghost">
                    Discard
                  </Button>
                  <Button onClick={() => setDirty(false)} size="sm">
                    Save changes
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ) : null}
        </Stack>
      </Container>

      <Modal onOpenChange={setConfirming} open={confirming} title="Delete your account?">
        <Modal.Body>
          <Stack gap={3}>
            <Text>
              This removes every workspace you own and everything in them. It cannot be undone.
            </Text>
            <Field label="Type DELETE to confirm">
              <Input name="confirm" placeholder="DELETE" />
            </Field>
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setConfirming(false)} variant="ghost">
            Cancel
          </Button>
          <Button onClick={() => setConfirming(false)}>Yes, delete it</Button>
        </Modal.Footer>
      </Modal>
    </Section>
  )
}
