/**
 * NumberInput.
 *
 * The component exists because `<input type="number">` misbehaves, so the tests pin the
 * behaviours that make this one different: null-never-NaN, draft-vs-committed value,
 * revert on garbage, clamp on blur, wheel off by default, and the spinbutton keyboard map.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { NumberInput } from './number-input'

const field = () => screen.getByRole('spinbutton') as HTMLInputElement

describe('NumberInput · value model', () => {
  it('renders empty for null and never exposes NaN', () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Qty" onValueChange={onValueChange} />)
    expect(field().value).toBe('')
    fireEvent.change(field(), { target: { value: 'abc' } })
    fireEvent.blur(field())
    // Garbage reverts to the last good value (empty), and no NaN ever escapes.
    expect(field().value).toBe('')
    expect(onValueChange.mock.calls.flat()).not.toContain(Number.NaN)
  })

  it('keeps a draft while typing and commits on blur', () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Qty" onValueChange={onValueChange} />)
    // "-", "1." are legitimate stops on the way to a number; committing them early
    // would make negatives and decimals untypeable.
    fireEvent.change(field(), { target: { value: '-' } })
    expect(onValueChange).not.toHaveBeenCalled()
    fireEvent.change(field(), { target: { value: '-12.5' } })
    fireEvent.blur(field())
    expect(onValueChange).toHaveBeenLastCalledWith(-12.5)
  })

  it('commits on Enter without leaving the field', () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Qty" onValueChange={onValueChange} />)
    fireEvent.change(field(), { target: { value: '42' } })
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onValueChange).toHaveBeenLastCalledWith(42)
  })

  it('reverts garbage to the last committed value, not to text that looks accepted', () => {
    render(<NumberInput aria-label="Qty" defaultValue={7} />)
    fireEvent.change(field(), { target: { value: '7x9' } })
    fireEvent.blur(field())
    expect(field().value).toBe('7')
  })

  it('clamps into range on blur by default, and not when opted out', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <NumberInput aria-label="Qty" max={10} min={0} onValueChange={onValueChange} />,
    )
    fireEvent.change(field(), { target: { value: '250' } })
    fireEvent.blur(field())
    expect(onValueChange).toHaveBeenLastCalledWith(10)

    rerender(
      <NumberInput
        aria-label="Qty"
        clampOnBlur={false}
        max={10}
        min={0}
        onValueChange={onValueChange}
      />,
    )
    fireEvent.change(field(), { target: { value: '250' } })
    fireEvent.blur(field())
    expect(onValueChange).toHaveBeenLastCalledWith(250)
  })

  it('rounds to precision on commit and on step', () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Price" onValueChange={onValueChange} precision={2} step={0.1} />,
    )
    fireEvent.change(field(), { target: { value: '1.005' } })
    fireEvent.blur(field())
    expect(field().value).toBe('1.00')
    fireEvent.keyDown(field(), { key: 'ArrowUp' })
    expect(onValueChange).toHaveBeenLastCalledWith(1.1)
  })

  it('supports the controlled triple', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <NumberInput aria-label="Qty" onValueChange={onValueChange} value={5} />,
    )
    fireEvent.keyDown(field(), { key: 'ArrowUp' })
    expect(onValueChange).toHaveBeenCalledWith(6)
    // Controlled: display follows the prop, not the internal attempt.
    expect(field().value).toBe('5')
    rerender(<NumberInput aria-label="Qty" onValueChange={onValueChange} value={6} />)
    expect(field().value).toBe('6')
  })
})

describe('NumberInput · keyboard (APG spinbutton)', () => {
  it('steps with arrows, 10x with Shift, and Home/End reach the bounds', () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput
        aria-label="Qty"
        defaultValue={50}
        max={100}
        min={0}
        onValueChange={onValueChange}
      />,
    )
    fireEvent.keyDown(field(), { key: 'ArrowUp' })
    expect(onValueChange).toHaveBeenLastCalledWith(51)
    fireEvent.keyDown(field(), { key: 'ArrowDown', shiftKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith(41)
    fireEvent.keyDown(field(), { key: 'Home' })
    expect(onValueChange).toHaveBeenLastCalledWith(0)
    fireEvent.keyDown(field(), { key: 'End' })
    expect(onValueChange).toHaveBeenLastCalledWith(100)
  })

  it('steps never leave the range', () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Qty" defaultValue={10} max={10} onValueChange={onValueChange} />,
    )
    fireEvent.keyDown(field(), { key: 'ArrowUp' })
    expect(onValueChange).toHaveBeenLastCalledWith(10)
  })

  it('carries the spinbutton ARIA: now, min, max, and "empty" as valuetext', () => {
    render(<NumberInput aria-label="Qty" max={9} min={1} />)
    expect(field()).toHaveAttribute('aria-valuemin', '1')
    expect(field()).toHaveAttribute('aria-valuemax', '9')
    expect(field()).toHaveAttribute('aria-valuetext', 'empty')
    fireEvent.change(field(), { target: { value: '3' } })
    fireEvent.blur(field())
    expect(field()).toHaveAttribute('aria-valuenow', '3')
    expect(field()).not.toHaveAttribute('aria-valuetext')
  })
})

describe('NumberInput · pointer', () => {
  it('the steppers nudge the value and are hidden from assistive tech', () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <NumberInput aria-label="Qty" defaultValue={5} onValueChange={onValueChange} />,
    )
    const steppers = container.querySelector('.vk-number-input__steppers') as HTMLElement
    expect(steppers).toHaveAttribute('aria-hidden', 'true')
    const [up, down] = Array.from(steppers.querySelectorAll('button'))
    // Not in the tab order either: the input is the spinbutton.
    expect(up?.tabIndex).toBe(-1)
    fireEvent.pointerDown(up as Element)
    fireEvent.pointerUp(up as Element)
    expect(onValueChange).toHaveBeenLastCalledWith(6)
    fireEvent.pointerDown(down as Element)
    fireEvent.pointerUp(down as Element)
    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('hold-to-repeat keeps stepping until release', () => {
    vi.useFakeTimers()
    try {
      const onValueChange = vi.fn()
      const { container } = render(
        <NumberInput aria-label="Qty" defaultValue={0} onValueChange={onValueChange} />,
      )
      const up = container.querySelector('[data-direction="up"].vk-number-input__step') as Element
      fireEvent.pointerDown(up)
      vi.advanceTimersByTime(500)
      fireEvent.pointerUp(up)
      const calls = onValueChange.mock.calls.length
      expect(calls).toBeGreaterThan(3)
      vi.advanceTimersByTime(500)
      // Released: no further steps.
      expect(onValueChange.mock.calls.length).toBe(calls)
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores the mouse wheel unless explicitly allowed', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <NumberInput aria-label="Qty" defaultValue={5} onValueChange={onValueChange} />,
    )
    field().focus()
    fireEvent.wheel(field(), { deltaY: -100 })
    expect(onValueChange).not.toHaveBeenCalled()

    rerender(
      <NumberInput
        allowMouseWheel
        aria-label="Qty"
        defaultValue={5}
        onValueChange={onValueChange}
      />,
    )
    field().focus()
    fireEvent.wheel(field(), { deltaY: -100 })
    expect(onValueChange).toHaveBeenLastCalledWith(6)
  })
})

describe('NumberInput · a11y', () => {
  it('uses the decimal keyboard on phones and never type="number"', () => {
    render(<NumberInput aria-label="Qty" />)
    expect(field()).toHaveAttribute('inputmode', 'decimal')
    expect(field()).toHaveAttribute('type', 'text')
  })

  it('has no axe violations, empty and filled, valid and invalid', async () => {
    const { container } = render(
      <div>
        <NumberInput aria-label="Empty" />
        <NumberInput aria-label="Filled" defaultValue={12} />
        <NumberInput aria-label="Broken" defaultValue={12} invalid />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
