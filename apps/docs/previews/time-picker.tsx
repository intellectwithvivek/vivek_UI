'use client'

import { Field, Stack, Text, TimePicker } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function TimePickerPreview({ name }: { name: string }) {
  const [start, setStart] = useState<string | null>('09:30')

  if (name === 'twelveHour') {
    return (
      <Stack gap={3}>
        <Field
          help="Shown as 12-hour with AM/PM, reported as 24-hour: the display is presentation, the value is data."
          label="Kick-off"
        >
          <TimePicker defaultValue="14:30" hourCycle={12} name="kickoff" withSeconds />
        </Field>
        <Text size="sm" tone="muted">
          Type digits to fill a segment, arrows to step, A or P for the period. Home and End jump to
          the first and last segment.
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap={3}>
      <Field help="Office hours only — a typed 08:00 clamps to 09:00 on commit." label="Start">
        <TimePicker max="17:30" min="09:00" name="start" onValueChange={setStart} value={start} />
      </Field>
      <Text size="sm" tone="muted">
        {start
          ? `The form receives start=${start}.`
          : 'Incomplete — the value is null, never a guess.'}
      </Text>
    </Stack>
  )
}
