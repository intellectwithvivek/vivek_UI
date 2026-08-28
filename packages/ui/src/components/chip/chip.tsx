'use client'

import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { cx } from '../../utils/cx'

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onSelect'> {
  children: ReactNode
  /** Leading glyph. Decorative — the label is the name. */
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  /**
   * Renders a remove button and makes Delete/Backspace on the focused chip fire it —
   * the same keyboard contract TagInput's chips follow.
   */
  onRemove?: () => void
  /** Accessible name of the remove button. The visible x says nothing to a reader. */
  removeLabel?: string
  /**
   * Makes the chip a toggle — a real `<button aria-pressed>`, so a filter bar of chips
   * is operable and announced correctly for free.
   */
  selectable?: boolean
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
}

/**
 * A chip — a compact, labelled object: a filter, a tag, a recipient.
 *
 * Three shapes, and the element changes with the job:
 *
 * - **Static** (`<span>`): a coloured label, nothing interactive.
 * - **Selectable** (`<button aria-pressed>`): a toggle. The pressed state is real ARIA,
 *   not a colour change, so a filter bar reads correctly.
 * - **Removable** (`<span>` + nested `<button>`): the remove control is its OWN button
 *   beside the label, never a button inside a button — which is why `selectable` and
 *   `onRemove` are mutually exclusive. A chip that must toggle *and* be removable is two
 *   controls, and pretending otherwise produces nested interactive elements that fail
 *   both HTML validation and every screen reader. When both are passed, removal wins and
 *   the selection props are ignored.
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    children,
    icon,
    size = 'md',
    tone = 'neutral',
    disabled,
    onRemove,
    removeLabel = 'Remove',
    selectable,
    selected: selectedProp,
    defaultSelected = false,
    onSelectedChange,
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const [selected, setSelected] = useControllableState<boolean>({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: (next) => onSelectedChange?.(next),
  })

  const removable = typeof onRemove === 'function'
  const toggles = Boolean(selectable) && !removable

  const shared = {
    className: cx('vk-chip', className),
    'data-size': size,
    'data-tone': tone,
    'data-disabled': disabled || undefined,
  }

  const body = (
    <>
      {icon ? (
        <span className="vk-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="vk-chip__label">{children}</span>
    </>
  )

  if (toggles) {
    return (
      <button
        // The as-cast is the ref changing element kind with the chip's shape; the public
        // type stays the span, which both shapes satisfy structurally for consumers.
        ref={ref as React.Ref<HTMLButtonElement> as never}
        type="button"
        aria-pressed={selected}
        data-selected={selected || undefined}
        disabled={disabled}
        onClick={() => setSelected(!selected)}
        {...shared}
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        {body}
      </button>
    )
  }

  const onChipKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !removable || disabled) return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onRemove()
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the remove button inside is the interactive element; Delete/Backspace on the focused chip is a shortcut to it, matching TagInput.
    <span
      ref={ref}
      // Focusable when removable, so Delete/Backspace have somewhere to land.
      tabIndex={removable && !disabled ? 0 : undefined}
      onKeyDown={removable ? onChipKeyDown : onKeyDown}
      {...shared}
      {...rest}
    >
      {body}
      {removable ? (
        <button
          type="button"
          className="vk-chip__remove"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <span className="vk-chip__cross" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  )
})
