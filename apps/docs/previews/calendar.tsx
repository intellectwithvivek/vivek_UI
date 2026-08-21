'use client'

// A predicate or validator prop is a function, and a function cannot cross from a
// Server Component into a Client Component. This preview therefore has to be a client
// component itself - the same constraint applies in any app that uses these props.
import { Calendar } from '@the_viveksingh/vivek-ui'

const MONTH = new Date(2026, 7, 1)

export default function CalendarPreview({ name }: { name: string }) {
  if (name === 'range') {
    return (
      <Calendar
        mode="range"
        defaultMonth={MONTH}
        defaultValue={{ start: new Date(2026, 7, 12), end: new Date(2026, 7, 19) }}
      />
    )
  }
  if (name === 'bounded') {
    return (
      <Calendar
        defaultMonth={MONTH}
        min={new Date(2026, 7, 10)}
        max={new Date(2026, 7, 28)}
        disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
        weekStartsOn={1}
      />
    )
  }
  return <Calendar defaultMonth={MONTH} defaultValue={new Date(2026, 7, 21)} />
}
