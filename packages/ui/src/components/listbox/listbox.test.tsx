/**
 * Listbox.
 *
 * The WAI-ARIA listbox pattern with roving focus, in both selection modes. Single mode is
 * "selection follows focus" like a native select; multi mode keeps the two apart so a
 * keyboard user can move without changing anything. Both are exercised through the keys a
 * user would actually press, plus the form and controlled contracts.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Listbox, type ListboxOption } from './listbox'

const FRUIT: ListboxOption[] = [
  { value: 'apple', label: 'Apple', description: 'Crisp' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
]

const options = () => screen.getAllByRole('option')
const option = (name: RegExp) => screen.getByRole('option', { name })
const focusedText = () => (document.activeElement as HTMLElement).textContent

describe('Listbox · structure', () => {
  it('renders with zero props as an empty, named-by-nothing listbox with an inert message', () => {
    render(<Listbox />)
    const box = screen.getByRole('listbox')
    expect(box).toHaveAttribute('data-size', 'md')
    expect(box).not.toHaveAttribute('aria-multiselectable')
    expect(screen.getByRole('option', { name: 'No options' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('has listbox semantics: named options, aria-selected on each, disabled announced not removed', () => {
    render(<Listbox label="Fruit" options={FRUIT} />)
    expect(screen.getByRole('listbox', { name: 'Fruit' })).toBeInTheDocument()
    expect(options()).toHaveLength(4)
    for (const o of options()) expect(o).toHaveAttribute('aria-selected', 'false')
    expect(option(/Banana/)).toHaveAttribute('aria-disabled', 'true')
    expect(option(/Banana/)).toHaveAttribute('tabindex', '-1')
    // The label names the option; the description describes it, so AT reads them apart.
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAccessibleDescription('Crisp')
    expect(screen.getByRole('option', { name: 'Cherry' })).not.toHaveAttribute('aria-describedby')
  })

  it('supports labelledBy, size, invalid, required and merges className/style', () => {
    render(
      <>
        <h2 id="h">Pick</h2>
        <Listbox
          labelledBy="h"
          options={FRUIT}
          size="lg"
          invalid
          required
          className="mine"
          style={{ margin: 4 }}
          data-x="y"
        />
      </>,
    )
    const box = screen.getByRole('listbox', { name: 'Pick' })
    expect(box).toHaveAttribute('data-size', 'lg')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAttribute('data-invalid')
    expect(box).toHaveAttribute('aria-required', 'true')
    expect(box).toHaveClass('vk-listbox', 'mine')
    expect(box).toHaveStyle({ margin: '4px' })
    expect(box).toHaveAttribute('data-x', 'y')
  })

  it('exactly one enabled option is in the tab order', () => {
    render(<Listbox label="Fruit" options={FRUIT} defaultValue="cherry" />)
    const tabbable = options().filter((o) => o.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveTextContent('Cherry')
  })
})

describe('Listbox · single select', () => {
  it('click selects one and reports it; clicking a disabled option does nothing', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} onValueChange={onValueChange} />)
    fireEvent.click(option(/Cherry/))
    expect(onValueChange).toHaveBeenLastCalledWith('cherry')
    expect(option(/Cherry/)).toHaveAttribute('aria-selected', 'true')
    expect(option(/Cherry/)).toHaveAttribute('data-state', 'checked')
    fireEvent.click(option(/Banana/))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    fireEvent.click(option(/Apple/))
    expect(onValueChange).toHaveBeenLastCalledWith('apple')
    expect(option(/Cherry/)).toHaveAttribute('aria-selected', 'false')
  })

  it('arrows move focus and selection follows, skipping disabled and wrapping', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} onValueChange={onValueChange} />)
    const first = option(/Apple/)
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    expect(focusedText()).toBe('Cherry')
    expect(onValueChange).toHaveBeenLastCalledWith('cherry')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' })
    expect(focusedText()).toBe('Date')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' })
    expect(focusedText()).toBe('AppleCrisp')
    expect(onValueChange).toHaveBeenLastCalledWith('apple')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' })
    expect(focusedText()).toBe('Date')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' })
    expect(onValueChange).toHaveBeenLastCalledWith('apple')
  })

  it('does not wrap when loop is off', () => {
    render(<Listbox label="Fruit" options={FRUIT} loop={false} defaultValue="date" />)
    const last = option(/Date/)
    last.focus()
    fireEvent.keyDown(last, { key: 'ArrowDown' })
    expect(focusedText()).toBe('Date')
  })

  it('Space or Enter selects the focused option when nothing is selected yet', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} onValueChange={onValueChange} />)
    option(/Apple/).focus()
    fireEvent.keyDown(option(/Apple/), { key: ' ' })
    expect(onValueChange).toHaveBeenLastCalledWith('apple')
    fireEvent.keyDown(option(/Apple/), { key: 'Enter' })
    // Selecting the already-selected option again is not a change.
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('typeahead jumps to a matching label and selects it', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} onValueChange={onValueChange} />)
    option(/Apple/).focus()
    fireEvent.keyDown(option(/Apple/), { key: 'd' })
    expect(focusedText()).toBe('Date')
    expect(onValueChange).toHaveBeenLastCalledWith('date')
  })

  it('emits one hidden input with the value, or an empty one, when named', () => {
    const { container, rerender } = render(<Listbox label="Fruit" options={FRUIT} name="fruit" />)
    let hidden = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')
    expect(hidden).toHaveLength(1)
    expect(hidden[0]).toHaveValue('')
    rerender(<Listbox label="Fruit" options={FRUIT} name="fruit" value="cherry" />)
    hidden = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')
    expect(hidden).toHaveLength(1)
    expect(hidden[0]).toHaveAttribute('name', 'fruit')
    expect(hidden[0]).toHaveValue('cherry')
  })

  it('is controllable: value drives the UI and null clears it', () => {
    function Harness() {
      const [v, setV] = useState<string | null>('apple')
      return (
        <>
          <Listbox label="Fruit" options={FRUIT} value={v} onValueChange={setV} />
          <button type="button" onClick={() => setV(null)}>
            clear
          </button>
        </>
      )
    }
    render(<Harness />)
    expect(option(/Apple/)).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(option(/Date/))
    expect(option(/Date/)).toHaveAttribute('aria-selected', 'true')
    expect(option(/Apple/)).toHaveAttribute('aria-selected', 'false')
    fireEvent.click(screen.getByText('clear'))
    for (const o of options()) expect(o).toHaveAttribute('aria-selected', 'false')
  })
})

describe('Listbox · multiple select', () => {
  it('is announced multiselectable; click and Space toggle; arrows alone do not change anything', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} multiple onValueChange={onValueChange} />)
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    fireEvent.click(option(/Apple/))
    expect(onValueChange).toHaveBeenLastCalledWith(['apple'])
    fireEvent.click(option(/Cherry/))
    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry'])
    fireEvent.click(option(/Apple/))
    expect(onValueChange).toHaveBeenLastCalledWith(['cherry'])
    option(/Cherry/).focus()
    fireEvent.keyDown(option(/Cherry/), { key: 'ArrowDown' })
    expect(focusedText()).toBe('Date')
    expect(onValueChange).toHaveBeenCalledTimes(3)
    fireEvent.keyDown(option(/Date/), { key: ' ' })
    expect(onValueChange).toHaveBeenLastCalledWith(['cherry', 'date'])
  })

  it('Shift+Arrow moves and toggles; Ctrl+A selects every enabled option', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} multiple onValueChange={onValueChange} />)
    option(/Apple/).focus()
    fireEvent.keyDown(option(/Apple/), { key: 'ArrowDown', shiftKey: true })
    expect(focusedText()).toBe('Cherry')
    expect(onValueChange).toHaveBeenLastCalledWith(['cherry'])
    fireEvent.keyDown(option(/Cherry/), { key: 'a', ctrlKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry', 'date'])
  })

  it('Shift+click selects the range from the last plain click, skipping disabled', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} multiple onValueChange={onValueChange} />)
    fireEvent.click(option(/Apple/))
    fireEvent.click(option(/Date/), { shiftKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry', 'date'])
  })

  it('emits one hidden input per selected value and none when empty', () => {
    const { container } = render(
      <Listbox
        label="Fruit"
        options={FRUIT}
        multiple
        name="fruit"
        defaultValue={['apple', 'date']}
      />,
    )
    const hidden = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')
    expect([...hidden].map((h) => h.value)).toEqual(['apple', 'date'])
    for (const h of hidden) expect(h).toHaveAttribute('name', 'fruit')
    const empty = render(<Listbox label="Other" options={FRUIT} multiple name="o" />)
    expect(empty.container.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })
})

describe('Listbox · disabled and a11y', () => {
  it('a disabled listbox takes every option out of the tab order and ignores input', () => {
    const onValueChange = vi.fn()
    render(<Listbox label="Fruit" options={FRUIT} disabled onValueChange={onValueChange} />)
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-disabled', 'true')
    for (const o of options()) expect(o).toHaveAttribute('tabindex', '-1')
    fireEvent.click(option(/Apple/))
    fireEvent.keyDown(option(/Apple/), { key: ' ' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('has no axe violations, single and multiple', async () => {
    const { container } = render(
      <>
        <Listbox label="Fruit" options={FRUIT} defaultValue="apple" />
        <Listbox label="Toppings" options={FRUIT} multiple defaultValue={['cherry']} />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
