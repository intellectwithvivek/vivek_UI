'use client'

import {
  Badge,
  Scheduler,
  type SchedulerEvent,
  type SchedulerResource,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/**
 * A fixed date, not `new Date()`.
 *
 * The preview is server-rendered and then hydrated; a clock read during render gives the two
 * passes different markup, which React reports as a hydration mismatch. It also makes the
 * screenshot in the docs change every time someone loads the page.
 */
const at = (hour: number, minute = 0) => new Date(2026, 2, 12, hour, minute)

const RESOURCES: SchedulerResource[] = [
  { id: 'studio-a', label: 'Studio A', sublabel: 'Ground floor · 12 seats' },
  { id: 'studio-b', label: 'Studio B', sublabel: 'First floor · 6 seats' },
  { id: 'edit-1', label: 'Edit suite 1', sublabel: 'Colour grade' },
  { id: 'edit-2', label: 'Edit suite 2' },
]

const EVENTS: SchedulerEvent[] = [
  { id: '1', resourceId: 'studio-a', title: 'Standup', start: at(9), end: at(9, 30) },
  {
    id: '2',
    resourceId: 'studio-a',
    title: 'Podcast · episode 41',
    start: at(10),
    end: at(12, 30),
    tone: 'accent',
  },
  // Deliberately overlapping the podcast: the board stacks them into lanes rather than
  // drawing one on top of the other, so the double-booking is visible.
  { id: '3', resourceId: 'studio-a', title: 'Mic check', start: at(11, 30), end: at(12) },
  { id: '4', resourceId: 'studio-a', title: 'Client call', start: at(14), end: at(15) },
  {
    id: '5',
    resourceId: 'studio-b',
    title: 'Voiceover',
    start: at(9, 30),
    end: at(11),
    tone: 'success',
  },
  {
    id: '6',
    resourceId: 'studio-b',
    title: 'Maintenance',
    start: at(13),
    end: at(16),
    tone: 'warning',
  },
  { id: '7', resourceId: 'edit-1', title: 'Grade · trailer', start: at(9), end: at(13) },
  { id: '8', resourceId: 'edit-1', title: 'Grade · spot', start: at(13, 30), end: at(17) },
]

export default function SchedulerPreview() {
  const [selected, setSelected] = useState<SchedulerEvent | null>(null)

  return (
    <Stack gap={3}>
      <Text size="sm" tone="muted">
        Tab into the board and use the arrow keys: left and right walk this resource in time order,
        up and down jump to the nearest booking on the resource above or below. Every booking
        carries its resource, its times and its duration in its accessible name, because a timeline
        says all of that through position alone.
      </Text>

      <Scheduler
        end={at(18)}
        events={EVENTS}
        label="Studio bookings, 12 March"
        now={at(13, 20)}
        onEventSelect={setSelected}
        resources={RESOURCES}
        start={at(9)}
      />

      <Text size="sm" tone="muted">
        {selected ? (
          <>
            Selected <Badge variant="soft">{selected.title}</Badge> — the board reports the
            selection and never changes it.
          </>
        ) : (
          'Nothing selected yet. Click or press Enter on a booking.'
        )}
      </Text>
    </Stack>
  )
}
