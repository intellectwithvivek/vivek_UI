import { fireEvent, render, screen, within } from '@testing-library/react'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Calendar } from './calendar'
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  daysInMonth,
  getMonthGrid,
  getWeekdayNames,
  isDateDisabled,
  nextRange,
  parseISODate,
  startOfWeek,
  toISODate,
  type WeekStart,
} from './calendar/date-utils'
import { Combobox, type ComboboxOption } from './combobox'
import { DatePicker } from './date-picker'
import { Field } from './field'
import { FileUpload, formatBytes, matchesAccept } from './file-upload'
import { OTPInput } from './otp-input'
import { PasswordInput } from './password-input'
import { Rating } from './rating'
import { Slider } from './slider'
import { TagInput } from './tag-input'

/*
 * `region` is disabled throughout: every case here renders a bare control with no
 * landmark, which is a property of the test harness rather than of the component.
 */
const AXE_OPTIONS = { rules: { region: { enabled: false } } }

/** A helper the whole file uses: what does the browser think has focus? */
function active(): Element | null {
  return document.activeElement
}

// ---------------------------------------------------------------------------
// date-utils - the arithmetic every date component leans on
// ---------------------------------------------------------------------------

describe('date-utils', () => {
  it('knows how many days a month has, including leap Februaries', () => {
    expect(daysInMonth(2024, 1)).toBe(29)
    expect(daysInMonth(2023, 1)).toBe(28)
    // 1900 is the century rule everyone forgets: divisible by 100, not by 400.
    expect(daysInMonth(1900, 1)).toBe(28)
    expect(daysInMonth(2000, 1)).toBe(29)
    expect(daysInMonth(2024, 0)).toBe(31)
    expect(daysInMonth(2024, 3)).toBe(30)
  })

  it('crosses month and year boundaries by day', () => {
    expect(toISODate(addDays(new Date(2024, 0, 31), 1))).toBe('2024-02-01')
    expect(toISODate(addDays(new Date(2024, 11, 31), 1))).toBe('2025-01-01')
    expect(toISODate(addDays(new Date(2024, 0, 1), -1))).toBe('2023-12-31')
    expect(toISODate(addDays(new Date(2024, 1, 28), 1))).toBe('2024-02-29')
    expect(toISODate(addDays(new Date(2023, 1, 28), 1))).toBe('2023-03-01')
  })

  it('clamps the day when adding months instead of overflowing', () => {
    // The `setMonth` bug: 31 Jan + 1 month must not become 2 or 3 March.
    expect(toISODate(addMonths(new Date(2024, 0, 31), 1))).toBe('2024-02-29')
    expect(toISODate(addMonths(new Date(2023, 0, 31), 1))).toBe('2023-02-28')
    expect(toISODate(addMonths(new Date(2024, 4, 31), 1))).toBe('2024-06-30')
    expect(toISODate(addMonths(new Date(2024, 0, 15), -1))).toBe('2023-12-15')
    expect(toISODate(addMonths(new Date(2024, 0, 15), -13))).toBe('2022-12-15')
  })

  it('clamps 29 February when adding years', () => {
    expect(toISODate(addYears(new Date(2024, 1, 29), 1))).toBe('2025-02-28')
    expect(toISODate(addYears(new Date(2024, 1, 29), 4))).toBe('2028-02-29')
    expect(toISODate(addYears(new Date(2024, 1, 29), -1))).toBe('2023-02-28')
  })

  /*
   * The DST guarantee, stated as a property rather than as a list of transition dates:
   * over a whole leap year in whatever zone the test runs in, adding one day must always
   * advance the calendar date by exactly one. A millisecond-based implementation fails
   * this on both transition days in any zone that observes DST.
   */
  it('advances exactly one calendar day across every day of a year, DST included', () => {
    let cursor = new Date(2024, 0, 1)
    const seen: string[] = []
    for (let step = 0; step < 366; step += 1) {
      seen.push(toISODate(cursor))
      const next = addDays(cursor, 1)
      const expectedDay =
        cursor.getDate() === daysInMonth(cursor.getFullYear(), cursor.getMonth())
          ? 1
          : cursor.getDate() + 1
      expect(next.getDate()).toBe(expectedDay)
      expect(next.getHours()).toBe(0)
      cursor = next
    }
    expect(new Set(seen).size).toBe(366)
    expect(seen).toContain('2024-02-29')
    // The four transition dates that matter most in practice: US spring/autumn and
    // EU spring/autumn. Each must appear exactly once in a continuous day walk.
    for (const iso of ['2024-03-10', '2024-11-03', '2024-03-31', '2024-10-27']) {
      expect(seen.filter((day) => day === iso)).toHaveLength(1)
    }
  })

  it('starts the week on the requested day, for all seven values', () => {
    // 15 August 2024 was a Thursday.
    const thursday = new Date(2024, 7, 15)
    const expected: Record<number, string> = {
      0: '2024-08-11',
      1: '2024-08-12',
      2: '2024-08-13',
      3: '2024-08-14',
      4: '2024-08-15',
      5: '2024-08-09',
      6: '2024-08-10',
    }
    for (let start = 0; start <= 6; start += 1) {
      expect(toISODate(startOfWeek(thursday, start as WeekStart))).toBe(expected[start])
    }
  })

  it('builds whole-week grids that always start on the requested weekday', () => {
    for (let start = 0; start <= 6; start += 1) {
      const grid = getMonthGrid(2024, 1, start as WeekStart)
      for (const week of grid) {
        expect(week).toHaveLength(7)
        expect(week[0]?.getDay()).toBe(start)
      }
      const days = grid.flat().filter((day) => day.getMonth() === 1)
      expect(days).toHaveLength(29)
    }
  })

  it('uses the minimum number of weeks that covers the month', () => {
    // February 2021 was 28 days starting on a Monday: exactly four weeks, week start 1.
    expect(getMonthGrid(2021, 1, 1)).toHaveLength(4)
    // September 2024 was 30 days starting on a Sunday: with a Monday week start that
    // needs six rows.
    expect(getMonthGrid(2024, 8, 1)).toHaveLength(6)
  })

  it('rotates the weekday headers with the week start', () => {
    const sundayFirst = getWeekdayNames(0, 'en-US', 'long')
    const mondayFirst = getWeekdayNames(1, 'en-US', 'long')
    expect(sundayFirst[0]).toBe('Sunday')
    expect(mondayFirst[0]).toBe('Monday')
    expect(mondayFirst[6]).toBe('Sunday')
  })

  it('clamps to min and max by day', () => {
    const min = new Date(2024, 0, 10)
    const max = new Date(2024, 0, 20)
    expect(toISODate(clampDate(new Date(2024, 0, 1), min, max))).toBe('2024-01-10')
    expect(toISODate(clampDate(new Date(2024, 0, 25), min, max))).toBe('2024-01-20')
    expect(toISODate(clampDate(new Date(2024, 0, 15), min, max))).toBe('2024-01-15')
  })

  it('treats min and max as inclusive and accepts a predicate', () => {
    const bounds = { min: new Date(2024, 0, 10), max: new Date(2024, 0, 20) }
    expect(isDateDisabled(new Date(2024, 0, 10), bounds)).toBe(false)
    expect(isDateDisabled(new Date(2024, 0, 20), bounds)).toBe(false)
    expect(isDateDisabled(new Date(2024, 0, 9), bounds)).toBe(true)
    expect(isDateDisabled(new Date(2024, 0, 21), bounds)).toBe(true)
    const weekends = (date: Date) => date.getDay() === 0 || date.getDay() === 6
    expect(isDateDisabled(new Date(2024, 7, 17), { disabledDates: weekends })).toBe(true)
    expect(isDateDisabled(new Date(2024, 7, 15), { disabledDates: weekends })).toBe(false)
    expect(isDateDisabled(new Date(2024, 7, 15), { disabledDates: [new Date(2024, 7, 15)] })).toBe(
      true,
    )
  })

  it('parses only real ISO dates, in local time', () => {
    expect(toISODate(parseISODate('2024-02-29') as Date)).toBe('2024-02-29')
    expect(toISODate(parseISODate('2024/2/9') as Date)).toBe('2024-02-09')
    // The day the string claims does not exist, so it is rejected rather than rolled.
    expect(parseISODate('2023-02-29')).toBeNull()
    expect(parseISODate('2024-02-31')).toBeNull()
    expect(parseISODate('2024-13-01')).toBeNull()
    expect(parseISODate('not a date')).toBeNull()
    expect(parseISODate('')).toBeNull()
    // Local, not UTC: the round trip must be lossless in every timezone.
    const parsed = parseISODate('2024-01-01') as Date
    expect(parsed.getHours()).toBe(0)
    expect(parsed.getDate()).toBe(1)
  })

  it('swaps a range when the end is picked before the start', () => {
    const first = nextRange(null, new Date(2024, 0, 20))
    expect(toISODate(first.start as Date)).toBe('2024-01-20')
    expect(first.end).toBeNull()

    const swapped = nextRange(first, new Date(2024, 0, 10))
    expect(toISODate(swapped.start as Date)).toBe('2024-01-10')
    expect(toISODate(swapped.end as Date)).toBe('2024-01-20')

    // A third click starts over rather than extending a finished range.
    const restarted = nextRange(swapped, new Date(2024, 0, 15))
    expect(toISODate(restarted.start as Date)).toBe('2024-01-15')
    expect(restarted.end).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------

describe('Slider', () => {
  it('renders with zero props', () => {
    render(<Slider aria-label="Volume" />)
    const input = screen.getByRole('slider', { name: 'Volume' })
    expect(input).toHaveValue('0')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('works uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<Slider aria-label="Volume" defaultValue={20} onValueChange={onValueChange} />)
    const input = screen.getByRole('slider')
    expect(input).toHaveValue('20')
    fireEvent.change(input, { target: { value: '60' } })
    expect(onValueChange).toHaveBeenCalledWith(60)
    expect(input).toHaveValue('60')
  })

  it('works controlled - the prop is the only source of truth', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Slider aria-label="Volume" value={30} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('slider')
    fireEvent.change(input, { target: { value: '80' } })
    expect(onValueChange).toHaveBeenCalledWith(80)
    // Not moved, because the parent has not said so yet.
    expect(input).toHaveValue('30')
    rerender(<Slider aria-label="Volume" value={80} onValueChange={onValueChange} />)
    expect(input).toHaveValue('80')
  })

  it('clamps a value outside min and max', () => {
    render(<Slider aria-label="Volume" min={10} max={20} value={99} />)
    expect(screen.getByRole('slider')).toHaveValue('20')
  })

  it('shows the value and hides it from assistive tech', () => {
    render(<Slider aria-label="Volume" defaultValue={42} showValue />)
    // `aria-valuenow` already announces the number; the visible copy must not double it.
    const output = screen.getByText('42')
    expect(output).toHaveAttribute('aria-hidden', 'true')
  })

  it('formats the value for display and for aria-valuetext', () => {
    render(
      <Slider
        aria-label="Price"
        defaultValue={50}
        showValue
        formatValue={(value) => `$${value}`}
      />,
    )
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '$50')
  })

  it('renders marks and caps the automatic form', () => {
    const { container, rerender } = render(
      <Slider
        aria-label="Size"
        marks={[
          { value: 0, label: 'S' },
          { value: 100, label: 'L' },
        ]}
      />,
    )
    expect(container.querySelectorAll('.vk-slider__mark')).toHaveLength(2)
    expect(screen.getByText('S')).toBeInTheDocument()

    rerender(<Slider aria-label="Size" marks max={5} step={1} />)
    expect(container.querySelectorAll('.vk-slider__mark')).toHaveLength(6)

    // 101 ticks would be a solid bar, so the automatic form declines.
    rerender(<Slider aria-label="Size" marks max={100} step={1} />)
    expect(container.querySelectorAll('.vk-slider__mark')).toHaveLength(0)
  })

  it('maps variants onto data attributes', () => {
    const { container } = render(<Slider aria-label="Volume" size="lg" tone="danger" />)
    const root = container.querySelector('.vk-slider')
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-tone', 'danger')
  })

  it('merges className and forwards rest props', () => {
    const { container } = render(<Slider aria-label="Volume" className="mine" data-testid="s" />)
    const root = container.querySelector('.vk-slider')
    expect(root?.className).toBe('vk-slider mine')
    expect(root).toHaveAttribute('data-testid', 's')
  })

  it('participates in form submission', () => {
    render(
      <form>
        <Slider aria-label="Volume" name="volume" defaultValue={7} />
      </form>,
    )
    expect(screen.getByRole('slider')).toHaveAttribute('name', 'volume')
  })

  describe('range mode', () => {
    it('renders two labelled thumbs', () => {
      render(<Slider range aria-label="Price" defaultValue={[10, 90]} />)
      expect(screen.getByRole('slider', { name: 'Price minimum' })).toHaveValue('10')
      expect(screen.getByRole('slider', { name: 'Price maximum' })).toHaveValue('90')
    })

    it('falls back to Minimum and Maximum with no group label', () => {
      render(<Slider range defaultValue={[0, 10]} max={10} />)
      expect(screen.getByRole('slider', { name: 'Minimum' })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: 'Maximum' })).toBeInTheDocument()
    })

    it('never lets the lower thumb cross the upper one', () => {
      const onValueChange = vi.fn()
      render(
        <Slider range aria-label="Price" defaultValue={[10, 50]} onValueChange={onValueChange} />,
      )
      const lower = screen.getByRole('slider', { name: 'Price minimum' })
      fireEvent.change(lower, { target: { value: '90' } })
      expect(onValueChange).toHaveBeenLastCalledWith([50, 50])
      expect(lower).toHaveValue('50')
    })

    it('never lets the upper thumb cross the lower one', () => {
      const onValueChange = vi.fn()
      render(
        <Slider range aria-label="Price" defaultValue={[40, 80]} onValueChange={onValueChange} />,
      )
      const upper = screen.getByRole('slider', { name: 'Price maximum' })
      fireEvent.change(upper, { target: { value: '5' } })
      expect(onValueChange).toHaveBeenLastCalledWith([40, 40])
    })

    it('tolerates an inverted pair from outside', () => {
      render(<Slider range aria-label="Price" value={[80, 20]} />)
      expect(screen.getByRole('slider', { name: 'Price minimum' })).toHaveValue('20')
      expect(screen.getByRole('slider', { name: 'Price maximum' })).toHaveValue('80')
    })

    it('submits both thumbs under one name', () => {
      render(<Slider range name="price" aria-label="Price" defaultValue={[1, 2]} max={10} />)
      const thumbs = screen.getAllByRole('slider')
      expect(thumbs).toHaveLength(2)
      for (const thumb of thumbs) expect(thumb).toHaveAttribute('name', 'price')
    })
  })

  it('works inside Field', () => {
    render(
      <Field label="Volume" help="Louder is not always better">
        <Slider defaultValue={5} max={10} />
      </Field>,
    )
    const input = screen.getByRole('slider', { name: 'Volume' })
    expect(input).toHaveAccessibleDescription('Louder is not always better')
  })

  it('has no axe violations, including invalid and disabled', async () => {
    render(
      <>
        <Slider aria-label="One" defaultValue={5} max={10} showValue />
        <Slider aria-label="Two" invalid defaultValue={5} max={10} />
        <Slider aria-label="Three" disabled defaultValue={5} max={10} />
        <Slider range aria-label="Four" defaultValue={[2, 8]} max={10} />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// PasswordInput
// ---------------------------------------------------------------------------

describe('PasswordInput', () => {
  it('renders a masked field with zero props', () => {
    const { container } = render(<PasswordInput aria-label="Password" />)
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('autocomplete', 'current-password')
  })

  it('toggles visibility through a real button with aria-pressed', () => {
    const { container } = render(<PasswordInput aria-label="Password" />)
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).toHaveAttribute('type', 'button')

    fireEvent.click(toggle)
    const pressed = screen.getByRole('button', { name: 'Hide password' })
    expect(pressed).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('input')).toHaveAttribute('type', 'text')

    fireEvent.click(pressed)
    expect(container.querySelector('input')).toHaveAttribute('type', 'password')
  })

  it('supports a controlled reveal state', () => {
    const onVisibleChange = vi.fn()
    const { container, rerender } = render(
      <PasswordInput aria-label="Password" visible={false} onVisibleChange={onVisibleChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(container.querySelector('input')).toHaveAttribute('type', 'password')
    rerender(<PasswordInput aria-label="Password" visible onVisibleChange={onVisibleChange} />)
    expect(container.querySelector('input')).toHaveAttribute('type', 'text')
  })

  it('works uncontrolled', () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <PasswordInput aria-label="Password" defaultValue="abc" onValueChange={onValueChange} />,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('abc')
    fireEvent.change(input, { target: { value: 'abcd' } })
    expect(onValueChange).toHaveBeenCalledWith('abcd')
    expect(input.value).toBe('abcd')
  })

  it('works controlled', () => {
    const onValueChange = vi.fn()
    const { container, rerender } = render(
      <PasswordInput aria-label="Password" value="one" onValueChange={onValueChange} />,
    )
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'two' } })
    expect(onValueChange).toHaveBeenCalledWith('two')
    expect(input.value).toBe('one')
    rerender(<PasswordInput aria-label="Password" value="two" onValueChange={onValueChange} />)
    expect(input.value).toBe('two')
  })

  it('also calls a native onChange', () => {
    const onChange = vi.fn()
    const { container } = render(<PasswordInput aria-label="Password" onChange={onChange} />)
    fireEvent.change(container.querySelector('input') as HTMLInputElement, {
      target: { value: 'x' },
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('scores strength from the built-in rules', () => {
    const { container, rerender } = render(
      <PasswordInput aria-label="Password" strength value="" />,
    )
    const meter = () => container.querySelector('.vk-password__meter')
    expect(meter()).toHaveAttribute('data-level', '0')

    rerender(<PasswordInput aria-label="Password" strength value="abc" />)
    expect(meter()).toHaveAttribute('data-level', '1')

    rerender(<PasswordInput aria-label="Password" strength value="Abcdefg1!" />)
    expect(meter()).toHaveAttribute('data-level', '4')
    expect(screen.getByText(/Password strength: Strong/)).toBeInTheDocument()
  })

  it('lists custom rules and announces each as met or unmet', () => {
    render(
      <PasswordInput
        aria-label="Password"
        strength
        value="abc"
        rules={[
          { id: 'len', label: 'Eight characters', test: (value) => value.length >= 8 },
          { id: 'num', label: 'A number', test: (value) => /\d/.test(value) },
        ]}
      />,
    )
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Eight characters — not met')
    expect(items[1]).toHaveTextContent('A number — not met')
  })

  it('marks a satisfied rule as met', () => {
    render(
      <PasswordInput
        aria-label="Password"
        strength
        value="abc123"
        rules={[{ id: 'num', label: 'A number', test: (value) => /\d/.test(value) }]}
      />,
    )
    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('A number — met')
    expect(item).toHaveAttribute('data-met')
  })

  it('never writes the value into an attribute or any other element', () => {
    const secret = 'Sup3rSecret!'
    const { container } = render(
      <PasswordInput
        aria-label="Password"
        strength
        value={secret}
        rules={[{ id: 'len', label: 'Long enough', test: (value) => value.length > 4 }]}
      />,
    )
    const input = container.querySelector('input') as HTMLInputElement
    // The input's own `value` property is the value; that is the point of the component.
    expect(input.value).toBe(secret)
    // Nothing else may carry it: not an attribute, not text content. The input is
    // excluded because React reflects a controlled `value` onto it - that is the control
    // holding its own value, not the component leaking it sideways.
    for (const element of Array.from(container.querySelectorAll('*'))) {
      if (element === input) continue
      for (const attribute of Array.from(element.attributes)) {
        expect(attribute.value).not.toContain(secret)
      }
    }
    expect(container.textContent ?? '').not.toContain(secret)
  })

  it('forwards its ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<PasswordInput aria-label="Password" ref={ref} />)
    expect(ref.current?.tagName).toBe('INPUT')
    expect(ref.current).toHaveAttribute('type', 'password')
  })

  it('works inside Field', () => {
    render(
      <Field label="Password" error="Too short" required>
        <PasswordInput />
      </Field>,
    )
    const input = screen.getByLabelText(/Password/)
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Too short')
  })

  it('has no axe violations, including invalid and disabled', async () => {
    render(
      <>
        <PasswordInput aria-label="One" strength defaultValue="Abcdefg1!" />
        <PasswordInput
          aria-label="Two"
          invalid
          strength
          defaultValue="abc"
          rules={[{ label: 'A number', test: (value) => /\d/.test(value) }]}
        />
        <PasswordInput aria-label="Three" disabled />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// OTPInput
// ---------------------------------------------------------------------------

function otpBoxes(): HTMLInputElement[] {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

describe('OTPInput', () => {
  it('renders six numeric boxes with positional labels', () => {
    render(<OTPInput aria-label="Verification code" />)
    const boxes = otpBoxes()
    expect(boxes).toHaveLength(6)
    expect(boxes[0]).toHaveAccessibleName('Digit 1 of 6')
    expect(boxes[5]).toHaveAccessibleName('Digit 6 of 6')
    expect(boxes[0]).toHaveAttribute('inputmode', 'numeric')
    expect(boxes[0]).toHaveAttribute('autocomplete', 'one-time-code')
    // Only the first box advertises the code, so the platform offers it once.
    expect(boxes[1]).toHaveAttribute('autocomplete', 'off')
  })

  it('labels alphanumeric boxes as characters', () => {
    render(<OTPInput aria-label="Code" type="alphanumeric" length={4} />)
    const boxes = otpBoxes()
    expect(boxes[0]).toHaveAccessibleName('Character 1 of 4')
    expect(boxes[0]).toHaveAttribute('inputmode', 'text')
  })

  it('works uncontrolled and advances as it fills', () => {
    const onChange = vi.fn()
    render(<OTPInput aria-label="Code" length={4} onChange={onChange} />)
    const boxes = otpBoxes()
    fireEvent.change(boxes[0] as HTMLInputElement, { target: { value: '1' } })
    expect(onChange).toHaveBeenLastCalledWith('1')
    expect(active()).toBe(boxes[1])
    fireEvent.change(boxes[1] as HTMLInputElement, { target: { value: '2' } })
    expect(onChange).toHaveBeenLastCalledWith('12')
    expect(boxes[0]).toHaveValue('1')
    expect(boxes[1]).toHaveValue('2')
  })

  it('works controlled', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <OTPInput aria-label="Code" length={4} value="12" onChange={onChange} />,
    )
    const boxes = otpBoxes()
    expect(boxes[0]).toHaveValue('1')
    expect(boxes[2]).toHaveValue('')
    fireEvent.change(boxes[2] as HTMLInputElement, { target: { value: '3' } })
    expect(onChange).toHaveBeenCalledWith('123')
    expect(boxes[2]).toHaveValue('')
    rerender(<OTPInput aria-label="Code" length={4} value="123" onChange={onChange} />)
    expect(boxes[2]).toHaveValue('3')
  })

  it('drops characters the type does not accept', () => {
    const onChange = vi.fn()
    render(<OTPInput aria-label="Code" length={4} onChange={onChange} />)
    fireEvent.change(otpBoxes()[0] as HTMLInputElement, { target: { value: 'a' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('accepts letters when alphanumeric', () => {
    const onChange = vi.fn()
    render(<OTPInput aria-label="Code" type="alphanumeric" length={4} onChange={onChange} />)
    fireEvent.change(otpBoxes()[0] as HTMLInputElement, { target: { value: 'a' } })
    expect(onChange).toHaveBeenLastCalledWith('a')
  })

  it('distributes a pasted code across the boxes', () => {
    const onChange = vi.fn()
    const onComplete = vi.fn()
    render(<OTPInput aria-label="Code" onChange={onChange} onComplete={onComplete} />)
    const boxes = otpBoxes()
    fireEvent.paste(boxes[0] as HTMLInputElement, {
      clipboardData: { getData: () => '123456' },
    })
    expect(onChange).toHaveBeenLastCalledWith('123456')
    expect(boxes.map((box) => box.value)).toEqual(['1', '2', '3', '4', '5', '6'])
    expect(active()).toBe(boxes[5])
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('strips separators and extra characters out of a paste', () => {
    const onChange = vi.fn()
    render(<OTPInput aria-label="Code" onChange={onChange} />)
    fireEvent.paste(otpBoxes()[0] as HTMLInputElement, {
      clipboardData: { getData: () => 'Code: 12-34 56 789' },
    })
    // Sanitised to digits, then truncated to the field's length.
    expect(onChange).toHaveBeenLastCalledWith('123456')
  })

  it('replaces the whole field when the paste is a full code, wherever the caret is', () => {
    const onChange = vi.fn()
    render(<OTPInput aria-label="Code" length={4} defaultValue="99" onChange={onChange} />)
    const boxes = otpBoxes()
    fireEvent.paste(boxes[2] as HTMLInputElement, {
      clipboardData: { getData: () => '1234' },
    })
    expect(onChange).toHaveBeenLastCalledWith('1234')
  })

  it('distributes a multi-character value change, as autofill delivers it', () => {
    const onChange = vi.fn()
    render(<OTPInput aria-label="Code" onChange={onChange} />)
    fireEvent.change(otpBoxes()[0] as HTMLInputElement, { target: { value: '246810' } })
    expect(onChange).toHaveBeenLastCalledWith('246810')
  })

  describe('keyboard', () => {
    it('Backspace removes the character under the caret', () => {
      const onChange = vi.fn()
      render(<OTPInput aria-label="Code" length={4} defaultValue="1234" onChange={onChange} />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[1] as HTMLInputElement, { key: 'Backspace' })
      expect(onChange).toHaveBeenLastCalledWith('134')
    })

    it('Backspace on an empty box steps back and deletes there', () => {
      const onChange = vi.fn()
      render(<OTPInput aria-label="Code" length={4} defaultValue="12" onChange={onChange} />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[2] as HTMLInputElement, { key: 'Backspace' })
      expect(onChange).toHaveBeenLastCalledWith('1')
      expect(active()).toBe(boxes[1])
    })

    it('Delete removes forward without moving', () => {
      const onChange = vi.fn()
      render(<OTPInput aria-label="Code" length={4} defaultValue="1234" onChange={onChange} />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[0] as HTMLInputElement, { key: 'Delete' })
      expect(onChange).toHaveBeenLastCalledWith('234')
      expect(active()).toBe(boxes[0])
    })

    it('arrows move between boxes', () => {
      render(<OTPInput aria-label="Code" length={4} defaultValue="1234" />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[2] as HTMLInputElement, { key: 'ArrowLeft' })
      expect(active()).toBe(boxes[1])
      fireEvent.keyDown(boxes[1] as HTMLInputElement, { key: 'ArrowRight' })
      expect(active()).toBe(boxes[2])
    })

    it('ArrowLeft on the first box stays put', () => {
      render(<OTPInput aria-label="Code" length={4} defaultValue="1" />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[0] as HTMLInputElement, { key: 'ArrowLeft' })
      expect(active()).toBe(boxes[0])
    })

    it('Home and End jump to the first box and the last filled position', () => {
      render(<OTPInput aria-label="Code" length={6} defaultValue="12" />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[1] as HTMLInputElement, { key: 'End' })
      // The first empty box, not box six: focus never goes past the end of the value.
      expect(active()).toBe(boxes[2])
      fireEvent.keyDown(boxes[2] as HTMLInputElement, { key: 'Home' })
      expect(active()).toBe(boxes[0])
    })

    it('End goes to the last box once the code is full', () => {
      render(<OTPInput aria-label="Code" length={4} defaultValue="1234" />)
      const boxes = otpBoxes()
      fireEvent.keyDown(boxes[0] as HTMLInputElement, { key: 'End' })
      expect(active()).toBe(boxes[3])
    })
  })

  it('pulls focus back to the first empty box', () => {
    render(<OTPInput aria-label="Code" length={6} defaultValue="12" />)
    const boxes = otpBoxes()
    ;(boxes[5] as HTMLInputElement).focus()
    // Focusing box six of an empty tail would let the value grow a hole.
    expect(active()).toBe(boxes[2])
  })

  it('masks the characters when asked', () => {
    const { container } = render(<OTPInput aria-label="Code" mask length={2} />)
    const inputs = container.querySelectorAll('input.vk-otp__box')
    expect(inputs).toHaveLength(2)
    for (const input of Array.from(inputs)) expect(input).toHaveAttribute('type', 'password')
  })

  it('submits the whole code as one hidden field', () => {
    const { container } = render(
      <OTPInput aria-label="Code" name="code" length={4} defaultValue="1234" />,
    )
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden).toHaveAttribute('name', 'code')
    expect(hidden.value).toBe('1234')
  })

  it('forwards its ref to the first box', () => {
    const ref = createRef<HTMLInputElement>()
    render(<OTPInput aria-label="Code" ref={ref} length={3} />)
    expect(ref.current).toBe(otpBoxes()[0])
  })

  it('works inside Field', () => {
    render(
      <Field label="Code" help="Six digits from your text message">
        <OTPInput length={6} />
      </Field>,
    )
    // The group carries the description; the boxes keep their positional names.
    const group = screen.getByRole('group')
    expect(group).toHaveAccessibleDescription('Six digits from your text message')
    expect(otpBoxes()[0]).toHaveAccessibleName('Digit 1 of 6')
  })

  it('has no axe violations, including invalid and disabled', async () => {
    render(
      <>
        <OTPInput aria-label="One" length={4} defaultValue="12" />
        <OTPInput aria-label="Two" length={4} invalid />
        <OTPInput aria-label="Three" length={4} disabled />
        <OTPInput aria-label="Four" length={4} mask type="alphanumeric" />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------

describe('Rating', () => {
  it('renders five radios plus a clear option with zero props', () => {
    render(<Rating />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(6)
    expect(screen.getByRole('radio', { name: 'No rating' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '5 of 5' })).toBeInTheDocument()
  })

  it('works uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<Rating label="Quality" defaultValue={2} onValueChange={onValueChange} />)
    expect(screen.getByRole('radio', { name: '2 of 5' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: '4 of 5' }))
    expect(onValueChange).toHaveBeenCalledWith(4)
    expect(screen.getByRole('radio', { name: '4 of 5' })).toBeChecked()
  })

  it('works controlled', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<Rating label="Quality" value={1} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '3 of 5' }))
    expect(onValueChange).toHaveBeenCalledWith(3)
    expect(screen.getByRole('radio', { name: '1 of 5' })).toBeChecked()
    rerender(<Rating label="Quality" value={3} onValueChange={onValueChange} />)
    expect(screen.getByRole('radio', { name: '3 of 5' })).toBeChecked()
  })

  it('doubles the options when half steps are allowed', () => {
    render(<Rating label="Quality" allowHalf max={5} />)
    // Ten steps plus the clear option.
    expect(screen.getAllByRole('radio')).toHaveLength(11)
    expect(screen.getByRole('radio', { name: '2.5 of 5' })).toBeInTheDocument()
  })

  it('honours max', () => {
    render(<Rating label="Quality" max={3} />)
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('radio', { name: '3 of 3' })).toBeInTheDocument()
  })

  it('renders a fill percentage for a fractional value', () => {
    const { container } = render(<Rating label="Average" value={3.5} readOnly />)
    const control = container.querySelector('.vk-rating__control') as HTMLElement
    expect(control.style.getPropertyValue('--vk-rating-fill')).toBe('70%')
  })

  it('renders read-only as a single labelled image, with no radios', () => {
    render(<Rating label="Score" value={4} readOnly />)
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
    expect(screen.getByRole('img', { name: '4 of 5' })).toBeInTheDocument()
  })

  it('drops the clear option when required', () => {
    render(<Rating label="Quality" required />)
    expect(screen.queryByRole('radio', { name: 'No rating' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('accepts a custom icon', () => {
    render(<Rating label="Hearts" max={2} icon={<span data-testid="heart">x</span>} />)
    // Two layers of icons, so the glyph appears twice per position.
    expect(screen.getAllByTestId('heart')).toHaveLength(4)
  })

  it('groups the radios under one name and submits', () => {
    render(<Rating label="Quality" name="stars" defaultValue={3} />)
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('name', 'stars')
    }
  })

  it('disables every radio through the fieldset', () => {
    render(<Rating label="Quality" disabled />)
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
  })

  it('has no axe violations, including invalid, disabled and read-only', async () => {
    render(
      <>
        <Rating label="One" defaultValue={3} />
        <Rating label="Two" invalid />
        <Rating label="Three" disabled />
        <Rating label="Four" readOnly value={2.5} allowHalf />
        <Rating aria-label="Five" max={3} />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// TagInput
// ---------------------------------------------------------------------------

describe('TagInput', () => {
  it('renders an empty field with zero props', () => {
    render(<TagInput aria-label="Tags" />)
    expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('No tags')
  })

  it('adds a tag on Enter, uncontrolled', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['react'])
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('adds a tag on comma', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'vue' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(onChange).toHaveBeenCalledWith(['vue'])
  })

  it('works controlled', () => {
    const onChange = vi.fn()
    const { rerender } = render(<TagInput aria-label="Tags" value={['a']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'b' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    // Still one chip: the parent owns the list.
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    rerender(<TagInput aria-label="Tags" value={['a', 'b']} onChange={onChange} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('trims and rejects an empty tag', () => {
    const onChange = vi.fn()
    const onReject = vi.fn()
    render(<TagInput aria-label="Tags" onChange={onChange} onReject={onReject} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(onChange).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalledWith('', 'empty')
  })

  it('removes the last tag on Backspace in an empty field', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" defaultValue={['a', 'b']} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('leaves the tags alone when Backspace has text to delete', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" defaultValue={['a']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'xy' } })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('gives every remove button an accessible name', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" defaultValue={['react', 'vue']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove react' }))
    expect(onChange).toHaveBeenCalledWith(['vue'])
  })

  it('announces the whole tag set on change', () => {
    render(<TagInput aria-label="Tags" defaultValue={['react', 'vue']} />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('2 tags: react, vue')
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'svelte' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(status).toHaveTextContent('3 tags: react, vue, svelte')
  })

  it('rejects a duplicate and says so', () => {
    const onReject = vi.fn()
    render(<TagInput aria-label="Tags" defaultValue={['react']} onReject={onReject} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onReject).toHaveBeenCalledWith('react', 'duplicate')
    expect(screen.getByRole('alert')).toHaveTextContent('already been added')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('permits duplicates when told to', () => {
    const onChange = vi.fn()
    render(
      <TagInput aria-label="Tags" allowDuplicates defaultValue={['react']} onChange={onChange} />,
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['react', 'react'])
  })

  it('enforces max', () => {
    const onReject = vi.fn()
    render(<TagInput aria-label="Tags" max={2} defaultValue={['a', 'b']} onReject={onReject} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'c' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onReject).toHaveBeenCalledWith('c', 'max')
    expect(screen.getByRole('alert')).toHaveTextContent('No more than 2 tags')
  })

  it('shows a validate message and rejects silently on false', () => {
    const onReject = vi.fn()
    const { rerender } = render(
      <TagInput
        aria-label="Tags"
        onReject={onReject}
        validate={(tag) => (tag.includes('@') ? true : 'Must be an email')}
      />,
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'nope' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByRole('alert')).toHaveTextContent('Must be an email')
    expect(onReject).toHaveBeenLastCalledWith('nope', 'invalid')

    rerender(<TagInput aria-label="Tags" onReject={onReject} validate={() => false} />)
    fireEvent.change(input, { target: { value: 'nope' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('splits a multi-tag paste', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" onChange={onChange} />)
    fireEvent.paste(screen.getByRole('textbox'), {
      clipboardData: { getData: () => 'a, b\nc' },
    })
    expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c'])
  })

  it('commits on blur', () => {
    const onChange = vi.fn()
    render(<TagInput aria-label="Tags" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'later' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(['later'])
  })

  it('submits one hidden input per tag', () => {
    const { container } = render(
      <TagInput aria-label="Tags" name="tags" defaultValue={['a', 'b']} />,
    )
    const hidden = container.querySelectorAll('input[type="hidden"]')
    expect(hidden).toHaveLength(2)
    expect((hidden[0] as HTMLInputElement).name).toBe('tags')
    expect((hidden[1] as HTMLInputElement).value).toBe('b')
  })

  it('works inside Field', () => {
    render(
      <Field label="Tags" help="Comma separated">
        <TagInput />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Tags' })
    expect(input).toHaveAccessibleDescription('Comma separated')
    expect(input).toBeRequired
  })

  it('has no axe violations, including invalid and disabled', async () => {
    render(
      <>
        <TagInput aria-label="One" defaultValue={['a', 'b']} />
        <TagInput aria-label="Two" invalid defaultValue={['a']} />
        <TagInput aria-label="Three" disabled defaultValue={['a']} />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// FileUpload
// ---------------------------------------------------------------------------

function makeFile(name: string, size: number, type: string): File {
  // `lastModified` is pinned as well as `size`: it is part of the identity check, and
  // jsdom defaults it to `Date.now()`, which makes two picks of "the same file" differ
  // whenever the clock ticks between them.
  const file = new File(['x'], name, { type, lastModified: 1_700_000_000_000 })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/** The accepted-file rows only - the rejection list is made of `<li>` too. */
function fileRows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.vk-file-upload__file'))
}

function fileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]')
  if (!input) throw new Error('no file input')
  return input as HTMLInputElement
}

function selectFiles(files: File[]) {
  fireEvent.change(fileInput(), { target: { files } })
}

describe('FileUpload', () => {
  it('formats byte sizes', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(999)).toBe('999 B')
    expect(formatBytes(1000)).toBe('1 kB')
    expect(formatBytes(1_500_000)).toBe('1.5 MB')
    expect(formatBytes(25_000_000)).toBe('25 MB')
  })

  it('matches accept tokens by extension and by MIME wildcard', () => {
    const png = makeFile('a.png', 10, 'image/png')
    const pdf = makeFile('a.pdf', 10, 'application/pdf')
    const unknown = makeFile('a.weird', 10, '')
    expect(matchesAccept(png, undefined)).toBe(true)
    expect(matchesAccept(png, 'image/*')).toBe(true)
    expect(matchesAccept(pdf, 'image/*')).toBe(false)
    expect(matchesAccept(pdf, 'application/pdf')).toBe(true)
    expect(matchesAccept(png, '.png,.jpg')).toBe(true)
    expect(matchesAccept(pdf, '.png,.jpg')).toBe(false)
    // An empty `type` can only be judged by extension.
    expect(matchesAccept(unknown, 'image/*')).toBe(false)
    expect(matchesAccept(unknown, '.weird')).toBe(true)
  })

  it('renders a keyboard-reachable file input, never display:none', () => {
    render(<FileUpload />)
    const input = fileInput()
    // In the accessibility tree, named by the zone's own text.
    expect(input).toHaveAccessibleName('Choose files or drag them here')
    expect(input.className).toContain('vk-file-upload__input')
    expect(input).not.toHaveAttribute('hidden')
    expect(input.style.display).not.toBe('none')
  })

  it('accepts files, uncontrolled, and lists them with size and type', () => {
    const onFilesChange = vi.fn()
    render(<FileUpload multiple onFilesChange={onFilesChange} />)
    selectFiles([makeFile('report.pdf', 2000, 'application/pdf')])
    expect(onFilesChange).toHaveBeenCalledTimes(1)
    const row = screen.getByRole('listitem')
    expect(row).toHaveTextContent('report.pdf')
    expect(row).toHaveTextContent('2 kB')
    expect(row).toHaveTextContent('application/pdf')
  })

  it('works controlled', () => {
    const onFilesChange = vi.fn()
    const { rerender } = render(<FileUpload multiple value={[]} onFilesChange={onFilesChange} />)
    selectFiles([makeFile('a.txt', 10, 'text/plain')])
    expect(onFilesChange).toHaveBeenCalled()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    rerender(
      <FileUpload
        multiple
        value={[makeFile('a.txt', 10, 'text/plain')]}
        onFilesChange={onFilesChange}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('replaces the selection when not multiple', () => {
    const onFilesChange = vi.fn()
    render(<FileUpload onFilesChange={onFilesChange} />)
    selectFiles([makeFile('a.txt', 10, 'text/plain')])
    selectFiles([makeFile('b.txt', 10, 'text/plain')])
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.txt' })])
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('rejects a file that is too big', () => {
    const onReject = vi.fn()
    render(<FileUpload multiple maxSize={1000} onReject={onReject} />)
    selectFiles([makeFile('big.png', 5000, 'image/png')])
    expect(onReject).toHaveBeenCalledWith([
      { file: expect.objectContaining({ name: 'big.png' }), reason: 'size' },
    ])
    expect(screen.getByRole('alert')).toHaveTextContent('larger than 1 kB')
    expect(screen.queryByText('big.png', { selector: '.vk-file-upload__name' })).toBeNull()
  })

  it('rejects files over the count limit and keeps the ones that fit', () => {
    const onReject = vi.fn()
    const onFilesChange = vi.fn()
    render(<FileUpload multiple maxFiles={2} onReject={onReject} onFilesChange={onFilesChange} />)
    selectFiles([
      makeFile('a.txt', 10, 'text/plain'),
      makeFile('b.txt', 10, 'text/plain'),
      makeFile('c.txt', 10, 'text/plain'),
    ])
    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'a.txt' }),
      expect.objectContaining({ name: 'b.txt' }),
    ])
    expect(onReject).toHaveBeenCalledWith([
      { file: expect.objectContaining({ name: 'c.txt' }), reason: 'count' },
    ])
    expect(screen.getByRole('alert')).toHaveTextContent('over the 2 file limit')
  })

  it('rejects the wrong type even though accept is set on the input', () => {
    const onReject = vi.fn()
    render(<FileUpload multiple accept="image/*" onReject={onReject} />)
    selectFiles([makeFile('doc.pdf', 10, 'application/pdf')])
    expect(onReject).toHaveBeenCalledWith([
      { file: expect.objectContaining({ name: 'doc.pdf' }), reason: 'type' },
    ])
    expect(screen.getByRole('alert')).toHaveTextContent('wrong file type')
    expect(fileInput()).toHaveAttribute('accept', 'image/*')
  })

  it('rejects the same file twice', () => {
    const onReject = vi.fn()
    render(<FileUpload multiple onReject={onReject} />)
    selectFiles([makeFile('a.txt', 10, 'text/plain')])
    selectFiles([makeFile('a.txt', 10, 'text/plain')])
    expect(onReject).toHaveBeenLastCalledWith([
      { file: expect.objectContaining({ name: 'a.txt' }), reason: 'duplicate' },
    ])
    expect(fileRows()).toHaveLength(1)
  })

  it('keeps the existing list when every incoming file is refused', () => {
    const onFilesChange = vi.fn()
    render(<FileUpload multiple maxSize={100} onFilesChange={onFilesChange} />)
    selectFiles([makeFile('ok.txt', 10, 'text/plain')])
    onFilesChange.mockClear()
    selectFiles([makeFile('big.txt', 9999, 'text/plain')])
    expect(onFilesChange).not.toHaveBeenCalled()
    expect(fileRows()).toHaveLength(1)
  })

  it('removes a row through a named button', () => {
    const onFilesChange = vi.fn()
    render(<FileUpload multiple onFilesChange={onFilesChange} />)
    selectFiles([makeFile('a.txt', 10, 'text/plain')])
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.txt' }))
    expect(onFilesChange).toHaveBeenLastCalledWith([])
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('tracks drag state and ingests a drop', () => {
    const onFilesChange = vi.fn()
    const { container } = render(<FileUpload multiple onFilesChange={onFilesChange} />)
    const root = container.querySelector('.vk-file-upload') as HTMLElement
    expect(root).not.toHaveAttribute('data-dragging')

    fireEvent.dragEnter(root, { dataTransfer: { files: [], types: ['Files'] } })
    expect(root).toHaveAttribute('data-dragging')

    fireEvent.drop(root, { dataTransfer: { files: [makeFile('d.txt', 10, 'text/plain')] } })
    expect(root).not.toHaveAttribute('data-dragging')
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'd.txt' })])
  })

  it('does not flicker the drag highlight when crossing a child boundary', () => {
    const { container } = render(<FileUpload />)
    const root = container.querySelector('.vk-file-upload') as HTMLElement
    fireEvent.dragEnter(root, { dataTransfer: { files: [] } })
    fireEvent.dragEnter(root, { dataTransfer: { files: [] } })
    fireEvent.dragLeave(root)
    // One leave out of two enters: still dragging.
    expect(root).toHaveAttribute('data-dragging')
    fireEvent.dragLeave(root)
    expect(root).not.toHaveAttribute('data-dragging')
  })

  it('announces the selection', () => {
    render(<FileUpload multiple />)
    expect(screen.getByRole('status')).toHaveTextContent('No files selected')
    selectFiles([makeFile('a.txt', 10, 'text/plain')])
    expect(screen.getByRole('status')).toHaveTextContent('1 file selected: a.txt')
  })

  it('ignores everything while disabled', () => {
    const onFilesChange = vi.fn()
    const { container } = render(<FileUpload disabled onFilesChange={onFilesChange} />)
    const root = container.querySelector('.vk-file-upload') as HTMLElement
    fireEvent.drop(root, { dataTransfer: { files: [makeFile('a.txt', 10, 'text/plain')] } })
    expect(onFilesChange).not.toHaveBeenCalled()
    expect(fileInput()).toBeDisabled()
  })

  it('works inside Field', () => {
    render(
      <Field label="Attachments" help="PDF only">
        <FileUpload accept=".pdf" />
      </Field>,
    )
    const input = fileInput()
    expect(input).toHaveAccessibleDescription('PDF only')
    expect(input).toBeRequired
  })

  it('has no axe violations, including invalid and disabled', async () => {
    render(
      <>
        <FileUpload label="One" hint="Up to 5 MB" />
        <FileUpload label="Two" invalid />
        <FileUpload label="Three" disabled />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

/** The button for one ISO day, or `null`. Cells outside the month have no button. */
function dayButton(iso: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(`[data-vk-day="${iso}"]`)
}

/** The same, but throwing rather than returning null, for the many happy paths. */
function day(iso: string): HTMLButtonElement {
  const button = dayButton(iso)
  if (!button) throw new Error(`no day cell for ${iso}`)
  return button
}

function focusedIso(): string | null {
  return active()?.getAttribute('data-vk-day') ?? null
}

const FEB_2024 = new Date(2024, 1, 15)

describe('Calendar', () => {
  it('renders a grid with zero props', () => {
    render(<Calendar />)
    const grid = screen.getByRole('grid')
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(7)
    // Today is always present and marked.
    expect(document.querySelector('[aria-current="date"]')).toBeInTheDocument()
  })

  it('localises month, weekday and day names through Intl', () => {
    render(<Calendar defaultMonth={FEB_2024} locale="en-GB" />)
    expect(screen.getByText('February 2024')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Sunday' })).toBeInTheDocument()
    // Asserted by parts: the separators inside a long `Intl` date vary by ICU version.
    const name = day('2024-02-15').getAttribute('aria-label') ?? ''
    expect(name).toMatch(/Thursday/)
    expect(name).toMatch(/February/)
    expect(name).toMatch(/15/)
    expect(name).toMatch(/2024/)
  })

  it('renders 29 days for February in a leap year and 28 otherwise', () => {
    const { rerender } = render(<Calendar defaultMonth={new Date(2024, 1, 1)} />)
    expect(day('2024-02-29')).toBeInTheDocument()
    expect(dayButton('2024-03-01')).toBeNull()

    rerender(<Calendar month={new Date(2023, 1, 1)} />)
    expect(dayButton('2023-02-29')).toBeNull()
    expect(day('2023-02-28')).toBeInTheDocument()
  })

  it('starts the week where asked, for all seven values', () => {
    const expected = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    for (let start = 0; start <= 6; start += 1) {
      const view = render(
        <Calendar defaultMonth={FEB_2024} locale="en-GB" weekStartsOn={start as WeekStart} />,
      )
      const headers = screen.getAllByRole('columnheader')
      expect(headers[0]).toHaveAccessibleName(expected[start] as string)
      view.unmount()
    }
  })

  it('selects a day, uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<Calendar defaultMonth={FEB_2024} onValueChange={onValueChange} />)
    fireEvent.click(day('2024-02-20'))
    const selected = onValueChange.mock.calls[0]?.[0] as Date
    expect(toISODate(selected)).toBe('2024-02-20')
    expect(day('2024-02-20')).toHaveAttribute('data-selected')
  })

  it('works controlled', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Calendar value={new Date(2024, 1, 10)} onValueChange={onValueChange} />,
    )
    expect(day('2024-02-10')).toHaveAttribute('data-selected')
    fireEvent.click(day('2024-02-11'))
    expect(onValueChange).toHaveBeenCalled()
    expect(day('2024-02-10')).toHaveAttribute('data-selected')
    rerender(<Calendar value={new Date(2024, 1, 11)} onValueChange={onValueChange} />)
    expect(day('2024-02-11')).toHaveAttribute('data-selected')
  })

  it('follows a controlled value into another month', () => {
    const { rerender } = render(<Calendar value={new Date(2024, 1, 10)} />)
    expect(screen.getByText('February 2024')).toBeInTheDocument()
    rerender(<Calendar value={new Date(2024, 6, 4)} />)
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    expect(day('2024-07-04')).toHaveAttribute('data-selected')
  })

  it('pages months with the header buttons, over a year boundary', () => {
    render(<Calendar defaultMonth={new Date(2024, 0, 15)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('December 2023')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('January 2024')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }))
    expect(screen.getByText('January 2025')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }))
    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('disables days outside min and max, inclusively', () => {
    render(
      <Calendar defaultMonth={FEB_2024} min={new Date(2024, 1, 10)} max={new Date(2024, 1, 20)} />,
    )
    expect(day('2024-02-09')).toBeDisabled()
    expect(day('2024-02-10')).toBeEnabled()
    expect(day('2024-02-20')).toBeEnabled()
    expect(day('2024-02-21')).toBeDisabled()
  })

  it('disables the paging buttons at the bounds', () => {
    render(
      <Calendar defaultMonth={FEB_2024} min={new Date(2024, 1, 1)} max={new Date(2024, 1, 29)} />,
    )
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('refuses to select a disabled day', () => {
    const onValueChange = vi.fn()
    render(
      <Calendar
        defaultMonth={FEB_2024}
        disabledDates={[new Date(2024, 1, 14)]}
        onValueChange={onValueChange}
      />,
    )
    expect(day('2024-02-14')).toBeDisabled()
    fireEvent.click(day('2024-02-14'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  describe('keyboard', () => {
    function setup(extra: Partial<Record<string, unknown>> = {}) {
      render(<Calendar defaultValue={FEB_2024} {...extra} />)
      const start = day('2024-02-15')
      start.focus()
      return start
    }

    it('moves by a day with the left and right arrows', () => {
      const start = setup()
      fireEvent.keyDown(start, { key: 'ArrowRight' })
      expect(focusedIso()).toBe('2024-02-16')
      fireEvent.keyDown(day('2024-02-16'), { key: 'ArrowLeft' })
      expect(focusedIso()).toBe('2024-02-15')
    })

    it('moves by a week with the up and down arrows', () => {
      const start = setup()
      fireEvent.keyDown(start, { key: 'ArrowDown' })
      expect(focusedIso()).toBe('2024-02-22')
      fireEvent.keyDown(day('2024-02-22'), { key: 'ArrowUp' })
      expect(focusedIso()).toBe('2024-02-15')
    })

    it('goes to the start and end of the week, honouring weekStartsOn', () => {
      const start = setup()
      fireEvent.keyDown(start, { key: 'Home' })
      // Week start 0 (Sunday): 15 Feb 2024 was a Thursday.
      expect(focusedIso()).toBe('2024-02-11')
      fireEvent.keyDown(day('2024-02-11'), { key: 'End' })
      expect(focusedIso()).toBe('2024-02-17')
    })

    it('honours a Monday week start for Home and End', () => {
      const start = setup({ weekStartsOn: 1 })
      fireEvent.keyDown(start, { key: 'Home' })
      expect(focusedIso()).toBe('2024-02-12')
      fireEvent.keyDown(day('2024-02-12'), { key: 'End' })
      expect(focusedIso()).toBe('2024-02-18')
    })

    it('pages a month with PageUp and PageDown', () => {
      const start = setup()
      fireEvent.keyDown(start, { key: 'PageDown' })
      expect(focusedIso()).toBe('2024-03-15')
      expect(screen.getByText('March 2024')).toBeInTheDocument()
      fireEvent.keyDown(day('2024-03-15'), { key: 'PageUp' })
      expect(focusedIso()).toBe('2024-02-15')
    })

    it('pages a year with Shift+PageUp and Shift+PageDown', () => {
      const start = setup()
      fireEvent.keyDown(start, { key: 'PageDown', shiftKey: true })
      expect(focusedIso()).toBe('2025-02-15')
      fireEvent.keyDown(day('2025-02-15'), { key: 'PageUp', shiftKey: true })
      expect(focusedIso()).toBe('2024-02-15')
    })

    it('clamps a month page to the length of the target month', () => {
      render(<Calendar defaultValue={new Date(2024, 0, 31)} />)
      const start = day('2024-01-31')
      start.focus()
      fireEvent.keyDown(start, { key: 'PageDown' })
      // 31 January + 1 month is 29 February in a leap year, not 2 March.
      expect(focusedIso()).toBe('2024-02-29')
    })

    it('crosses into the next month and repaints the grid', () => {
      render(<Calendar defaultValue={new Date(2024, 1, 29)} />)
      const start = day('2024-02-29')
      start.focus()
      fireEvent.keyDown(start, { key: 'ArrowRight' })
      expect(focusedIso()).toBe('2024-03-01')
      expect(screen.getByText('March 2024')).toBeInTheDocument()
    })

    it('never lands on a disabled day - it steps over it', () => {
      render(
        <Calendar
          defaultValue={FEB_2024}
          disabledDates={[new Date(2024, 1, 16), new Date(2024, 1, 17)]}
        />,
      )
      const start = day('2024-02-15')
      start.focus()
      fireEvent.keyDown(start, { key: 'ArrowRight' })
      // 16 and 17 are blocked, so the cursor lands on 18.
      expect(focusedIso()).toBe('2024-02-18')
    })

    it('stops at min instead of walking past it', () => {
      render(<Calendar defaultValue={new Date(2024, 1, 10)} min={new Date(2024, 1, 10)} />)
      const start = day('2024-02-10')
      start.focus()
      fireEvent.keyDown(start, { key: 'ArrowLeft' })
      expect(focusedIso()).toBe('2024-02-10')
      fireEvent.keyDown(start, { key: 'PageUp' })
      expect(focusedIso()).toBe('2024-02-10')
    })

    it('clamps a keyboard move into range rather than refusing it', () => {
      render(<Calendar defaultValue={new Date(2024, 1, 20)} max={new Date(2024, 1, 22)} />)
      const start = day('2024-02-20')
      start.focus()
      fireEvent.keyDown(start, { key: 'ArrowDown' })
      // A week forward is past `max`, so it lands on `max` itself.
      expect(focusedIso()).toBe('2024-02-22')
    })

    it('keeps a single tab stop', () => {
      render(<Calendar defaultValue={FEB_2024} />)
      const tabbable = document.querySelectorAll('[data-vk-day][tabindex="0"]')
      expect(tabbable).toHaveLength(1)
      expect(tabbable[0]).toHaveAttribute('data-vk-day', '2024-02-15')
    })
  })

  describe('range mode', () => {
    it('collects a start then an end', () => {
      const onValueChange = vi.fn()
      render(<Calendar mode="range" defaultMonth={FEB_2024} onValueChange={onValueChange} />)
      fireEvent.click(day('2024-02-10'))
      expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ end: null }))
      fireEvent.click(day('2024-02-14'))
      const range = onValueChange.mock.calls[1]?.[0] as { start: Date; end: Date }
      expect(toISODate(range.start)).toBe('2024-02-10')
      expect(toISODate(range.end)).toBe('2024-02-14')
      expect(day('2024-02-12').closest('td')).toHaveAttribute('data-in-range')
      expect(day('2024-02-10').closest('td')).toHaveAttribute('data-range-start')
      expect(day('2024-02-14').closest('td')).toHaveAttribute('data-range-end')
    })

    it('swaps when the end is picked before the start', () => {
      const onValueChange = vi.fn()
      render(<Calendar mode="range" defaultMonth={FEB_2024} onValueChange={onValueChange} />)
      fireEvent.click(day('2024-02-20'))
      fireEvent.click(day('2024-02-10'))
      const range = onValueChange.mock.calls[1]?.[0] as { start: Date; end: Date }
      expect(toISODate(range.start)).toBe('2024-02-10')
      expect(toISODate(range.end)).toBe('2024-02-20')
      expect(day('2024-02-15').closest('td')).toHaveAttribute('data-in-range')
    })

    it('starts over on the third click', () => {
      const onValueChange = vi.fn()
      render(
        <Calendar
          mode="range"
          defaultMonth={FEB_2024}
          defaultValue={{ start: new Date(2024, 1, 5), end: new Date(2024, 1, 9) }}
          onValueChange={onValueChange}
        />,
      )
      fireEvent.click(day('2024-02-20'))
      const range = onValueChange.mock.calls[0]?.[0] as { start: Date; end: Date | null }
      expect(toISODate(range.start)).toBe('2024-02-20')
      expect(range.end).toBeNull()
    })

    it('works controlled, and marks the grid multi-selectable', () => {
      const onValueChange = vi.fn()
      const { rerender } = render(
        <Calendar
          mode="range"
          value={{ start: new Date(2024, 1, 5), end: null }}
          onValueChange={onValueChange}
        />,
      )
      expect(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true')
      fireEvent.click(day('2024-02-08'))
      expect(day('2024-02-06').closest('td')).not.toHaveAttribute('data-in-range')
      rerender(
        <Calendar
          mode="range"
          value={{ start: new Date(2024, 1, 5), end: new Date(2024, 1, 8) }}
          onValueChange={onValueChange}
        />,
      )
      expect(day('2024-02-06').closest('td')).toHaveAttribute('data-in-range')
    })
  })

  it('submits an ISO date, and a pair in range mode', () => {
    const single = render(<Calendar name="when" defaultValue={new Date(2024, 1, 3)} />)
    const hidden = single.container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden.name).toBe('when')
    expect(hidden.value).toBe('2024-02-03')
    single.unmount()

    // A fresh mount rather than a rerender: `mode` seeds the selection shape once.
    const { container } = render(
      <Calendar
        mode="range"
        name="stay"
        defaultValue={{ start: new Date(2024, 1, 3), end: new Date(2024, 1, 6) }}
      />,
    )
    const pair = container.querySelectorAll('input[type="hidden"]')
    expect((pair[0] as HTMLInputElement).name).toBe('stay-start')
    expect((pair[0] as HTMLInputElement).value).toBe('2024-02-03')
    expect((pair[1] as HTMLInputElement).value).toBe('2024-02-06')
  })

  it('merges className, forwards rest props and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Calendar ref={ref} className="mine" data-testid="cal" />)
    const root = container.querySelector('.vk-calendar')
    expect(root?.className).toBe('vk-calendar mine')
    expect(root).toHaveAttribute('data-testid', 'cal')
    expect(ref.current).toBe(root)
  })

  it('works inside Field', () => {
    render(
      <Field label="Date" error="Pick a weekday">
        <Calendar defaultMonth={FEB_2024} />
      </Field>,
    )
    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('aria-invalid', 'true')
    expect(grid).toHaveAccessibleDescription('Pick a weekday')
  })

  it('has no axe violations, including invalid, disabled and range', async () => {
    render(
      <>
        <Calendar defaultValue={FEB_2024} />
        <Calendar defaultMonth={FEB_2024} invalid />
        <Calendar defaultMonth={FEB_2024} disabled />
        <Calendar
          mode="range"
          defaultMonth={FEB_2024}
          defaultValue={{ start: new Date(2024, 1, 5), end: new Date(2024, 1, 9) }}
        />
        <Calendar defaultMonth={FEB_2024} min={new Date(2024, 1, 10)} max={new Date(2024, 1, 20)} />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------

describe('DatePicker', () => {
  it('renders a text field and a trigger with zero props', () => {
    render(<DatePicker aria-label="Date" />)
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveValue('')
    const trigger = screen.getByRole('button', { name: 'Choose date' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  })

  it('shows a default value as ISO text', () => {
    render(<DatePicker aria-label="Date" defaultValue={new Date(2024, 1, 29)} />)
    expect(screen.getByRole('textbox')).toHaveValue('2024-02-29')
  })

  it('accepts typed entry on blur, uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<DatePicker aria-label="Date" onValueChange={onValueChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2024-02-29' } })
    fireEvent.blur(input)
    expect(toISODate(onValueChange.mock.calls[0]?.[0] as Date)).toBe('2024-02-29')
  })

  it('accepts typed entry on Enter without submitting the form', () => {
    const onValueChange = vi.fn()
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <DatePicker aria-label="Date" onValueChange={onValueChange} />
      </form>,
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2024-03-01' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(toISODate(onValueChange.mock.calls[0]?.[0] as Date)).toBe('2024-03-01')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps unparseable text and reports it', () => {
    const onValueChange = vi.fn()
    render(<DatePicker aria-label="Date" onValueChange={onValueChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2023-02-29' } })
    fireEvent.blur(input)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('2023-02-29')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a date as YYYY-MM-DD')
  })

  it('clears the value on empty text', () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        aria-label="Date"
        defaultValue={new Date(2024, 1, 3)}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it('clamps typed entry into min and max', () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        aria-label="Date"
        min={new Date(2024, 1, 10)}
        max={new Date(2024, 1, 20)}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '1990-01-01' } })
    fireEvent.blur(input)
    expect(toISODate(onValueChange.mock.calls[0]?.[0] as Date)).toBe('2024-02-10')
  })

  it('rejects typed entry that lands on a disabled date', () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        aria-label="Date"
        disabledDates={[new Date(2024, 1, 14)]}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2024-02-14' } })
    fireEvent.blur(input)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('opens on the trigger and picks a day', () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        aria-label="Date"
        defaultValue={new Date(2024, 1, 15)}
        onValueChange={onValueChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    const dialog = screen.getByRole('dialog', { name: 'Choose date' })
    expect(within(dialog).getByRole('grid')).toBeInTheDocument()
    // Focus lands on the calendar's own tab stop, so the arrows work immediately.
    expect(focusedIso()).toBe('2024-02-15')

    fireEvent.click(day('2024-02-20'))
    expect(toISODate(onValueChange.mock.calls[0]?.[0] as Date)).toBe('2024-02-20')
    expect(screen.getByRole('textbox')).toHaveValue('2024-02-20')
    // Picking closes the popup and returns focus to the field.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(active()).toBe(screen.getByRole('textbox'))
  })

  it('opens on ArrowDown in the field', () => {
    render(<DatePicker aria-label="Date" defaultValue={new Date(2024, 1, 15)} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes on Escape and hands focus back', () => {
    render(<DatePicker aria-label="Date" defaultValue={new Date(2024, 1, 15)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(active()).toBe(screen.getByRole('textbox'))
  })

  it('closes on a press outside', () => {
    render(
      <>
        <DatePicker aria-label="Date" defaultValue={new Date(2024, 1, 15)} />
        <button type="button">Elsewhere</button>
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('works controlled for both the value and the popup', () => {
    const onValueChange = vi.fn()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <DatePicker
        aria-label="Date"
        value={new Date(2024, 1, 1)}
        onValueChange={onValueChange}
        open={false}
        onOpenChange={onOpenChange}
      />,
    )
    expect(screen.getByRole('textbox')).toHaveValue('2024-02-01')
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <DatePicker
        aria-label="Date"
        value={new Date(2024, 5, 6)}
        onValueChange={onValueChange}
        open={false}
        onOpenChange={onOpenChange}
      />,
    )
    expect(screen.getByRole('textbox')).toHaveValue('2024-06-06')
  })

  it('accepts a custom format and parse pair', () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        aria-label="Date"
        placeholder="DD/MM/YYYY"
        defaultValue={new Date(2024, 1, 3)}
        format={(date) => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
        parse={(text) => {
          const parts = text.split('/').map(Number)
          if (parts.length !== 3) return null
          const [d, m, y] = parts as [number, number, number]
          return new Date(y, m - 1, d)
        }}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('3/2/2024')
    fireEvent.change(input, { target: { value: '25/12/2024' } })
    fireEvent.blur(input)
    expect(toISODate(onValueChange.mock.calls[0]?.[0] as Date)).toBe('2024-12-25')
  })

  it('submits the field text under its name', () => {
    render(<DatePicker aria-label="Date" name="due" defaultValue={new Date(2024, 1, 3)} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'due')
    expect(input).toHaveValue('2024-02-03')
  })

  it('works inside Field', () => {
    render(
      <Field label="Due date" help="Any weekday">
        <DatePicker />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Due date' })
    expect(input).toHaveAccessibleDescription('Any weekday')
  })

  it('has no axe violations, closed, invalid and disabled', async () => {
    render(
      <>
        <DatePicker aria-label="One" defaultValue={new Date(2024, 1, 3)} />
        <DatePicker aria-label="Two" invalid />
        <DatePicker aria-label="Three" disabled />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('has no axe violations while open', async () => {
    render(<DatePicker aria-label="One" defaultValue={new Date(2024, 1, 3)} defaultOpen />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Combobox
// ---------------------------------------------------------------------------

const FRUIT: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
]

function combo(name = 'Fruit'): HTMLInputElement {
  return screen.getByRole('combobox', { name }) as HTMLInputElement
}

describe('Combobox', () => {
  it('renders a closed combobox with zero optional props', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} />)
    const input = combo()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).not.toHaveAttribute('aria-controls')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens on ArrowDown and wires the ARIA relationships', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} />)
    const input = combo()
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    const listbox = screen.getByRole('listbox')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('aria-controls', listbox.id)
    // The first enabled option is active, and it is pointed at by id.
    const first = screen.getByRole('option', { name: 'Apple' })
    expect(input).toHaveAttribute('aria-activedescendant', first.id)
    expect(first).toHaveAttribute('data-active')
  })

  it('moves the active option without moving DOM focus', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} />)
    const input = combo()
    input.focus()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    const banana = screen.getByRole('option', { name: 'Banana' })
    expect(input).toHaveAttribute('aria-activedescendant', banana.id)
    // The whole point of `aria-activedescendant`: focus is still in the text field.
    expect(active()).toBe(input)
  })

  it('skips a disabled option and wraps at the ends', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} />)
    const input = combo()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    // Up from the first wraps to the last *enabled* option, not the disabled Durian.
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Cherry' }).id,
    )
  })

  it('jumps to the first and last option with Home and End', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} defaultOpen />)
    const input = combo()
    fireEvent.keyDown(input, { key: 'End' })
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Cherry' }).id,
    )
    fireEvent.keyDown(input, { key: 'Home' })
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    )
  })

  it('selects the active option on Enter, uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Fruit" options={FRUIT} onValueChange={onValueChange} />)
    const input = combo()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('banana')
    expect(input).toHaveValue('Banana')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects on a pointer press', () => {
    const onValueChange = vi.fn()
    render(
      <Combobox aria-label="Fruit" options={FRUIT} defaultOpen onValueChange={onValueChange} />,
    )
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Cherry' }))
    expect(onValueChange).toHaveBeenCalledWith('cherry')
  })

  it('ignores a disabled option', () => {
    const onValueChange = vi.fn()
    render(
      <Combobox aria-label="Fruit" options={FRUIT} defaultOpen onValueChange={onValueChange} />,
    )
    const durian = screen.getByRole('option', { name: 'Durian' })
    expect(durian).toHaveAttribute('aria-disabled', 'true')
    fireEvent.mouseDown(durian)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('works controlled', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Combobox aria-label="Fruit" options={FRUIT} value="apple" onValueChange={onValueChange} />,
    )
    const input = combo()
    expect(input).toHaveValue('Apple')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('banana')
    rerender(
      <Combobox aria-label="Fruit" options={FRUIT} value="banana" onValueChange={onValueChange} />,
    )
    expect(input).toHaveValue('Banana')
  })

  it('filters as you type, case-insensitively', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} />)
    const input = combo()
    fireEvent.change(input, { target: { value: 'AN' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    // Case-insensitive, and "an" is inside Banana and Durian both.
    expect(screen.getAllByRole('option')).toHaveLength(2)
    fireEvent.change(input, { target: { value: 'bAn' } })
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveAccessibleName('Banana')
  })

  it('accepts a custom filter', () => {
    render(
      <Combobox
        aria-label="Fruit"
        options={FRUIT}
        defaultOpen
        filter={(option, query) => option.value.startsWith(query)}
      />,
    )
    fireEvent.change(combo(), { target: { value: 'c' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  it('shows the empty state, as an option so the listbox stays valid', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} emptyState="Nothing here" />)
    fireEvent.change(combo(), { target: { value: 'zzz' } })
    const message = screen.getByRole('option', { name: 'Nothing here' })
    expect(message).toHaveAttribute('aria-disabled', 'true')
    // A message is never active, so Enter does nothing.
    expect(combo()).not.toHaveAttribute('aria-activedescendant')
  })

  it('shows a busy row while loading', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} loading defaultOpen />)
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('option', { name: 'Loading…' })).toBeInTheDocument()
  })

  it('offers a create row and reports it', () => {
    const onCreate = vi.fn()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Fruit"
        options={FRUIT}
        creatable
        onCreate={onCreate}
        onValueChange={onValueChange}
      />,
    )
    const input = combo()
    fireEvent.change(input, { target: { value: 'Elderberry' } })
    const create = screen.getByRole('option', { name: 'Create "Elderberry"' })
    fireEvent.mouseDown(create)
    expect(onCreate).toHaveBeenCalledWith('Elderberry')
    expect(onValueChange).toHaveBeenCalledWith('Elderberry')
  })

  it('does not offer to create something that already exists', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} creatable />)
    fireEvent.change(combo(), { target: { value: 'apple' } })
    expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument()
  })

  it('closes on Escape, then clears the query on a second Escape', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} />)
    const input = combo()
    fireEvent.change(input, { target: { value: 'ban' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('ban')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveValue('')
  })

  it('closes on a press outside', () => {
    render(
      <>
        <Combobox aria-label="Fruit" options={FRUIT} defaultOpen />
        <button type="button">Elsewhere</button>
      </>,
    )
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('clears the selection through a named button', () => {
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Fruit"
        options={FRUIT}
        defaultValue="apple"
        onValueChange={onValueChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(combo()).toHaveValue('')
  })

  describe('multiple', () => {
    it('accumulates chips and stays open', () => {
      const onValueChange = vi.fn()
      render(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          defaultOpen
          onValueChange={onValueChange}
        />,
      )
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Apple' }))
      expect(onValueChange).toHaveBeenLastCalledWith(['apple'])
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Banana' }))
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana'])
      expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument()
    })

    it('toggles an already-selected option off', () => {
      const onValueChange = vi.fn()
      render(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          defaultValue={['apple']}
          defaultOpen
          onValueChange={onValueChange}
        />,
      )
      const apple = screen.getByRole('option', { name: 'Apple' })
      expect(apple).toHaveAttribute('aria-selected', 'true')
      fireEvent.mouseDown(apple)
      expect(onValueChange).toHaveBeenLastCalledWith([])
    })

    it('removes the last chip on Backspace in an empty query', () => {
      const onValueChange = vi.fn()
      render(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          defaultValue={['apple', 'banana']}
          onValueChange={onValueChange}
        />,
      )
      fireEvent.keyDown(combo(), { key: 'Backspace' })
      expect(onValueChange).toHaveBeenLastCalledWith(['apple'])
    })

    it('leaves the chips alone when Backspace has text to delete', () => {
      const onValueChange = vi.fn()
      render(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          defaultValue={['apple']}
          onValueChange={onValueChange}
        />,
      )
      const input = combo()
      fireEvent.change(input, { target: { value: 'ba' } })
      onValueChange.mockClear()
      fireEvent.keyDown(input, { key: 'Backspace' })
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('removes a chip through its own button', () => {
      const onValueChange = vi.fn()
      render(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          defaultValue={['apple', 'banana']}
          onValueChange={onValueChange}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: 'Remove Banana' }))
      expect(onValueChange).toHaveBeenLastCalledWith(['apple'])
    })

    it('works controlled', () => {
      const onValueChange = vi.fn()
      const { rerender } = render(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          value={['apple']}
          defaultOpen
          onValueChange={onValueChange}
        />,
      )
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Cherry' }))
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry'])
      expect(screen.queryByRole('button', { name: 'Remove Cherry' })).not.toBeInTheDocument()
      rerender(
        <Combobox
          aria-label="Fruit"
          options={FRUIT}
          multiple
          value={['apple', 'cherry']}
          defaultOpen
          onValueChange={onValueChange}
        />,
      )
      expect(screen.getByRole('button', { name: 'Remove Cherry' })).toBeInTheDocument()
    })
  })

  it('submits one hidden input per selected value', () => {
    const { container } = render(
      <Combobox
        aria-label="Fruit"
        options={FRUIT}
        multiple
        name="fruit"
        defaultValue={['apple', 'cherry']}
      />,
    )
    const hidden = container.querySelectorAll('input[type="hidden"]')
    expect(hidden).toHaveLength(2)
    expect((hidden[0] as HTMLInputElement).name).toBe('fruit')
    expect((hidden[1] as HTMLInputElement).value).toBe('cherry')
  })

  it('forwards its ref to the input and merges className', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <Combobox aria-label="Fruit" options={FRUIT} ref={ref} className="mine" />,
    )
    expect(ref.current).toBe(combo())
    expect(container.querySelector('.vk-combobox')?.className).toBe('vk-combobox mine')
  })

  it('does nothing while disabled', () => {
    render(<Combobox aria-label="Fruit" options={FRUIT} disabled />)
    const input = combo()
    expect(input).toBeDisabled()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('works inside Field', () => {
    render(
      <Field label="Fruit" error="Pick one">
        <Combobox options={FRUIT} />
      </Field>,
    )
    const input = screen.getByRole('combobox', { name: /Fruit/ })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Pick one')
  })

  it('drives a controlled parent end to end', () => {
    function Harness() {
      const [value, setValue] = useState<string[]>([])
      return (
        <>
          <Combobox
            aria-label="Fruit"
            options={FRUIT}
            multiple
            value={value}
            onValueChange={setValue}
            defaultOpen
          />
          <output>{value.join('|')}</output>
        </>
      )
    }
    render(<Harness />)
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Apple' }))
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Cherry' }))
    expect(screen.getByText('apple|cherry')).toBeInTheDocument()
  })

  it('has no axe violations, closed, invalid and disabled', async () => {
    render(
      <>
        <Combobox aria-label="One" options={FRUIT} defaultValue="apple" />
        <Combobox aria-label="Two" options={FRUIT} invalid />
        <Combobox aria-label="Three" options={FRUIT} disabled />
        <Combobox aria-label="Four" options={FRUIT} multiple defaultValue={['banana']} />
      </>,
    )
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('has no axe violations while open', async () => {
    render(<Combobox aria-label="One" options={FRUIT} defaultValue="apple" defaultOpen />)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('has no axe violations with a message row instead of options', async () => {
    render(
      <>
        <Combobox aria-label="One" options={[]} defaultOpen />
        <Combobox aria-label="Two" options={FRUIT} loading defaultOpen />
      </>,
    )
    // Both listboxes hold nothing but `aria-disabled` options, which is what keeps
    // `aria-required-children` satisfied.
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })
})
