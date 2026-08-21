'use client'

import {
  Fragment,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { Modal, type ModalSize } from '../modal'
import type { PortalContainer } from '../portal'

/** One command. `id` must be unique across the whole palette — it is the identity used
 *  for the active option and for `aria-activedescendant`. */
export interface CommandPaletteItem {
  id: string
  /** The searchable, announced name. */
  label: string
  /** Second line. Also searched. */
  description?: string
  /** Decorative leading glyph. */
  icon?: ReactNode
  /** Trailing hint, usually a `Kbd`. Not part of the accessible name. */
  shortcut?: ReactNode
  /** Extra search terms that are not shown — "settings", "prefs", "theme". */
  keywords?: string[]
  /** Rendered, announced as unavailable, and skipped by the arrow keys. */
  disabled?: boolean
}

/** A titled run of commands. A group with no `heading` renders its items bare. */
export interface CommandPaletteGroup {
  heading?: string
  items: CommandPaletteItem[]
}

/** Groups, loose items, or a mix — consecutive loose items become one untitled group. */
export type CommandPaletteEntry = CommandPaletteGroup | CommandPaletteItem

function isGroup(entry: CommandPaletteEntry): entry is CommandPaletteGroup {
  return Array.isArray((entry as CommandPaletteGroup).items)
}

function normalize(entries: ReadonlyArray<CommandPaletteEntry>): CommandPaletteGroup[] {
  const groups: CommandPaletteGroup[] = []
  let loose: CommandPaletteItem[] | null = null
  for (const entry of entries) {
    if (isGroup(entry)) {
      loose = null
      groups.push(entry)
    } else {
      if (!loose) {
        loose = []
        groups.push({ items: loose })
      }
      loose.push(entry)
    }
  }
  return groups
}

/**
 * Every whitespace-separated term must appear somewhere in the label, the description or
 * the keywords. Word-order-independent, which is what makes "new proj" find
 * "Create a new project".
 */
function defaultFilter(item: CommandPaletteItem, query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (trimmed === '') return true
  const haystack = [item.label, item.description ?? '', ...(item.keywords ?? [])]
    .join(' ')
    .toLowerCase()
  return trimmed.split(/\s+/).every((term) => haystack.includes(term))
}

/* ------------------------------------------------------------------ *
 * Hotkey
 * ------------------------------------------------------------------ */

interface Combo {
  key: string
  /** `mod` = Command on Apple platforms, Control everywhere else. */
  mod: boolean
  ctrl: boolean
  meta: boolean
  alt: boolean
  shift: boolean
}

function parseHotkey(spec: string): Combo | null {
  const parts = spec
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  const key = parts[parts.length - 1]
  if (key === undefined || parts.length === 0) return null
  const mods = parts.slice(0, -1)
  return {
    key,
    mod: mods.includes('mod'),
    ctrl: mods.includes('ctrl') || mods.includes('control'),
    meta: mods.includes('meta') || mods.includes('cmd') || mods.includes('command'),
    alt: mods.includes('alt') || mods.includes('option'),
    shift: mods.includes('shift'),
  }
}

/**
 * `navigator.platform` is deprecated but is still the only reliable way to tell an Apple
 * keyboard layout from a PC one, and `userAgentData.platform` is Chromium-only. Read
 * inside an effect, never at module scope, so the file stays server-safe.
 */
function isApplePlatform(view: Window): boolean {
  const nav = view.navigator
  const source = `${nav.platform ?? ''} ${nav.userAgent ?? ''}`
  return /mac|iphone|ipad|ipod/i.test(source)
}

function matchesCombo(event: globalThis.KeyboardEvent, combo: Combo, apple: boolean): boolean {
  const wantMeta = combo.meta || (combo.mod && apple)
  const wantCtrl = combo.ctrl || (combo.mod && !apple)
  if (event.metaKey !== wantMeta) return false
  if (event.ctrlKey !== wantCtrl) return false
  if (event.altKey !== combo.alt) return false
  if (combo.shift && !event.shiftKey) return false
  return event.key.toLowerCase() === combo.key
}

/* ------------------------------------------------------------------ *
 * Props
 * ------------------------------------------------------------------ */

/** A stable empty default, so the `items` memo does not invalidate on every render. */
const NO_ITEMS: ReadonlyArray<CommandPaletteEntry> = []

export interface CommandPaletteProps {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state while uncontrolled. Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Commands, grouped or loose. */
  items?: ReadonlyArray<CommandPaletteEntry>
  placeholder?: string
  /** Called with the chosen command. The palette closes afterwards. */
  onSelect?: (item: CommandPaletteItem) => void
  /** Shown when nothing matches. Default `"No results found."`. */
  emptyState?: ReactNode
  /**
   * Global shortcut that toggles the palette. `mod` resolves to Command on Apple
   * platforms and Control elsewhere. `null` turns the listener off. Default `'mod+k'`.
   */
  hotkey?: string | null
  /** Controlled search text. */
  query?: string
  /** Initial search text while uncontrolled. Default `''`. */
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  /** Replaces the built-in matcher — pass one that always returns `true` for async search. */
  filter?: (item: CommandPaletteItem, query: string) => boolean
  /** Accessible name for the dialog and the search box. Default `"Command palette"`. */
  label?: string
  /** Accessible name for the results list. Default `"Results"`. */
  resultsLabel?: string
  /** Dialog width. Default `lg`. */
  size?: ModalSize
  /** Portal mount point. Defaults to `document.body`. */
  container?: PortalContainer
  /** A hint bar under the results — key legends, a count. */
  footer?: ReactNode
  /** Id root for the combobox/listbox/option wiring. Generated when omitted. */
  id?: string
  className?: string
}

/* ------------------------------------------------------------------ *
 * Panel
 * ------------------------------------------------------------------ */

interface PanelProps {
  baseId: string
  listboxId: string
  inputRef: RefObject<HTMLInputElement | null>
  groups: CommandPaletteGroup[]
  placeholder: string
  label: string
  resultsLabel: string
  emptyState: ReactNode
  footer: ReactNode
  query: string
  setQuery: (query: string) => void
  onSelect: ((item: CommandPaletteItem) => void) | undefined
  close: () => void
}

/**
 * Mounted only while the palette is open, so the active option, and any scroll position,
 * reset every time it is summoned.
 */
function CommandPalettePanel({
  baseId,
  listboxId,
  inputRef,
  groups,
  placeholder,
  label,
  resultsLabel,
  emptyState,
  footer,
  query,
  setQuery,
  onSelect,
  close,
}: PanelProps) {
  const optionId = useCallback((itemId: string) => `${baseId}-option-${itemId}`, [baseId])

  const visible = useMemo(() => groups.flatMap((group) => group.items), [groups])
  // Arrow keys walk the enabled items only: an item that announces itself unavailable
  // should not be a stop on the way to a usable one.
  const navigable = useMemo(() => visible.filter((item) => !item.disabled), [visible])

  const [activeId, setActiveId] = useState<string | null>(null)

  /*
   * The active option is stored by id, not by index. Filtering reorders and shortens the
   * list on every keystroke, and an index would silently point at a different command;
   * an id that is no longer in the list simply falls back to the first one, which is
   * exactly the behaviour you want as you type.
   */
  const activeIndex = activeId === null ? -1 : navigable.findIndex((item) => item.id === activeId)
  const resolvedIndex = activeIndex >= 0 ? activeIndex : navigable.length > 0 ? 0 : -1
  const activeItem = resolvedIndex >= 0 ? navigable[resolvedIndex] : undefined
  const activeOptionId = activeItem ? optionId(activeItem.id) : undefined

  // Keep the active option on screen. Focus never moves, so the browser will not scroll
  // for us. Guarded because jsdom does not implement scrollIntoView.
  useEffect(() => {
    if (!activeOptionId) return
    const doc = inputRef.current?.ownerDocument
    const element = doc?.getElementById(activeOptionId)
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest' })
    }
  }, [activeOptionId, inputRef])

  const select = useCallback(
    (item: CommandPaletteItem) => {
      if (item.disabled) return
      onSelect?.(item)
      close()
    },
    [onSelect, close],
  )

  const move = useCallback(
    (delta: number) => {
      const count = navigable.length
      if (count === 0) return
      const from = resolvedIndex < 0 ? 0 : resolvedIndex
      const next = navigable[(from + delta + count) % count]
      if (next) setActiveId(next.id)
    },
    [navigable, resolvedIndex],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        move(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        move(-1)
      } else if (event.key === 'Enter' && activeItem) {
        event.preventDefault()
        select(activeItem)
      }
      // Escape is handled by the dialog's own useDismiss, on the document in the capture
      // phase, so it closes the palette from anywhere inside it.
      // Home and End are deliberately left to the text caret: this combobox has an
      // editable text field, and stealing those two keys from it is a worse trade than
      // the one extra ArrowUp it saves.
    },
    [move, activeItem, select],
  )

  const hasResults = visible.length > 0

  return (
    <>
      <div className="vk-command-palette__search">
        <svg
          className="vk-command-palette__search-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M13 13l4 4M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className="vk-command-palette__input"
          value={query}
          placeholder={placeholder}
          aria-label={label}
          aria-expanded={hasResults}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>

      {/* Always rendered, even with no results: `aria-controls` must never point at an
          element that is not in the document. */}
      <div
        id={listboxId}
        role="listbox"
        aria-label={resultsLabel}
        className="vk-command-palette__list"
      >
        {groups.map((group, groupIndex) => {
          const headingId = `${baseId}-group-${groupIndex}`
          const options = group.items.map((item) => {
            const isActive = activeItem?.id === item.id
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: focus stays in the combobox by design (aria-activedescendant); the keyboard route is the input's own ArrowUp/Down/Enter handler, so a key handler here would be dead code.
              // biome-ignore lint/a11y/useFocusableInteractive: an aria-activedescendant option must NOT be focusable — a tabindex here would move DOM focus out of the combobox, which is the exact bug this pattern exists to prevent.
              <div
                key={item.id}
                id={optionId(item.id)}
                role="option"
                className="vk-command-palette__option"
                aria-selected={isActive}
                aria-disabled={item.disabled || undefined}
                data-active={isActive || undefined}
                data-disabled={item.disabled || undefined}
                // Pointer, not mouseenter: this must not fire while the user is driving
                // the list from the keyboard and the cursor merely happens to rest on it.
                onPointerMove={() => {
                  if (!item.disabled) setActiveId(item.id)
                }}
                onClick={() => select(item)}
              >
                {item.icon ? (
                  <span className="vk-command-palette__option-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <span className="vk-command-palette__option-text">
                  <span className="vk-command-palette__option-label">{item.label}</span>
                  {item.description ? (
                    <span className="vk-command-palette__option-description">
                      {item.description}
                    </span>
                  ) : null}
                </span>
                {item.shortcut ? (
                  <span className="vk-command-palette__option-shortcut">{item.shortcut}</span>
                ) : null}
              </div>
            )
          })

          // A group wrapper only earns its place when it has a heading to name it;
          // otherwise the options sit straight in the listbox.
          if (!group.heading) {
            // biome-ignore lint/suspicious/noArrayIndexKey: an untitled group has no stable identity of its own.
            return <Fragment key={`group-${groupIndex}`}>{options}</Fragment>
          }
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: headings can repeat; position is the identity.
              key={`group-${groupIndex}`}
              role="group"
              aria-labelledby={headingId}
              className="vk-command-palette__group"
            >
              {/* role="presentation": inside a listbox the only meaningful children are
                  options and groups, and a stray labelled node there is both an
                  aria-required-children violation and an extra stop when reading the
                  list option by option. It still names the group via aria-labelledby. */}
              <div className="vk-command-palette__group-heading" id={headingId} role="presentation">
                {group.heading}
              </div>
              {options}
            </div>
          )
        })}
      </div>

      {hasResults ? null : (
        // A live region, so "No results found." is announced as you type it into
        // existence rather than only being visible.
        <div className="vk-command-palette__empty" role="status">
          {emptyState}
        </div>
      )}

      {footer ? <div className="vk-command-palette__footer">{footer}</div> : null}
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Root
 * ------------------------------------------------------------------ */

/**
 * The ⌘K palette: a search box over a flat list of commands.
 *
 * **The ARIA model.** The search box is the only focusable thing in the palette. It is a
 * `role="combobox"` with `aria-expanded`, `aria-controls` pointing at the results and
 * `aria-activedescendant` naming the highlighted option; the results are a `listbox` of
 * `option`s, grouped by `role="group"`. ArrowDown/ArrowUp move `aria-activedescendant`
 * and **do not move DOM focus** — that is the entire point of the attribute, and it is
 * what keeps typing working while you walk the list. Enter runs the highlighted command,
 * Escape closes, Tab cannot leave (the dialog traps it), and Home/End are left to the
 * text caret where an editable combobox needs them.
 *
 * The shell is `Modal`, so the palette gets the dialog contract for free: focus moved to
 * the input on open and returned to the trigger on close, the rest of the page `inert`
 * and `aria-hidden`, body scroll locked, and Escape/backdrop dismissal.
 *
 * ```tsx
 * <CommandPalette
 *   items={[{ heading: 'Navigate', items: [{ id: 'home', label: 'Go home' }] }]}
 *   onSelect={(item) => router.push(item.id)}
 * />
 * ```
 */
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    {
      open,
      defaultOpen = false,
      onOpenChange,
      items = NO_ITEMS,
      placeholder = 'Type a command or search…',
      onSelect,
      emptyState = 'No results found.',
      hotkey = 'mod+k',
      query,
      defaultQuery = '',
      onQueryChange,
      filter = defaultFilter,
      label = 'Command palette',
      resultsLabel = 'Results',
      size = 'lg',
      container,
      footer,
      id,
      className,
    },
    ref,
  ) {
    const baseId = useIsomorphicId(id)
    const listboxId = `${baseId}-listbox`

    const [isOpen, setIsOpen] = useControllableState<boolean>({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    })
    const [text, setText] = useControllableState<string>({
      value: query,
      defaultValue: defaultQuery,
      onChange: onQueryChange,
    })

    const inputRef = useRef<HTMLInputElement | null>(null)

    // Clear the search on close, so the palette does not reopen mid-query. Guarded by the
    // previous value rather than firing on mount, which would report an empty query to a
    // controlled consumer that never asked for one.
    const wasOpenRef = useRef(isOpen)
    useEffect(() => {
      if (wasOpenRef.current && !isOpen) setText('')
      wasOpenRef.current = isOpen
    }, [isOpen, setText])

    // The global shortcut. Registered whether or not the palette is open, since opening it
    // is half its job; capture phase, so it wins over a page that also listens for mod+k.
    useEffect(() => {
      if (hotkey === null) return
      const combo = parseHotkey(hotkey)
      if (!combo) return

      const view = window
      const apple = isApplePlatform(view)
      const onKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.defaultPrevented) return
        if (!matchesCombo(event, combo, apple)) return
        event.preventDefault()
        setIsOpen((previous) => !previous)
      }

      view.document.addEventListener('keydown', onKeyDown, true)
      return () => view.document.removeEventListener('keydown', onKeyDown, true)
    }, [hotkey, setIsOpen])

    const groups = useMemo(() => normalize(items), [items])
    const filtered = useMemo(
      () =>
        groups
          .map((group) => ({
            heading: group.heading,
            items: group.items.filter((item) => filter(item, text)),
          }))
          .filter((group) => group.items.length > 0),
      [groups, text, filter],
    )

    const close = useCallback(() => setIsOpen(false), [setIsOpen])

    return (
      <Modal
        ref={ref}
        open={isOpen}
        onOpenChange={setIsOpen}
        size={size}
        container={container}
        initialFocus={inputRef}
        aria-label={label}
        className={cx('vk-command-palette', className)}
        overlayClassName="vk-command-palette__overlay"
      >
        <CommandPalettePanel
          baseId={baseId}
          listboxId={listboxId}
          inputRef={inputRef}
          groups={filtered}
          placeholder={placeholder}
          label={label}
          resultsLabel={resultsLabel}
          emptyState={emptyState}
          footer={footer}
          query={text}
          setQuery={setText}
          onSelect={onSelect}
          close={close}
        />
      </Modal>
    )
  },
)
