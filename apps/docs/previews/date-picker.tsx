'use client'

// A predicate or validator prop is a function, and a function cannot cross from a
// Server Component into a Client Component. This preview therefore has to be a client
// component itself - the same constraint applies in any app that uses these props.
import { DatePicker, Field, Stack } from '@the_viveksingh/vivek-ui'

export default function DatePickerPreview({ name }: { name: string }) {
  if (name === 'bounded') {
    return (
      <Field label="Delivery date" help="Weekends are unavailable.">
        <DatePicker
          defaultValue={new Date(2026, 7, 24)}
          min={new Date(2026, 7, 21)}
          max={new Date(2026, 8, 30)}
          disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
          weekStartsOn={1}
        />
      </Field>
    )
  }
  return (
    <Stack gap={3}>
      <DatePicker defaultValue={new Date(2026, 7, 21)} aria-label="Start date" />
      <DatePicker size="sm" placeholder="dd/mm/yyyy" aria-label="End date" />
      <DatePicker invalid defaultValue={new Date(2026, 7, 21)} aria-label="Invalid date" />
    </Stack>
  )
}
