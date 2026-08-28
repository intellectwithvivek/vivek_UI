/**
 * Segmented.
 *
 * This component exists because the docs shipped Tabs dressed up as a toggle — tablist
 * semantics, dangling aria-controls, no panels — so the first tests here pin the
 * semantics: it is a radio group, and nothing about tabs or pressed-buttons may leak in.
 * The rest cover the radio keyboard contract (one tab stop, arrows move AND select),
 * both state modes, and the ways a disabled segment can silently break the tab order.
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Segmented, type SegmentedOption } from './segmented'

const OPTIONS: SegmentedOption[] = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'timeline', label: 'Timeline' },
]

const setup = (props: Partial<React.ComponentProps<typeof Segmented>> = {}) =>
  render(<Segmented label="View" options={OPTIONS} {...props} />)

const radio = (name: string) => screen.getByRole('radio', { name })

function press(target: HTMLElement, key: string) {
  target.focus()
  fireEvent.keyDown(target, { key })
}

describe('Segmented · semantics', () => {
  it('is a named radio group with one radio per option', () => {
    setup()
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('carries no tab or toggle-button semantics — the bug it replaces', () => {
    // The docs used pill Tabs as a toggle and shipped aria-controls pointing at panels
    // that did not exist. This control must never be mistakable for that.
    const { container } = setup({ defaultValue: 'list' })
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-controls]')).toBeNull()
    expect(container.querySelector('[aria-pressed]')).toBeNull()
    expect(container.querySelector('[aria-selected]')).toBeNull()
  })

  it('checks exactly the selected segment', () => {
    setup({ defaultValue: 'board' })
    expect(radio('Board')).toBeChecked()
    expect(radio('List')).not.toBeChecked()
    expect(radio('Timeline')).not.toBeChecked()
  })

  it('keeps the icon out of the accessible name', () => {
    // The icon is decoration next to a visible label; letting it into the name would
    // make a screen reader read "star List" for a segment sighted users call "List".
    setup({ options: [{ value: 'list', label: 'List', icon: '★' }, ...OPTIONS.slice(1)] })
    expect(screen.getByRole('radio', { name: 'List' })).toBeInTheDocument()
  })

  it('renders an empty group without crashing when there are no options', () => {
    render(<Segmented label="View" options={[]} />)
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })
})

describe('Segmented · one tab stop', () => {
  it('puts the tab stop on the checked segment and nowhere else', () => {
    setup({ defaultValue: 'board' })
    expect(radio('Board')).toHaveAttribute('tabindex', '0')
    expect(radio('List')).toHaveAttribute('tabindex', '-1')
    expect(radio('Timeline')).toHaveAttribute('tabindex', '-1')
  })

  it('falls back to the first enabled segment when nothing is checked yet', () => {
    setup({
      options: [{ value: 'list', label: 'List', disabled: true }, ...OPTIONS.slice(1)],
    })
    expect(radio('List')).toHaveAttribute('tabindex', '-1')
    expect(radio('Board')).toHaveAttribute('tabindex', '0')
  })

  it('moves the stop off a checked segment that has since been disabled', () => {
    // A disabled button is unfocusable no matter its tabindex, so leaving the stop on it
    // would make the whole group unreachable by keyboard.
    setup({
      value: 'board',
      options: [
        OPTIONS[0] as SegmentedOption,
        { value: 'board', label: 'Board', disabled: true },
        OPTIONS[2] as SegmentedOption,
      ],
    })
    expect(radio('Board')).toHaveAttribute('tabindex', '-1')
    expect(radio('List')).toHaveAttribute('tabindex', '0')
  })
})

describe('Segmented · keyboard', () => {
  it('ArrowRight selects the next segment, not merely focuses it', () => {
    // This is the line between a radio group and tabs-with-manual-activation: on a
    // radio, landing IS choosing.
    const onValueChange = vi.fn()
    setup({ defaultValue: 'list', onValueChange })
    press(radio('List'), 'ArrowRight')
    expect(onValueChange).toHaveBeenCalledWith('board')
    expect(radio('Board')).toBeChecked()
    expect(radio('Board')).toHaveFocus()
  })

  it('ArrowLeft wraps from the first segment to the last', () => {
    setup({ defaultValue: 'list' })
    press(radio('List'), 'ArrowLeft')
    expect(radio('Timeline')).toBeChecked()
    expect(radio('Timeline')).toHaveFocus()
  })

  it('treats Down and Up as Right and Left, per the radio pattern', () => {
    setup({ defaultValue: 'board' })
    press(radio('Board'), 'ArrowDown')
    expect(radio('Timeline')).toBeChecked()
    press(radio('Timeline'), 'ArrowUp')
    expect(radio('Board')).toBeChecked()
  })

  it('skips disabled segments instead of landing on them', () => {
    setup({
      defaultValue: 'list',
      options: [
        OPTIONS[0] as SegmentedOption,
        { value: 'board', label: 'Board', disabled: true },
        OPTIONS[2] as SegmentedOption,
      ],
    })
    press(radio('List'), 'ArrowRight')
    expect(radio('Timeline')).toBeChecked()
    expect(radio('Board')).not.toBeChecked()
  })

  it('Home and End select the first and last enabled segments', () => {
    setup({
      defaultValue: 'board',
      options: [
        { value: 'a', label: 'A', disabled: true },
        { value: 'list', label: 'List' },
        { value: 'board', label: 'Board' },
        { value: 'z', label: 'Z', disabled: true },
      ],
    })
    press(radio('Board'), 'Home')
    expect(radio('List')).toBeChecked()
    press(radio('List'), 'End')
    expect(radio('Board')).toBeChecked()
  })

  it('claims the arrow keys even with nowhere to go, so the page never scrolls', () => {
    setup({ defaultValue: 'list', options: [{ value: 'list', label: 'List' }] })
    const only = radio('List')
    only.focus()
    // fireEvent returns false when preventDefault was called — the scroll was eaten.
    expect(fireEvent.keyDown(only, { key: 'ArrowDown' })).toBe(false)
  })
})

describe('Segmented · state', () => {
  it('works uncontrolled: click selects, and the value is reported', () => {
    const onValueChange = vi.fn()
    setup({ defaultValue: 'list', onValueChange })
    fireEvent.click(radio('Timeline'))
    expect(radio('Timeline')).toBeChecked()
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('timeline')
  })

  it('works controlled: reports the intent but only the prop moves the selection', () => {
    const onValueChange = vi.fn()
    const { rerender } = setup({ value: 'list', onValueChange })
    fireEvent.click(radio('Board'))
    expect(onValueChange).toHaveBeenCalledWith('board')
    // The parent has not re-rendered, so the checked segment must not move.
    expect(radio('List')).toBeChecked()
    expect(radio('Board')).not.toBeChecked()
    rerender(<Segmented label="View" options={OPTIONS} value="board" />)
    expect(radio('Board')).toBeChecked()
  })

  it('reports nothing when the already-checked segment is clicked again', () => {
    // A radio clicked twice is still on; firing here would make every consumer that
    // toggles fetches or routes off onValueChange re-run them for a non-change.
    const onValueChange = vi.fn()
    setup({ defaultValue: 'list', onValueChange })
    fireEvent.click(radio('List'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('ignores clicks on a disabled segment', () => {
    const onValueChange = vi.fn()
    setup({
      defaultValue: 'list',
      onValueChange,
      options: [
        OPTIONS[0] as SegmentedOption,
        { value: 'board', label: 'Board', disabled: true },
        OPTIONS[2] as SegmentedOption,
      ],
    })
    fireEvent.click(radio('Board'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(radio('List')).toBeChecked()
  })

  it('disables every segment when the group is disabled', () => {
    const onValueChange = vi.fn()
    setup({ disabled: true, defaultValue: 'list', onValueChange })
    for (const segment of screen.getAllByRole('radio')) expect(segment).toBeDisabled()
    fireEvent.click(radio('Board'))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Segmented · thumb', () => {
  it('renders no thumb until something is selected', () => {
    // Mounting it at segment zero would animate a choice nobody made on first click.
    const { container } = setup()
    expect(container.querySelector('.vk-segmented__thumb')).toBeNull()
  })

  it('renders the thumb as pure decoration once selected', () => {
    const { container } = setup({ defaultValue: 'board' })
    expect(container.querySelector('.vk-segmented__thumb')).toHaveAttribute('aria-hidden', 'true')
  })

  it('drives the thumb through custom properties, so CSS needs no per-index rules', () => {
    setup({ defaultValue: 'timeline' })
    const root = screen.getByRole('radiogroup')
    expect(root.style.getPropertyValue('--vk-segmented-index')).toBe('2')
    expect(root.style.getPropertyValue('--vk-segmented-count')).toBe('3')
  })
})

describe('Segmented · §4.1 contract', () => {
  it('merges className and style, and keeps its own custom properties', () => {
    setup({ className: 'mine', style: { color: 'red' } })
    const root = screen.getByRole('radiogroup')
    expect(root).toHaveClass('vk-segmented', 'mine')
    expect(root.style.color).toBe('red')
    expect(root.style.getPropertyValue('--vk-segmented-count')).toBe('3')
  })

  it('spreads rest props and forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Segmented ref={ref} label="View" options={OPTIONS} data-testid="seg" />)
    expect(ref.current).toBe(screen.getByTestId('seg'))
    expect(ref.current).toHaveAttribute('role', 'radiogroup')
  })

  it('exposes size and fullWidth as data attributes, never as class-name variants', () => {
    setup({ size: 'lg', fullWidth: true })
    const root = screen.getByRole('radiogroup')
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-full-width')
  })

  it('has no axe violations, selected or not, with disabled segments in play', async () => {
    const { container } = setup({
      defaultValue: 'list',
      options: [...OPTIONS, { value: 'off', label: 'Off', disabled: true }],
    })
    expect(await axe(container)).toHaveNoViolations()
    const bare = render(<Segmented label="Bare" options={OPTIONS} />)
    expect(await axe(bare.container)).toHaveNoViolations()
  })
})
