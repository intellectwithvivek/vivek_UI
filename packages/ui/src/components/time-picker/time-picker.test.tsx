/**
 * TimePicker.
 *
 * The segments are spinbuttons driven by keydown, so almost every test is a keystroke
 * sequence and the two things it must never get wrong: the value is always canonical
 * 24-hour, whatever the display, and a half-entered time is `null`, never a guess.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { TimePicker } from './time-picker'

const seg = (label: string) => screen.getByRole('spinbutton', { name: label })
const type = (el: HTMLElement, ...keys: string[]) => {
  el.focus()
  for (const key of keys) fireEvent.keyDown(el, { key })
}

describe('TimePicker · structure', () => {
  it('renders hour and minute spinbuttons with spoken values, empty by default', () => {
    render(<TimePicker aria-label="Start" />)
    expect(screen.getByRole('group', { name: 'Start' })).toBeInTheDocument()
    expect(seg('Hours')).toHaveAttribute('aria-valuetext', 'empty')
    expect(seg('Minutes')).toHaveAttribute('aria-valuemax', '59')
    expect(screen.queryByRole('spinbutton', { name: 'Seconds' })).toBeNull()
    expect(screen.queryByRole('spinbutton', { name: 'AM or PM' })).toBeNull()
  })

  it('adds seconds and AM/PM segments when asked', () => {
    render(<TimePicker hourCycle={12} withSeconds />)
    expect(seg('Seconds')).toBeInTheDocument()
    expect(seg('AM or PM')).toBeInTheDocument()
    expect(seg('Hours')).toHaveAttribute('aria-valuemin', '1')
    expect(seg('Hours')).toHaveAttribute('aria-valuemax', '12')
  })

  it('shows a value padded to two digits and speaks it in units', () => {
    render(<TimePicker defaultValue="09:05" />)
    expect(seg('Hours')).toHaveValue('09')
    expect(seg('Minutes')).toHaveValue('05')
    expect(seg('Hours')).toHaveAttribute('aria-valuenow', '9')
    expect(seg('Hours')).toHaveAttribute('aria-valuetext', '9 hours')
  })

  it('submits one hidden field with the canonical value, empty while incomplete', () => {
    const { container } = render(<TimePicker defaultValue="14:30" name="start" />)
    expect(container.querySelector('input[name="start"]')).toHaveValue('14:30')
    const empty = render(<TimePicker name="empty" />)
    expect(empty.container.querySelector('input[name="empty"]')).toHaveValue('')
  })

  it('forwards its ref to the first segment and spreads rest onto the group', () => {
    const ref = createRef<HTMLInputElement>()
    render(<TimePicker data-testid="tp" ref={ref} />)
    expect(ref.current).toBe(seg('Hours'))
    expect(screen.getByTestId('tp')).toHaveAttribute('role', 'group')
  })
})

describe('TimePicker · typing', () => {
  it('accumulates two digits, then moves to the next segment', () => {
    const onValueChange = vi.fn()
    render(<TimePicker onValueChange={onValueChange} />)
    type(seg('Hours'), '1', '4')
    expect(seg('Hours')).toHaveValue('14')
    expect(seg('Minutes')).toHaveFocus()
    // Half a time is null, never a guess.
    expect(onValueChange).not.toHaveBeenCalledWith(expect.stringMatching(/^\d/))
    type(seg('Minutes'), '3', '0')
    expect(onValueChange).toHaveBeenLastCalledWith('14:30')
  })

  it('treats a first digit too large for a second as the whole number and advances', () => {
    render(<TimePicker />)
    type(seg('Hours'), '3')
    expect(seg('Hours')).toHaveValue('03')
    expect(seg('Minutes')).toHaveFocus()
    type(seg('Minutes'), '7')
    expect(seg('Minutes')).toHaveValue('07')
  })

  it('clamps a two-digit entry into the segment range rather than rejecting it', () => {
    render(<TimePicker />)
    type(seg('Hours'), '2', '9')
    expect(seg('Hours')).toHaveValue('23')
  })

  it('swallows letters in a numeric segment', () => {
    render(<TimePicker defaultValue="10:00" />)
    type(seg('Hours'), 'x')
    expect(seg('Hours')).toHaveValue('10')
  })

  it('Backspace clears the segment, then moves back from an empty one', () => {
    render(<TimePicker defaultValue="10:20" />)
    type(seg('Minutes'), 'Backspace')
    expect(seg('Minutes')).toHaveValue('--')
    type(seg('Minutes'), 'Backspace')
    expect(seg('Hours')).toHaveFocus()
  })
})

describe('TimePicker · stepping and navigation', () => {
  it('ArrowUp and ArrowDown step and wrap at the bounds', () => {
    const onValueChange = vi.fn()
    render(<TimePicker defaultValue="23:59" onValueChange={onValueChange} />)
    type(seg('Hours'), 'ArrowUp')
    expect(seg('Hours')).toHaveValue('00')
    type(seg('Minutes'), 'ArrowUp')
    expect(seg('Minutes')).toHaveValue('00')
    type(seg('Minutes'), 'ArrowDown')
    expect(seg('Minutes')).toHaveValue('59')
    expect(onValueChange).toHaveBeenLastCalledWith('00:59')
  })

  it('arrows, Home and End move between segments', () => {
    render(<TimePicker withSeconds />)
    type(seg('Hours'), 'ArrowRight')
    expect(seg('Minutes')).toHaveFocus()
    type(seg('Minutes'), 'End')
    expect(seg('Seconds')).toHaveFocus()
    type(seg('Seconds'), 'Home')
    expect(seg('Hours')).toHaveFocus()
    type(seg('Hours'), 'ArrowLeft')
    expect(seg('Hours')).toHaveFocus()
  })
})

describe('TimePicker · 12-hour display over a 24-hour value', () => {
  it('shows 12-hour digits and a period, but reports 24-hour', () => {
    const onValueChange = vi.fn()
    render(<TimePicker defaultValue="14:30" hourCycle={12} onValueChange={onValueChange} />)
    expect(seg('Hours')).toHaveValue('02')
    expect(seg('AM or PM')).toHaveValue('PM')
    type(seg('AM or PM'), 'a')
    expect(seg('AM or PM')).toHaveValue('AM')
    expect(onValueChange).toHaveBeenLastCalledWith('02:30')
    type(seg('AM or PM'), 'ArrowUp')
    expect(onValueChange).toHaveBeenLastCalledWith('14:30')
  })

  it('midnight shows as 12 AM and noon as 12 PM', () => {
    const { rerender } = render(<TimePicker hourCycle={12} value="00:15" />)
    expect(seg('Hours')).toHaveValue('12')
    expect(seg('AM or PM')).toHaveValue('AM')
    rerender(<TimePicker hourCycle={12} value="12:15" />)
    expect(seg('Hours')).toHaveValue('12')
    expect(seg('AM or PM')).toHaveValue('PM')
  })
})

describe('TimePicker · bounds, states, control', () => {
  it('clamps a committed value into min and max instead of refusing keystrokes', () => {
    const onValueChange = vi.fn()
    render(<TimePicker max="17:00" min="09:30" onValueChange={onValueChange} />)
    type(seg('Hours'), '0', '8')
    type(seg('Minutes'), '0', '0')
    expect(onValueChange).toHaveBeenLastCalledWith('09:30')
    type(seg('Hours'), '2', '2')
    expect(onValueChange).toHaveBeenLastCalledWith('17:00')
  })

  it('ignores keys when disabled or read-only', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <TimePicker defaultValue="10:00" disabled onValueChange={onValueChange} />,
    )
    type(seg('Hours'), 'ArrowUp')
    rerender(<TimePicker defaultValue="10:00" onValueChange={onValueChange} readOnly />)
    type(seg('Hours'), 'ArrowUp')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('marks every segment invalid from one prop', () => {
    render(<TimePicker invalid />)
    expect(seg('Hours')).toHaveAttribute('aria-invalid', 'true')
    expect(seg('Minutes')).toHaveAttribute('aria-invalid', 'true')
  })

  it('is controlled when value is given', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<TimePicker onValueChange={onValueChange} value="10:00" />)
    type(seg('Hours'), 'ArrowUp')
    expect(onValueChange).toHaveBeenLastCalledWith('11:00')
    // Not applied by the component - the parent decides.
    expect(seg('Hours')).toHaveValue('10')
    rerender(<TimePicker onValueChange={onValueChange} value="11:00" />)
    expect(seg('Hours')).toHaveValue('11')
  })

  it('has no axe violations in both hour cycles', async () => {
    const { container } = render(<TimePicker aria-label="Start" defaultValue="09:30" />)
    expect(await axe(container)).toHaveNoViolations()
    const twelve = render(
      <TimePicker aria-label="End" defaultValue="18:00" hourCycle={12} withSeconds />,
    )
    expect(await axe(twelve.container)).toHaveNoViolations()
  })
})
