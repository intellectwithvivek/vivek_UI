'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { ROVING_ITEM_ATTRIBUTE, useRovingTabIndex } from '../../hooks/use-roving-tab-index'
import { cx } from '../../utils/cx'

export interface ListboxOption {
  value: string
  label: string
  /** Secondary line under the label, exposed as the option's accessible description. */
  description?: string
  disabled?: boolean
}

interface ListboxBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options?: ListboxOption[]
  /**
   * Accessible name. A listbox with no name is announced as "list box" and nothing else,
   * so pass this or `labelledBy`.
   */
  label?: string
  /** `id` of a visible element that names the listbox — instead of `label`. */
  labelledBy?: string
  /** Emits hidden inputs so the selection posts with a plain form. */
  name?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  /** Arrow keys wrap at the ends. Default `true`. */
  loop?: boolean
  /** Typing jumps to the next option whose label starts with what was typed. Default `true`. */
  typeahead?: boolean
  /** Shown when `options` is empty. */
  emptyMessage?: ReactNode
}

export interface ListboxSingleProps extends ListboxBaseProps {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

export interface ListboxMultipleProps extends ListboxBaseProps {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ListboxProps = ListboxSingleProps | ListboxMultipleProps

const ITEM_SELECTOR = `[${ROVING_ITEM_ATTRIBUTE}]`
const TYPEAHEAD_RESET = 600
const NAV_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

function toArray(value: string | string[] | null | undefined): string[] | undefined {
  if (value === undefined) return undefined
  if (value === null) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * A list of options that is always open — the control `<select multiple>` should have been.
 *
 * Follows the WAI-ARIA listbox pattern with roving focus: one option is in the tab order,
 * arrows move between them, and the focused option is what a screen reader reads. In
 * single-select mode selection follows focus, the way a native select behaves. In
 * multi-select mode focus and selection are separate, so a keyboard user can move without
 * changing anything and toggle deliberately.
 *
 * | Key | Single | Multiple |
 * | --- | --- | --- |
 * | ArrowDown / ArrowUp | Move and select | Move |
 * | Home / End | First / last, and select | First / last |
 * | Space / Enter | Select the focused option | Toggle the focused option |
 * | Shift + Arrow | — | Move and toggle |
 * | Ctrl/⌘ + A | — | Select every enabled option |
 * | Shift + click | — | Select the range from the last click |
 * | Type a letter | Jump to the next matching option (and select, in single mode) |
 *
 * Disabled options stay in the list and are announced as unavailable — `aria-disabled`,
 * not removed — and are skipped by the keyboard. With `name`, the selection is emitted as
 * hidden inputs so the listbox posts with an ordinary form.
 */
export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(function Listbox(props, ref) {
  const {
    options = [],
    label,
    labelledBy,
    name,
    size = 'md',
    disabled = false,
    invalid,
    required,
    loop = true,
    typeahead = true,
    emptyMessage = 'No options',
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    className,
    onKeyDown,
    ...rest
  } = props as ListboxBaseProps & {
    multiple?: boolean
    value?: string | string[] | null
    defaultValue?: string | string[] | null
    onValueChange?: (value: never) => void
  }

  const id = useIsomorphicId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const emit = onValueChange as ((next: string | string[] | null) => void) | undefined
  const [selected, setSelected] = useControllableState<string[]>({
    value: toArray(value),
    defaultValue: toArray(defaultValue) ?? [],
    onChange: (next) => emit?.(multiple ? next : (next[0] ?? null)),
  })

  const isSelected = (optionValue: string) => selected.includes(optionValue)
  const enabledValues = () => options.filter((o) => !o.disabled).map((o) => o.value)

  // Guards read this render's `selected`: a no-op must not re-emit onValueChange.
  const select = (optionValue: string) => {
    if (multiple) {
      if (!selected.includes(optionValue)) setSelected([...selected, optionValue])
    } else if (selected.length !== 1 || selected[0] !== optionValue) {
      setSelected([optionValue])
    }
  }
  const toggle = (optionValue: string) => {
    if (!multiple) return select(optionValue)
    setSelected((prev) =>
      prev.includes(optionValue) ? prev.filter((v) => v !== optionValue) : [...prev, optionValue],
    )
  }

  // Start on the first selected option, else the first enabled one.
  const firstSelected = options.findIndex((o) => !o.disabled && selected.includes(o.value))
  const firstEnabled = options.findIndex((o) => !o.disabled)
  const roving = useRovingTabIndex({
    containerRef: rootRef,
    orientation: 'vertical',
    loop,
    itemSelector: ITEM_SELECTOR,
    defaultActiveIndex: Math.max(firstSelected >= 0 ? firstSelected : firstEnabled, 0),
  })

  /** The option that currently has focus, by value. */
  const focusedValue = (): string | null => {
    const active = rootRef.current?.ownerDocument.activeElement
    return active instanceof HTMLElement && rootRef.current?.contains(active)
      ? active.getAttribute('data-value')
      : null
  }

  // Typeahead, with its timer cleared on unmount - the leak gate checks.
  const typedRef = useRef('')
  const typedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (typedTimer.current !== null) clearTimeout(typedTimer.current)
    },
    [],
  )
  const runTypeahead = (key: string) => {
    if (typedTimer.current !== null) clearTimeout(typedTimer.current)
    typedRef.current += key.toLowerCase()
    typedTimer.current = setTimeout(() => {
      typedRef.current = ''
      typedTimer.current = null
    }, TYPEAHEAD_RESET)
    const query = typedRef.current
    const current = focusedValue()
    const from = options.findIndex((o) => o.value === current)
    const startAt = query.length === 1 ? from + 1 : Math.max(from, 0)
    for (let step = 0; step < options.length; step += 1) {
      const index = (startAt + step) % options.length
      const candidate = options[index]
      if (candidate && !candidate.disabled && candidate.label.toLowerCase().startsWith(query)) {
        roving.focusItem(index)
        if (!multiple) select(candidate.value)
        return
      }
    }
  }

  // Anchor for Shift+click ranges: the last option clicked without Shift.
  const anchorRef = useRef<number | null>(null)
  const selectRange = (from: number, to: number) => {
    const [lo, hi] = from < to ? [from, to] : [to, from]
    const range = options
      .slice(lo, hi + 1)
      .filter((o) => !o.disabled)
      .map((o) => o.value)
    const additions = range.filter((v) => !selected.includes(v))
    if (additions.length > 0) setSelected([...selected, ...additions])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return

    if (multiple && (event.key === 'a' || event.key === 'A') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      setSelected(enabledValues())
      return
    }

    if (NAV_KEYS.has(event.key)) {
      roving.onKeyDown(event)
      const now = focusedValue()
      if (now === null) return
      if (!multiple) select(now)
      else if (event.shiftKey) toggle(now)
      return
    }

    if (event.key === ' ' || event.key === 'Enter') {
      const now = focusedValue()
      if (now === null) return
      event.preventDefault()
      toggle(now)
      return
    }

    if (
      typeahead &&
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      runTypeahead(event.key)
    }
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>, index: number) => {
    const option = options[index]
    if (disabled || !option || option.disabled) return
    roving.setActiveIndex(index)
    if (multiple && event.shiftKey && anchorRef.current !== null) {
      selectRange(anchorRef.current, index)
      return
    }
    anchorRef.current = index
    toggle(option.value)
  }

  const hiddenValues = selected.filter((v) => options.some((o) => o.value === v))

  return (
    <div
      ref={setRootRef}
      role="listbox"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-multiselectable={multiple || undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-orientation="vertical"
      className={cx('vk-listbox', className)}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      onFocus={roving.onFocus}
      {...rest}
    >
      {options.length === 0 ? (
        // biome-ignore lint/a11y/useFocusableInteractive: a listbox may only contain options; the empty message is an inert option so the tree stays valid.
        <div role="option" aria-selected={false} aria-disabled className="vk-listbox__empty">
          {emptyMessage}
        </div>
      ) : (
        options.map((option, index) => {
          const chosen = isSelected(option.value)
          const itemProps = roving.getItemProps(index)
          return (
            <div
              key={option.value}
              id={`${id}-${index}`}
              role="option"
              aria-selected={chosen}
              aria-disabled={option.disabled || undefined}
              aria-labelledby={`${id}-${index}-label`}
              aria-describedby={option.description ? `${id}-${index}-desc` : undefined}
              className="vk-listbox__option"
              data-value={option.value}
              data-state={chosen ? 'checked' : 'unchecked'}
              data-disabled={option.disabled ? '' : undefined}
              {...itemProps}
              tabIndex={disabled || option.disabled ? -1 : itemProps.tabIndex}
              onClick={(event) => handleClick(event, index)}
              onKeyDown={handleKeyDown}
            >
              {multiple ? (
                <span
                  className="vk-listbox__check"
                  aria-hidden="true"
                  data-checked={chosen ? '' : undefined}
                />
              ) : null}
              <span className="vk-listbox__text">
                <span id={`${id}-${index}-label`} className="vk-listbox__label">
                  {option.label}
                </span>
                {option.description ? (
                  <span id={`${id}-${index}-desc`} className="vk-listbox__description">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </div>
          )
        })
      )}
      {name
        ? hiddenValues.length > 0
          ? hiddenValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)
          : !multiple && <input type="hidden" name={name} value="" />
        : null}
    </div>
  )
})
