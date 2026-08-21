'use client'

import { Tabs, Text } from '@the_viveksingh/vivek-ui'

export default function TabsPreview() {
  return (
    <Tabs defaultValue="account">
      <Tabs.List>
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Tab disabled value="team">
          Team
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel value="account">
          <Text>Account settings. Arrow keys move between tabs; Tab moves into the panel.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="billing">
          <Text>Billing settings.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="team">
          <Text>Team settings.</Text>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  )
}
