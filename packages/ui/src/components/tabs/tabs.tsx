'use client'

import {
  type ButtonHTMLAttributes,
  createContext,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { useRovingTabIndex } from '../../hooks/use-roving-tab-index'
import { cx } from '../../utils/cx'

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsVariant = 'line' | 'enclosed' | 'pill'
export type TabsSize = 'sm' | 'md' | 'lg'
/**
 * `'automatic'` — selection follows arrow-key focus (APG "Tabs with Automatic Activation").
 * `'manual'` — arrows move focus only; Enter or Space selects (APG "Manual Activation").
 *
 * Automatic is the friendlier default. Manual is the correct choice when revealing a
 * panel is expensive (a fetch, a chart re-render), because otherwise arrowing across
 * five tabs fires five loads the user never asked for.
 */
export type TabsActivationMode = 'automatic' | 'manual'

/** Tabs are found in the DOM, not registered in state — see `useTabStop`. */
const TAB_SELECTOR = '[role="tab"]'
/**
 * Same predicate as `useRovingTabIndex`'s internal `isItemDisabled`, expressed as CSS so
 * the rule lives in exactly one place per language instead of being re-implemented in JS.
 */
const ENABLED_TAB_SELECTOR = '[role="tab"]:not([disabled]):not([aria-disabled="true"])'

interface TabsContextValue {
  baseId: string
  selected: string | undefined
  select: (value: string) => void
  orientation: TabsOrientation
  variant: TabsVariant
  size: TabsSize
  activationMode: TabsActivationMode
  loop: boolean
}

const TabsContext = createContext<TabsContextValue | null>(null)

/** The value of the one tab that carries the tablist's single tab stop. */
interface TabsListContextValue {
  tabStop: string | undefined
}

const TabsListContext = createContext<TabsListContextValue | null>(null)

function useTabsContext(part: string): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) throw new Error(`<Tabs.${part}> must be rendered inside <Tabs>`)
  return context
}

/** Values are author-supplied strings; ids are not, so strip anything an id cannot hold. */
function slug(value: string): string {
  return value.replace(/[^\w-]+/g, '-')
}

function tabDomId(baseId: string, value: string): string {
  return `${baseId}-tab-${slug(value)}`
}

function panelDomId(baseId: string, value: string): string {
  return `${baseId}-panel-${slug(value)}`
}

function assignRef<T>(ref: ForwardedRef<T>, node: T | null): void {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

/**
 * Which tab owns `tabIndex={0}`.
 *
 * Per the APG's own reference implementation the tablist's single tab stop belongs to
 * the *selected* tab — arrow keys move DOM focus onto `tabindex="-1"` tabs, which is
 * legal and is what makes manual activation possible at all. So the tab stop is derived
 * from selection rather than from `useRovingTabIndex`'s focus-following `activeIndex`.
 *
 * The one case selection cannot answer is when nothing is selected yet, or the selected
 * tab is disabled: then no tab would be reachable by Tab and the whole widget drops out
 * of the keyboard order. This heals that by falling back to the first enabled tab, read
 * from the DOM (never registered in state) so tabs that mount, unmount or become
 * disabled at runtime are handled for free.
 */
function useTabStop(
  containerRef: { readonly current: HTMLElement | null },
  selected: string | undefined,
): string | undefined {
  const [fallback, setFallback] = useState<string | undefined>(undefined)

  // No dependency array on purpose: tabs can appear or become disabled without
  // `selected` changing. `setState` with an unchanged value bails out, so this settles.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const tabs = Array.from(container.querySelectorAll<HTMLElement>(TAB_SELECTOR))
    const selectedTab = tabs.find((tab) => tab.dataset.value === selected)
    if (selectedTab?.matches(ENABLED_TAB_SELECTOR)) {
      setFallback(undefined)
      return
    }
    setFallback(container.querySelector<HTMLElement>(ENABLED_TAB_SELECTOR)?.dataset.value)
  })

  return fallback ?? selected
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled selection: the `value` of the selected tab. */
  value?: string
  /** Uncontrolled initial selection. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Which arrows move between tabs, and how the widget is laid out. Default `horizontal`. */
  orientation?: TabsOrientation
  variant?: TabsVariant
  size?: TabsSize
  /** Default `'automatic'`. */
  activationMode?: TabsActivationMode
  /** Wrap arrow navigation past the ends. Default `true`. */
  loop?: boolean
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export interface TabsTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ties this tab to the `Tabs.Panel` with the same `value`. */
  value: string
}

export interface TabsPanelsProps extends HTMLAttributes<HTMLDivElement> {}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Ties this panel to the `Tabs.Tab` with the same `value`. */
  value: string
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    variant = 'line',
    size = 'md',
    activationMode = 'automatic',
    loop = true,
    id,
    className,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const [selected, setSelected] = useControllableState<string | undefined>({
    value,
    defaultValue,
    // The hook is generic over `string | undefined` because "nothing selected" is a real
    // state; the public callback only ever reports a real tab.
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next)
    },
  })

  const select = useCallback(
    (next: string) => {
      setSelected(next)
    },
    [setSelected],
  )

  const context = useMemo<TabsContextValue>(
    () => ({ baseId, selected, select, orientation, variant, size, activationMode, loop }),
    [baseId, selected, select, orientation, variant, size, activationMode, loop],
  )

  return (
    <TabsContext.Provider value={context}>
      <div
        ref={ref}
        id={id}
        className={cx('vk-tabs', className)}
        data-orientation={orientation}
        data-variant={variant}
        data-size={size}
        {...rest}
      />
    </TabsContext.Provider>
  )
})

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, onKeyDown, onFocus, ...rest },
  ref,
) {
  const { orientation, variant, size, selected, loop } = useTabsContext('List')
  const listRef = useRef<HTMLDivElement | null>(null)
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  // Movement only: arrow/Home/End, disabled-tab skipping and looping all come from the
  // shared hook. Its `getItemProps` is deliberately not used (see `useTabStop`).
  const roving = useRovingTabIndex({
    containerRef: listRef,
    orientation,
    loop,
    itemSelector: TAB_SELECTOR,
  })
  const tabStop = useTabStop(listRef, selected)
  const listContext = useMemo<TabsListContextValue>(() => ({ tabStop }), [tabStop])

  return (
    <TabsListContext.Provider value={listContext}>
      <div
        ref={setRef}
        role="tablist"
        aria-orientation={orientation}
        className={cx('vk-tabs__list', className)}
        data-orientation={orientation}
        data-variant={variant}
        data-size={size}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          roving.onKeyDown(event)
        }}
        onFocus={(event) => {
          onFocus?.(event)
          roving.onFocus(event)
        }}
        {...rest}
      />
    </TabsListContext.Provider>
  )
})

const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(
  { value, className, disabled, onClick, onFocus, 'aria-disabled': ariaDisabled, ...rest },
  ref,
) {
  const { baseId, selected, select, orientation, variant, size, activationMode } =
    useTabsContext('Tab')
  const list = useContext(TabsListContext)
  const isSelected = selected === value
  // A tab outside a `Tabs.List` is a misuse, but it should still be reachable.
  const tabStop = list ? list.tabStop : selected
  const softDisabled = ariaDisabled === true || ariaDisabled === 'true'
  const unavailable = Boolean(disabled) || softDisabled

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabDomId(baseId, value)}
      className={cx('vk-tabs__tab', className)}
      aria-selected={isSelected}
      aria-controls={panelDomId(baseId, value)}
      aria-disabled={ariaDisabled}
      // Exactly one tab is in the tab order; the arrows do the rest.
      tabIndex={tabStop === value ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={isSelected ? 'active' : 'inactive'}
      data-orientation={orientation}
      data-variant={variant}
      data-size={size}
      data-disabled={unavailable || undefined}
      onClick={(event) => {
        onClick?.(event)
        // Enter and Space arrive here as clicks: that is native `<button>` behaviour and
        // is all manual activation needs.
        if (!event.defaultPrevented && !unavailable) select(value)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        // Automatic activation. Guarded on `isSelected` so merely Tabbing back into the
        // tablist does not re-report a change the user did not make.
        if (activationMode === 'automatic' && !isSelected && !unavailable) select(value)
      }}
      {...rest}
    />
  )
})

const TabsPanels = forwardRef<HTMLDivElement, TabsPanelsProps>(function TabsPanels(
  { className, ...rest },
  ref,
) {
  const { orientation, variant, size } = useTabsContext('Panels')
  return (
    <div
      ref={ref}
      className={cx('vk-tabs__panels', className)}
      data-orientation={orientation}
      data-variant={variant}
      data-size={size}
      {...rest}
    />
  )
})

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value, className, ...rest },
  ref,
) {
  const { baseId, selected, orientation, variant, size } = useTabsContext('Panel')
  const isSelected = selected === value

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelDomId(baseId, value)}
      aria-labelledby={tabDomId(baseId, value)}
      className={cx('vk-tabs__panel', className)}
      // The panel is a tab stop of its own, so Tab out of the tablist lands on the
      // content the user just selected instead of skipping past it.
      // biome-ignore lint/a11y/noNoninteractiveTabindex: required by the APG tabpanel pattern
      tabIndex={0}
      // The `hidden` attribute, not a class: an inactive panel must be gone from the
      // accessibility tree and out of the tab order, not merely invisible. Panels stay
      // mounted so `aria-controls` never points at a missing id.
      hidden={!isSelected}
      data-value={value}
      data-state={isSelected ? 'active' : 'inactive'}
      data-orientation={orientation}
      data-variant={variant}
      data-size={size}
      {...rest}
    />
  )
})

/**
 * Tabs — `Tabs`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panels`, `Tabs.Panel`.
 *
 * ```tsx
 * <Tabs defaultValue="a" activationMode="manual">
 *   <Tabs.List aria-label="Settings">
 *     <Tabs.Tab value="a">Account</Tabs.Tab>
 *     <Tabs.Tab value="b">Billing</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panels>
 *     <Tabs.Panel value="a">…</Tabs.Panel>
 *     <Tabs.Panel value="b">…</Tabs.Panel>
 *   </Tabs.Panels>
 * </Tabs>
 * ```
 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panels: TabsPanels,
  Panel: TabsPanel,
})

/* Named part exports.
 *
 * Tabs is a client component, so a Server Component receives it as a client
 * reference and `Tabs.Part` reads `undefined` off that reference. These named
 * exports are the server-usable form; the dot access still works in client components.
 */
export { TabsList, TabsPanel, TabsPanels, TabsTab }
