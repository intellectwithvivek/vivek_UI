'use client'

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useRef,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { cx } from '../../utils/cx'

export interface SegmentedOption {
  value: string
  label: ReactNode
  /** Rendered before the label. Decorative — the label is the accessible name. */
  icon?: ReactNode
  disabled?: boolean
}

export interface SegmentedProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  options: readonly SegmentedOption[]
  /**
   * Required. The group has no visible name — the segments label themselves, not the
   * choice being made — so without this a screen reader announces "radio group" and
   * nothing else.
   */
  label: string
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. Omit it and nothing starts selected. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  /** Stretch to the container, splitting the width equally between segments. */
  fullWidth?: boolean
  disabled?: boolean
}

/**
 * A segmented control: one visible choice from a few, always all on screen.
 *
 * This exists because its absence caused real damage: the docs used `Tabs` with the pill
 * variant as a two-option toggle, which *looks* segmented but carries tablist semantics —
 * every page shipped tabs whose `aria-controls` pointed at panels that did not exist. A
 * segmented control is not tabs (nothing is revealed or hidden) and not a toolbar of
 * toggle buttons (exactly one segment is on). It is a styled radio group, so that is the
 * ARIA it gets: `role="radiogroup"` with `role="radio"` segments and `aria-checked`,
 * never `aria-pressed`, never `aria-selected`.
 *
 * The radio keyboard model follows — one tab stop for the whole group, and the arrows
 * both move focus **and** select, because a radio you land on is a radio you chose:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Tab | Into the group (one stop: the checked segment), then out |
 * | Right / Down | Select the next segment, wrapping |
 * | Left / Up | Select the previous segment, wrapping |
 * | Home / End | Select the first / last segment |
 *
 * Disabled segments are skipped, not landed on. Single-select only — a multi-select
 * strip is `ButtonGroup`'s job, with toggle buttons and `aria-pressed`.
 *
 * The sliding thumb is pure CSS: segments are equal-width grid columns, so the thumb is
 * `100% / count` wide and translated by `index × 100%` of itself. No measuring, no
 * resize observer, and it stays correct when the control reflows.
 */
export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  {
    options,
    label,
    value,
    defaultValue,
    onValueChange,
    size = 'md',
    fullWidth,
    disabled,
    className,
    style,
    ...rest
  },
  ref,
) {
  const segments = useRef<Array<HTMLButtonElement | null>>([])

  const [selected, setSelected] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      // `setSelected` is only ever handed a segment's value, so `next` cannot be
      // undefined here — the guard narrows the type, it does not change behaviour.
      if (next !== undefined) onValueChange?.(next)
    },
  })

  const selectedIndex = options.findIndex((option) => option.value === selected)

  /** Select a segment and move focus onto it, refusing anything unselectable. */
  const select = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option || option.disabled || disabled) return
      // Re-activating the checked segment is not a change: a radio you click twice is
      // still on, and an arrow that wraps back to its origin chose nothing new.
      if (option.value !== selected) setSelected(option.value)
      segments.current[index]?.focus()
    },
    [disabled, options, selected, setSelected],
  )

  /** The nearest enabled index walking `delta` from `from`, wrapping. -1 if none exist. */
  const step = useCallback(
    (from: number, delta: number): number => {
      const count = options.length
      for (let offset = 1; offset <= count; offset += 1) {
        const index = (((from + delta * offset) % count) + count) % count
        const option = options[index]
        if (option && !option.disabled) return index
      }
      return -1
    },
    [options],
  )

  const onSegmentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.defaultPrevented) return

      let target: number
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          target = step(index, 1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          target = step(index, -1)
          break
        case 'Home':
          // Walking forward from "before the first" finds the first enabled segment.
          target = step(-1, 1)
          break
        case 'End':
          target = step(options.length, -1)
          break
        default:
          return
      }

      // The group owns these keys even when there is nowhere to go — otherwise an arrow
      // on a one-segment group scrolls the page out from under the control.
      event.preventDefault()
      if (target !== -1) select(target)
    },
    [options.length, select, step],
  )

  /*
   * Exactly one segment is tabbable: the checked one, per the radio pattern. When nothing
   * is checked yet — or the checked segment has since been disabled, which the native
   * `disabled` attribute would silently drop from the tab order — the stop falls back to
   * the first enabled segment, so the group never becomes unreachable.
   */
  const checked = options[selectedIndex]
  const tabStop =
    checked && !checked.disabled ? selectedIndex : options.findIndex((option) => !option.disabled)

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={cx('vk-segmented', className)}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-disabled={disabled || undefined}
      style={
        {
          // The thumb's whole geometry, so the CSS needs no per-index rules.
          '--vk-segmented-count': Math.max(options.length, 1),
          '--vk-segmented-index': Math.max(selectedIndex, 0),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {/* Purely decorative, and absent until something is selected: sliding in from
          segment zero on first selection would animate a choice nobody made. */}
      {selectedIndex !== -1 ? <span className="vk-segmented__thumb" aria-hidden="true" /> : null}

      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => {
            segments.current[index] = node
          }}
          type="button"
          role="radio"
          aria-checked={index === selectedIndex}
          className="vk-segmented__segment"
          tabIndex={index === tabStop ? 0 : -1}
          disabled={disabled || option.disabled}
          onClick={() => select(index)}
          onKeyDown={(event) => onSegmentKeyDown(event, index)}
        >
          {option.icon ? (
            <span className="vk-segmented__icon" aria-hidden="true">
              {option.icon}
            </span>
          ) : null}
          <span className="vk-segmented__label">{option.label}</span>
        </button>
      ))}
    </div>
  )
})
