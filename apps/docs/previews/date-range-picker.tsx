'use client'

import { DateRangePicker, Field, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/*
 * Fixed dates, never `new Date()`: the preview is server-rendered and hydrated, and a clock
 * read during render gives the two passes different markup. It also keeps the screenshot in
 * the docs stable from one visit to the next.
 */
const at = (day: number) => new Date(2026, 2, day)

interface Range {
  start: Date | null
  end: Date | null
}

const nights = (range: Range | null) =>
  range?.start && range.end
    ? Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000)
    : null

export default function DateRangePickerPreview({ name }: { name: string }) {
  const [stay, setStay] = useState<Range | null>({ start: at(12), end: at(15) })

  if (name === 'bounded') {
    return (
      <Field
        help="Only March 2026, and never a weekend — the calendar refuses those days rather than accepting and rejecting later."
        label="Workshop dates"
      >
        <DateRangePicker
          defaultValue={null}
          disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
          max={at(31)}
          min={at(1)}
          name="workshop"
        />
      </Field>
    )
  }

  return (
    <Stack gap={3}>
      <Field label="Stay">
        <DateRangePicker name="stay" onValueChange={setStay} value={stay} />
      </Field>
      <Text size="sm" tone="muted">
        {nights(stay) !== null
          ? `${nights(stay)} night${nights(stay) === 1 ? '' : 's'} — the form receives stay-start and stay-end as ISO dates.`
          : stay?.start
            ? 'Pick the end date. Escape now would restore the previous complete range.'
            : 'No dates yet.'}
      </Text>
    </Stack>
  )
}
