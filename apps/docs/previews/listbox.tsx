'use client'

import { Listbox, type ListboxOption, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const REGIONS: ListboxOption[] = [
  { value: 'ap-south-1', label: 'Mumbai', description: 'ap-south-1' },
  { value: 'ap-southeast-1', label: 'Singapore', description: 'ap-southeast-1' },
  { value: 'eu-west-1', label: 'Ireland', description: 'eu-west-1' },
  {
    value: 'eu-central-1',
    label: 'Frankfurt',
    description: 'eu-central-1 · at capacity',
    disabled: true,
  },
  { value: 'us-east-1', label: 'N. Virginia', description: 'us-east-1' },
  { value: 'us-west-2', label: 'Oregon', description: 'us-west-2' },
]

const CHANNELS: ListboxOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push notification' },
  { value: 'slack', label: 'Slack' },
  { value: 'pager', label: 'Pager', disabled: true },
]

export default function ListboxPreview() {
  const [region, setRegion] = useState<string | null>('ap-south-1')
  const [channels, setChannels] = useState<string[]>(['email', 'push'])

  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Text as="span" id="region-label" weight="medium">
          Deploy region
        </Text>
        <Listbox
          labelledBy="region-label"
          options={REGIONS}
          value={region}
          onValueChange={setRegion}
        />
        <Text size="sm" tone="muted">
          {region ? `Deploying to ${region}.` : 'No region selected.'} Arrow keys move and select;
          type a letter to jump.
        </Text>
      </Stack>
      <Stack gap={2}>
        <Text as="span" id="channels-label" weight="medium">
          Alert channels
        </Text>
        <Listbox
          labelledBy="channels-label"
          options={CHANNELS}
          multiple
          value={channels}
          onValueChange={setChannels}
          size="sm"
        />
        <Text size="sm" tone="muted">
          {channels.length} selected. Space toggles, Shift+Arrow extends, Ctrl/⌘+A selects all.
        </Text>
      </Stack>
    </Stack>
  )
}
