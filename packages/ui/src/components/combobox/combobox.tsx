'use client'

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAnchoredPosition } from '../../hooks/use-anchored-position'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import type { Align, Side } from '../../utils/position'
import { Portal, type PortalContainer } from '../portal'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboboxBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** The full list. Filtering happens here, so pass everything you have. */
  options: ComboboxOption[]
  /** Match test. Default: case-insensitive substring on the label. */
  filter?: (option: ComboboxOption, query: string) => boolean
  /** Offer "Create …" when the query matches no option exactly. */
  creatable?: boolean
  /** Called when the create row is chosen, before the value is added. */
  onCreate?: (label: string) => void
  /** Show a busy row instead of results — for a server-side search. */
  loading?: boolean
  /** Shown when nothing matches. Default `'No results'`. */
  emptyState?: ReactNode
  /** Text shown while `loading`. Default `'Loading…'`. */
  loadingLabel?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readOnly?: boolean
  /** Sets `aria-invalid` on the input. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. */
  required?: boolean
  /** Submits with the form — one hidden input per selected value. */
  name?: string
  /** Controlled popup state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Offer a button that empties the selection. Default `true` unless `required`. */
  clearable?: boolean
  /** Accessible name for the clear button. Default `'Clear selection'`. */
  clearLabel?: string
  /** Accessible name for a chip's remove button in `multiple` mode. */
  removeLabel?: (label: string) => string
  /** Label for the create row. Default `` `Create "${query}"` ``. */
  createLabel?: (query: string) => string
  side?: Side
  align?: Align
  offset?: number
  padding?: number
  container?: PortalContainer
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/** The public union collapsed for internal use. See the cast in the component body. */
interface ComboboxInternalProps extends ComboboxBaseProps {
  multiple?: boolean
  value?: string | string[] | null
  defaultValue?: string | string[] | null
  onValueChange?: (value: string | string[] | null) => void
}

/** A row in the popup. Messages are rows too, so navigation has one thing to skip. */
type Row =
  | { kind: 'option'; option: ComboboxOption }
  | { kind: 'create'; label: string }
  | { kind: 'message'; label: ReactNode }

function defaultFilter(option: ComboboxOption, query: string): boolean {
  if (query === '') return true
  return option.label.toLowerCase().includes(query.trim().toLowerCase())
}

function isSelectable(row: Row): boolean {
  if (row.kind === 'message') return false
  if (row.kind === 'create') return true
  return !row.option.disabled
}

/**
 * A filterable select, following the ARIA combobox pattern.
 *
 * The rule that shapes everything else: **DOM focus never leaves the input.** The arrows
 * move an *active option*, tracked in state and pointed at by `aria-activedescendant`, and
 * a screen reader reads that option out while the caret is still in the text field. Moving
 * real focus into the list instead — which is what a "listbox of buttons" implementation
 * does — means every keystroke after it goes to the wrong element, and typing to narrow the
 * list stops working entirely.
 *
 * Messages are options too. A "No results" or "Loading…" `<div>` dropped inside a
 * `role="listbox"` makes the listbox invalid — its only permitted children are options and
 * groups — so both render as `aria-disabled` options that navigation skips. It costs
 * nothing and keeps the tree conformant.
 *
 * `multiple` mode keeps the popup open after each pick and renders the selection as chips
 * before the input, each with its own remove button. Backspace on an empty query removes
 * the last one, which is the shortcut people reach for without being told.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(props, ref) {
  // One deliberate widening of the public discriminated union: the variants differ only in
  // whether the value is a string or a list, and `multiple` is checked before it is read.
  // `as unknown as` because `strictFunctionTypes` makes the callbacks non-comparable in a
  // single step.
  const {
    options,
    filter = defaultFilter,
    creatable,
    onCreate,
    loading,
    emptyState = 'No results',
    loadingLabel = 'Loading…',
    placeholder,
    size = 'md',
    disabled,
    readOnly,
    invalid,
    required,
    name,
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen = false,
    onOpenChange,
    clearable,
    clearLabel = 'Clear selection',
    removeLabel = (label) => `Remove ${label}`,
    createLabel = (query) => `Create "${query}"`,
    side = 'bottom',
    align = 'start',
    offset = 6,
    padding = 8,
    container,
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props as unknown as ComboboxInternalProps

  const baseId = useIsomorphicId(id)
  const listboxId = `${baseId}-listbox`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const inputRef = useRef<HTMLInputElement | null>(null)
  const controlRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const [selection, setSelection] = useControllableState<string | string[] | null>({
    value,
    defaultValue: defaultValue ?? (multiple ? [] : null),
    onChange: onValueChange,
  })

  const selected = useMemo<string[]>(() => {
    if (Array.isArray(selection)) return selection
    return selection ? [selection] : []
  }, [selection])

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  /** Label lookup that survives a value with no matching option (a created one). */
  const labelOf = useCallback(
    (candidate: string) => options.find((option) => option.value === candidate)?.label ?? candidate,
    [options],
  )

  // Seeded once: in single mode the input shows the selection, so it starts as the
  // selected option's label rather than its value.
  const [query, setQuery] = useState(() => {
    const initial = Array.isArray(selection) ? null : selection
    return !multiple && initial ? labelOf(initial) : ''
  })
  const [activeIndex, setActiveIndex] = useState(-1)

  /**
   * In single mode the input doubles as the display of the selection, so an externally
   * changed value has to be written into it — but never while the user is typing there.
   */
  const singleValue = multiple ? null : Array.isArray(selection) ? null : selection
  const lastSingleRef = useRef(singleValue)
  useEffect(() => {
    if (multiple) return
    if (singleValue === lastSingleRef.current) return
    lastSingleRef.current = singleValue
    if (inputRef.current && document.activeElement === inputRef.current) return
    setQuery(singleValue ? labelOf(singleValue) : '')
  }, [labelOf, multiple, singleValue])

  const rows = useMemo<Row[]>(() => {
    if (loading) return [{ kind: 'message', label: loadingLabel }]

    // In single mode the query is also the display text, so once a selection is showing,
    // filtering by it would leave a list of one. Treat "query equals the selected label"
    // as "no query" and show everything, which is what makes reopening the popup useful.
    const showAll = !multiple && singleValue !== null && query === labelOf(singleValue)
    const matches = showAll ? options : options.filter((option) => filter(option, query))

    const result: Row[] = matches.map((option) => ({ kind: 'option', option }))

    const trimmed = query.trim()
    const exact = options.some((option) => option.label.toLowerCase() === trimmed.toLowerCase())
    if (creatable && trimmed !== '' && !exact) {
      result.push({ kind: 'create', label: trimmed })
    }

    if (result.length === 0) result.push({ kind: 'message', label: emptyState })
    return result
  }, [
    creatable,
    emptyState,
    filter,
    labelOf,
    loading,
    loadingLabel,
    multiple,
    options,
    query,
    singleValue,
  ])

  /** Keep the active row in bounds and off a message when the list changes underneath. */
  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex((current) => {
      const row = current >= 0 ? rows[current] : undefined
      if (row && isSelectable(row)) return current
      return rows.findIndex(isSelectable)
    })
  }, [isOpen, rows])

  /**
   * Scroll the active row into view — it holds no focus, so the browser will not do it.
   * Found by `data-active` rather than by id: `useId` produces strings containing `:`,
   * which is not a valid CSS selector without escaping, and this needs no escaping at all.
   */
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    const node = listRef.current?.querySelector<HTMLElement>('[data-active]')
    // Optional call: `scrollIntoView` is missing in jsdom and in a few older WebViews,
    // and a highlight that is briefly off-screen is not worth a crash.
    node?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, isOpen])

  const step = useCallback(
    (delta: 1 | -1) => {
      const usable = rows
        .map((row, index) => (isSelectable(row) ? index : -1))
        .filter((index) => index !== -1)
      if (usable.length === 0) return
      const position = usable.indexOf(activeIndex)
      // Wrap, which is what people expect from a short list they are cycling through.
      const next =
        position === -1
          ? delta === 1
            ? usable[0]
            : usable[usable.length - 1]
          : usable[(position + delta + usable.length) % usable.length]
      if (next !== undefined) setActiveIndex(next)
    },
    [activeIndex, rows],
  )

  const commitRow = useCallback(
    (index: number) => {
      const row = rows[index]
      if (!row || row.kind === 'message') return
      if (row.kind === 'option' && row.option.disabled) return

      const chosen = row.kind === 'create' ? row.label : row.option.value
      const chosenLabel = row.kind === 'create' ? row.label : row.option.label
      if (row.kind === 'create') onCreate?.(row.label)

      if (multiple) {
        const next = selected.includes(chosen)
          ? selected.filter((item) => item !== chosen)
          : [...selected, chosen]
        setSelection(next)
        // Stay open: picking several things is the point of multiple mode.
        setQuery('')
        return
      }

      setSelection(chosen)
      setQuery(chosenLabel)
      setIsOpen(false)
    },
    [multiple, onCreate, rows, selected, setIsOpen, setSelection],
  )

  const clear = useCallback(() => {
    setSelection(multiple ? [] : null)
    setQuery('')
    inputRef.current?.focus()
  }, [multiple, setSelection])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented || disabled) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
            return
          }
          step(1)
          return
        case 'ArrowUp':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
            return
          }
          step(-1)
          return
        case 'Home':
          if (!isOpen) return
          event.preventDefault()
          setActiveIndex(rows.findIndex(isSelectable))
          return
        case 'End': {
          if (!isOpen) return
          event.preventDefault()
          for (let index = rows.length - 1; index >= 0; index -= 1) {
            const row = rows[index]
            if (row && isSelectable(row)) {
              setActiveIndex(index)
              return
            }
          }
          return
        }
        case 'Enter': {
          if (!isOpen || activeIndex < 0) return
          // Only swallow Enter when it does something here, so an unopened combobox still
          // submits its form the way a text input would.
          event.preventDefault()
          commitRow(activeIndex)
          return
        }
        case 'Escape': {
          if (isOpen) {
            event.preventDefault()
            setIsOpen(false)
            return
          }
          if (query !== '') {
            event.preventDefault()
            setQuery('')
          }
          return
        }
        case 'Backspace': {
          if (!multiple || query !== '' || selected.length === 0) return
          event.preventDefault()
          setSelection(selected.slice(0, -1))
          return
        }
        case 'Tab': {
          // Tab commits nothing and just leaves; an accidental selection on the way out
          // of a form is far more annoying than having to press Enter.
          if (isOpen) setIsOpen(false)
          return
        }
        default:
          return
      }
    },
    [
      activeIndex,
      commitRow,
      disabled,
      isOpen,
      multiple,
      query,
      rows,
      selected,
      setIsOpen,
      setSelection,
      step,
    ],
  )

  const canClear = (clearable ?? !required) && selected.length > 0 && !disabled && !readOnly
  const activeRow = activeIndex >= 0 ? rows[activeIndex] : undefined

  return (
    <div
      className={cx('vk-combobox', className)}
      style={style}
      data-size={size}
      data-open={isOpen || undefined}
      data-multiple={multiple || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div className="vk-combobox__control" ref={controlRef}>
        {multiple && selected.length > 0 ? (
          <ul className="vk-combobox__chips">
            {selected.map((item) => (
              <li key={item} className="vk-combobox__chip">
                <span className="vk-combobox__chip-text">{labelOf(item)}</span>
                <button
                  type="button"
                  className="vk-combobox__chip-remove"
                  aria-label={removeLabel(labelOf(item))}
                  disabled={disabled || readOnly}
                  onClick={() => setSelection(selected.filter((entry) => entry !== item))}
                >
                  <span className="vk-combobox__cross" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <input
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={baseId}
          type="text"
          className="vk-combobox__input"
          // The ARIA combobox pattern: a native `select` cannot be filtered by typing.
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && activeRow && isSelectable(activeRow) ? optionId(activeIndex) : undefined
          }
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-required={required || undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={selected.length > 0 && multiple ? undefined : placeholder}
          value={query}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onKeyDown={onKeyDown}
          onMouseDown={() => {
            if (!disabled && !readOnly && !isOpen) setIsOpen(true)
          }}
        />

        {canClear ? (
          <button
            type="button"
            className="vk-combobox__clear"
            aria-label={clearLabel}
            onClick={clear}
          >
            <span className="vk-combobox__cross" aria-hidden="true" />
          </button>
        ) : null}

        <span className="vk-combobox__arrow" aria-hidden="true" />
      </div>

      {/* One hidden input per value: `getAll(name)` on the server, no JSON encoding. */}
      {name
        ? selected.map((item) => (
            <input key={`${name}-${item}`} type="hidden" name={name} value={item} />
          ))
        : null}

      {isOpen ? (
        <Portal container={container}>
          <ComboboxPopup
            listRef={listRef}
            anchorRef={controlRef}
            inputRef={inputRef}
            listboxId={listboxId}
            label={ariaLabel ?? 'Suggestions'}
            loading={Boolean(loading)}
            side={side}
            align={align}
            offset={offset}
            padding={padding}
            onDismiss={() => setIsOpen(false)}
          >
            {rows.map((row, index) => {
              const active = index === activeIndex
              if (row.kind === 'message') {
                return (
                  // biome-ignore lint/a11y/useFocusableInteractive: options in a combobox listbox are never focused - `aria-activedescendant` on the input is what moves the active option.
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: a message row is singular and purely positional.
                    key={`message-${index}`}
                    id={optionId(index)}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a listbox may only own options, so even a message has to be one.
                    role="option"
                    className="vk-combobox__message"
                    aria-disabled="true"
                    aria-selected={false}
                  >
                    {row.label}
                  </li>
                )
              }

              const isCreate = row.kind === 'create'
              const optionValue = isCreate ? row.label : row.option.value
              const optionLabel = isCreate ? createLabel(row.label) : row.option.label
              const chosen = selected.includes(optionValue)

              return (
                // biome-ignore lint/a11y/useFocusableInteractive: options are never focused in this pattern - the input keeps focus and points at the active option with `aria-activedescendant`.
                <li
                  key={isCreate ? `create-${optionValue}` : optionValue}
                  id={optionId(index)}
                  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a listbox may only own options.
                  role="option"
                  className="vk-combobox__option"
                  data-active={active || undefined}
                  data-create={isCreate || undefined}
                  aria-selected={chosen}
                  aria-disabled={!isCreate && row.option.disabled ? true : undefined}
                  // `mousedown` rather than `click`: a click would first blur the input,
                  // and the blur handler closes the popup out from under the press.
                  onMouseDown={(event) => {
                    event.preventDefault()
                    commitRow(index)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {multiple ? (
                    <span
                      className="vk-combobox__check"
                      data-checked={chosen || undefined}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="vk-combobox__option-text">{optionLabel}</span>
                </li>
              )
            })}
          </ComboboxPopup>
        </Portal>
      ) : null}
    </div>
  )
})

interface ComboboxPopupProps {
  listRef: RefObject<HTMLUListElement | null>
  anchorRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
  listboxId: string
  label: string
  loading: boolean
  side: Side
  align: Align
  offset: number
  padding: number
  onDismiss: () => void
  children: ReactNode
}

/**
 * The listbox. Below the `Portal` boundary, so measurement never runs during server
 * rendering, and matched to the control's width so the options line up with the field.
 */
function ComboboxPopup({
  listRef,
  anchorRef,
  inputRef,
  listboxId,
  label,
  loading,
  side,
  align,
  offset,
  padding,
  onDismiss,
  children,
}: ComboboxPopupProps) {
  const resolved = useAnchoredPosition(anchorRef, listRef, side, align, offset, padding)

  useDismiss({ onDismiss, refs: [listRef, anchorRef, inputRef] })

  const width = anchorRef.current?.getBoundingClientRect().width

  return (
    <ul
      ref={listRef}
      id={listboxId}
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a `ul` of `li`s is exactly the markup a listbox of options wants; the roles make the relationship explicit.
      role="listbox"
      aria-label={label}
      aria-busy={loading || undefined}
      className="vk-combobox__listbox"
      data-side={resolved?.side ?? side}
      data-positioned={resolved ? '' : undefined}
      style={
        {
          left: `${resolved?.x ?? 0}px`,
          top: `${resolved?.y ?? 0}px`,
          // Match the field's width, so the options and the text line up.
          minWidth: width ? `${width}px` : undefined,
        } satisfies CSSProperties
      }
    >
      {children}
    </ul>
  )
}
