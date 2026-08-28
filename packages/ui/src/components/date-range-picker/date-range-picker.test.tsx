/**
 * DateRangePicker.
 *
 * Calendar's range logic and DatePicker's popup are both tested where they live; this file
 * covers the wiring that joins them and the one behaviour neither owns — a half-picked
 * range must never escape the popup as a submitted value.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { DateRangePicker } from './date-range-picker'

const jan = (day: number) => new Date(2026, 0, day)
const SEED = { start: jan(10), end: jan(12) }

/**
 * Days are found by their ISO data attribute, never by their spoken name: the name comes
 * from Intl and differs per host locale (this suite first failed on an en-IN machine, where
 * the cell reads "20 January 2026"). Where a spoken string IS the assertion, the component is
 * given an explicit locale so the expectation holds on every machine and in CI.
 */
const day = (n: number) => {
  const cell = document.querySelector<HTMLButtonElement>(
    `[data-vk-day="2026-01-${String(n).padStart(2, '0')}"]`,
  )
  if (!cell) throw new Error(`no calendar cell for January ${n}`)
  return cell
}
const trigger = () => screen.getByRole('button', { name: /Date range/ })

describe('DateRangePicker · the field', () => {
  it('shows both placeholders when empty and speaks the emptiness', () => {
    render(<DateRangePicker />)
    expect(screen.getByText('Start date')).toBeInTheDocument()
    expect(screen.getByText('End date')).toBeInTheDocument()
    expect(trigger()).toHaveAccessibleName(/no dates selected/)
  })

  it('renders an ISO range deterministically and speaks it in words', () => {
    render(<DateRangePicker defaultValue={SEED} locale="en-US" />)
    expect(screen.getByText('2026-01-10')).toBeInTheDocument()
    expect(screen.getByText('2026-01-12')).toBeInTheDocument()
    // The screen text is two terse strings; the name is what a screen reader gets.
    expect(trigger()).toHaveAccessibleName(/January 10, 2026 to .*January 12, 2026/)
  })

  it('uses a supplied format for the visible text', () => {
    render(<DateRangePicker defaultValue={SEED} format={(d) => `day ${d.getDate()}`} />)
    expect(screen.getByText('day 10')).toBeInTheDocument()
    expect(screen.getByText('day 12')).toBeInTheDocument()
  })

  it('submits two ISO hidden fields, matching Calendar range mode', () => {
    const { container } = render(<DateRangePicker defaultValue={SEED} name="stay" />)
    expect(container.querySelector('input[name="stay-start"]')).toHaveValue('2026-01-10')
    expect(container.querySelector('input[name="stay-end"]')).toHaveValue('2026-01-12')
  })

  it('submits empty strings, not the word null, when nothing is chosen', () => {
    const { container } = render(<DateRangePicker name="stay" />)
    expect(container.querySelector('input[name="stay-start"]')).toHaveValue('')
  })

  it('wires invalid onto the trigger and exposes required as a styling hook', () => {
    // aria-required is not valid on a button, so required is a data attribute here; Field
    // renders the visible marker from the same prop.
    render(<DateRangePicker invalid required />)
    expect(trigger()).toHaveAttribute('aria-invalid', 'true')
    expect(trigger()).toHaveAttribute('data-required')
  })

  it('forwards its ref to the trigger button and spreads rest onto the root', () => {
    const ref = createRef<HTMLButtonElement>()
    const { container } = render(<DateRangePicker data-testid="root" ref={ref} />)
    expect(ref.current?.tagName).toBe('BUTTON')
    expect(container.firstElementChild).toHaveAttribute('data-testid', 'root')
  })
})

describe('DateRangePicker · the popup', () => {
  it('opens on click with dialog semantics and puts focus on a day', () => {
    render(<DateRangePicker defaultValue={SEED} />)
    fireEvent.click(trigger())
    const dialog = screen.getByRole('dialog', { name: 'Date range' })
    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    expect(trigger()).toHaveAttribute('aria-controls', dialog.id)
    // The calendar's own tab stop, not the panel: arrows work on the first keystroke.
    expect(document.activeElement).toHaveAttribute('data-vk-day')
  })

  it('opens on ArrowDown, the platform convention for a closed picker', () => {
    render(<DateRangePicker />)
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('stays open after the first day and closes on the second, reporting the range', () => {
    const onValueChange = vi.fn()
    render(<DateRangePicker defaultValue={SEED} onValueChange={onValueChange} />)
    fireEvent.click(trigger())

    fireEvent.click(day(20))
    // Half a range: the picker is mid-selection, so the popup must stay.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith({ start: jan(20), end: null })

    fireEvent.click(day(25))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith({ start: jan(20), end: jan(25) })
    expect(screen.getByText('2026-01-20')).toBeInTheDocument()
    expect(screen.getByText('2026-01-25')).toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it('swaps the ends when the second click lands before the first', () => {
    const onValueChange = vi.fn()
    render(<DateRangePicker defaultValue={SEED} onValueChange={onValueChange} />)
    fireEvent.click(trigger())
    fireEvent.click(day(25))
    fireEvent.click(day(20))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: jan(20), end: jan(25) })
  })

  it('Escape discards a half-picked start and restores the last complete range', () => {
    // The defect every range picker ships once: one date of two reaches the form.
    const onValueChange = vi.fn()
    render(<DateRangePicker defaultValue={SEED} onValueChange={onValueChange} />)
    fireEvent.click(trigger())
    fireEvent.click(day(20))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: jan(20), end: null })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith(SEED)
    expect(screen.getByText('2026-01-10')).toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it('a disabled field does not open', () => {
    render(<DateRangePicker disabled />)
    fireEvent.click(trigger())
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is controlled when value is given: the prop is the only source of truth', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<DateRangePicker onValueChange={onValueChange} value={SEED} />)
    fireEvent.click(trigger())
    fireEvent.click(day(20))
    expect(onValueChange).toHaveBeenCalled()
    // Not applied by the component - the parent decides.
    expect(screen.getByText('2026-01-10')).toBeInTheDocument()

    rerender(
      <DateRangePicker onValueChange={onValueChange} value={{ start: jan(3), end: jan(4) }} />,
    )
    expect(screen.getByText('2026-01-03')).toBeInTheDocument()
  })

  it('respects min and max through the hosted Calendar', () => {
    render(<DateRangePicker defaultValue={SEED} max={jan(15)} />)
    fireEvent.click(trigger())
    expect(day(20)).toBeDisabled()
    expect(day(14)).not.toBeDisabled()
  })

  it('has no axe violations, closed and open', async () => {
    const { container } = render(<DateRangePicker defaultValue={SEED} />)
    expect(await axe(container)).toHaveNoViolations()
    fireEvent.click(trigger())
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
