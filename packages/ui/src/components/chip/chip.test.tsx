/**
 * Chip.
 *
 * The element changes with the job — span, toggle button, or span-plus-remove-button —
 * and the illegal fourth shape (a toggle that is also removable = a button inside a
 * button) must be impossible. Most of these tests pin the shape rules.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Chip } from './chip'

describe('Chip · shapes', () => {
  it('is a plain span when static — nothing focusable, nothing announced as a control', () => {
    const { container } = render(<Chip>Design</Chip>)
    const chip = container.querySelector('.vk-chip')
    expect(chip?.tagName).toBe('SPAN')
    expect(chip).not.toHaveAttribute('tabindex')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('is a real aria-pressed button when selectable', () => {
    render(<Chip selectable>Active only</Chip>)
    const chip = screen.getByRole('button', { name: 'Active only' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('supports the controlled selection triple', () => {
    const onSelectedChange = vi.fn()
    const { rerender } = render(
      <Chip onSelectedChange={onSelectedChange} selectable selected={false}>
        Filter
      </Chip>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onSelectedChange).toHaveBeenCalledWith(true)
    // Controlled: the prop is the only source of truth.
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    rerender(
      <Chip onSelectedChange={onSelectedChange} selectable selected>
        Filter
      </Chip>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders a separate remove button, never a button inside a button', () => {
    const onRemove = vi.fn()
    const { container } = render(
      <Chip onRemove={onRemove} removeLabel="Remove Design">
        Design
      </Chip>,
    )
    // Root stays a span; the only button is the remover.
    expect(container.querySelector('.vk-chip')?.tagName).toBe('SPAN')
    fireEvent.click(screen.getByRole('button', { name: 'Remove Design' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(container.querySelector('button button')).toBeNull()
  })

  it('removal wins over selectable — the illegal combination cannot render', () => {
    // A toggle that is also removable would nest interactive elements. Removal wins.
    const { container } = render(
      <Chip onRemove={() => {}} selectable>
        Both
      </Chip>,
    )
    expect(container.querySelector('.vk-chip')?.tagName).toBe('SPAN')
    expect(container.querySelectorAll('button')).toHaveLength(1) // only the remover
    expect(container.querySelector('[aria-pressed]')).toBeNull()
  })
})

describe('Chip · keyboard', () => {
  it('Delete and Backspace on the focused chip remove it, matching TagInput', () => {
    const onRemove = vi.fn()
    const { container } = render(<Chip onRemove={onRemove}>Tag</Chip>)
    const chip = container.querySelector('.vk-chip') as HTMLElement
    expect(chip.tabIndex).toBe(0)
    fireEvent.keyDown(chip, { key: 'Delete' })
    fireEvent.keyDown(chip, { key: 'Backspace' })
    expect(onRemove).toHaveBeenCalledTimes(2)
  })

  it('a disabled removable chip leaves the tab order and ignores keys', () => {
    const onRemove = vi.fn()
    const { container } = render(
      <Chip disabled onRemove={onRemove}>
        Locked
      </Chip>,
    )
    const chip = container.querySelector('.vk-chip') as HTMLElement
    expect(chip).not.toHaveAttribute('tabindex')
    fireEvent.keyDown(chip, { key: 'Delete' })
    expect(onRemove).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
  })
})

describe('Chip · presentation props', () => {
  it('exposes size and tone as data attributes for the stylesheet', () => {
    const { container } = render(
      <Chip size="sm" tone="success">
        Shipped
      </Chip>,
    )
    const chip = container.querySelector('.vk-chip')
    expect(chip).toHaveAttribute('data-size', 'sm')
    expect(chip).toHaveAttribute('data-tone', 'success')
  })

  it('hides the icon from assistive tech — the label is the name', () => {
    const { container } = render(<Chip icon={<svg role="img" aria-label="leak" />}>Ok</Chip>)
    expect(container.querySelector('.vk-chip__icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges className and forwards rest per the contract', () => {
    const { container } = render(
      <Chip className="mine" data-testid="chip-root">
        X
      </Chip>,
    )
    const chip = screen.getByTestId('chip-root')
    expect(chip).toHaveClass('vk-chip', 'mine')
    expect(container.querySelector('.mine')).toBe(chip)
  })

  it('has no axe violations in any shape', async () => {
    const { container } = render(
      <div>
        <Chip>Static</Chip>
        <Chip selectable>Toggle</Chip>
        <Chip onRemove={() => {}} removeLabel="Remove tag">
          Removable
        </Chip>
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
