'use client'

import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  createContext,
  type ElementType,
  forwardRef,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { safeHref, safeRel } from '../../utils/safe-href'
import { Slot, Slottable } from '../../utils/slot'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  collapsible: boolean
  sidebarId: string
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

/**
 * `null` outside a `Sidebar`, so every part still renders something sensible on its own
 * instead of throwing — an item reused in a settings panel is a reasonable thing to do.
 */
function useSidebarContext(): SidebarContextValue | null {
  return useContext(SidebarContext)
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Allow the icons-only mode at all. Default `true`. */
  collapsible?: boolean
  /** Controlled collapsed state. */
  collapsed?: boolean
  /** Initial collapsed state while uncontrolled. Default `false`. */
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /**
   * Expanded width, as any CSS length. Default `16rem`. Sets `--vk-sidebar-width` on the
   * element, so it can equally be set from a stylesheet.
   */
  width?: string
  /** Which edge the rail is attached to. Logical, so it follows the writing direction. */
  side?: 'start' | 'end'
  /** Accessible name for the `nav`. Defaults to `"Sidebar"`. */
  label?: string
}

/**
 * The navigation rail of an app shell.
 *
 * A named `nav` landmark holding groups of items, with an optional icons-only collapsed
 * mode. Unlike `Drawer` it is not modal and not portalled: it is part of the page layout,
 * so it belongs in a grid or flex row beside the main content, and the page keeps
 * scrolling behind it.
 *
 * **Collapsed items keep their names.** The label is still in the DOM when collapsed,
 * clipped with `clip-path` rather than removed with `display: none`, so an icon-only item
 * is announced as "Dashboard, link" instead of as an unlabelled graphic. That is the whole
 * reason the collapse is not implemented by swapping the children out.
 *
 * ```tsx
 * <Sidebar defaultCollapsed>
 *   <Sidebar.Toggle />
 *   <Sidebar.Section title="Workspace">
 *     <Sidebar.Item href="/" icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
 *     <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={12}>Inbox</Sidebar.Item>
 *   </Sidebar.Section>
 * </Sidebar>
 * ```
 */
const SidebarRoot = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    collapsible = true,
    collapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    width,
    side = 'start',
    label = 'Sidebar',
    id,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const sidebarId = useIsomorphicId(id)
  const [isCollapsed, setIsCollapsed] = useControllableState<boolean>({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  })

  // `collapsible={false}` wins over the state: a caller that has turned the mode off
  // should not be able to be left in it by a stale `collapsed` prop.
  const effective = collapsible && isCollapsed

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed: effective,
      setCollapsed: setIsCollapsed,
      collapsible,
      sidebarId,
    }),
    [effective, setIsCollapsed, collapsible, sidebarId],
  )

  return (
    <nav
      ref={ref}
      id={sidebarId}
      className={cx('vk-sidebar', className)}
      aria-label={label}
      data-collapsed={effective || undefined}
      data-collapsible={collapsible || undefined}
      data-side={side}
      // A custom property is not in CSSProperties; the cast is the narrowest way to set
      // one, and keeps the caller's own `style` winning over it.
      style={width ? ({ '--vk-sidebar-width': width, ...style } as CSSProperties) : style}
      {...rest}
    >
      <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    </nav>
  )
})

export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Group label. Names the list via `aria-labelledby`, so it stays useful when the
   * sidebar is collapsed and the text itself is clipped out of sight.
   */
  title?: ReactNode
  children?: ReactNode
}

/**
 * A titled group of items.
 *
 * The title labels the list rather than acting as a heading: a rail of five groups would
 * otherwise add five headings to a page's document outline, which makes the outline worse,
 * not better. Screen reader users get "Workspace, list, 3 items" either way.
 */
const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(function SidebarSection(
  { title, id, className, children, ...rest },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const titleId = `${baseId}-title`

  return (
    <div ref={ref} id={baseId} className={cx('vk-sidebar__section', className)} {...rest}>
      {title ? (
        <div className="vk-sidebar__section-title" id={titleId}>
          {title}
        </div>
      ) : null}
      <ul
        // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
        role="list"
        className="vk-sidebar__list"
        aria-labelledby={title ? titleId : undefined}
      >
        {children}
      </ul>
    </div>
  )
})

export interface SidebarItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Decorative leading glyph. The only thing visible when collapsed. */
  icon?: ReactNode
  /** The page you are on: `aria-current="page"`. */
  active?: boolean
  /**
   * Trailing count or status. A number or short string is announced as part of the item
   * ("Inbox, 12"); when collapsed it shrinks to a dot, and the text is kept for
   * assistive tech.
   */
  badge?: ReactNode
  /** Render the caller's element (`next/link`, React Router `Link`) instead of an `a`. */
  asChild?: boolean
  /** Extra attributes for the `li` wrapper. */
  itemProps?: LiHTMLAttributes<HTMLLIElement>
  children?: ReactNode
}

/**
 * One destination.
 *
 * `className`, `...rest` and the forwarded ref land on the link. The label is never
 * removed from the DOM, only clipped when collapsed, which is what keeps an icon-only
 * item accessibly named.
 */
/**
 * First letter of a label, for the icon-less collapsed fallback.
 *
 * Only handles what a label realistically is - a string, a number, or an array whose first
 * element is one. Anything else (an element, a fragment) returns nothing rather than
 * guessing, because reaching into arbitrary children to extract text is how a helper like
 * this starts throwing on valid input.
 */
function initialOf(children: ReactNode): string {
  const first = Array.isArray(children) ? children[0] : children
  if (typeof first === 'number') return String(first).charAt(0)
  if (typeof first !== 'string') return ''
  return first.trim().charAt(0).toUpperCase()
}

const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(function SidebarItem(
  { icon, active, badge, asChild, itemProps, className, children, href, target, rel, ...rest },
  ref,
) {
  const ctx = useSidebarContext()
  const Component = (asChild ? Slot : 'a') as ElementType

  return (
    <li className="vk-sidebar__item" {...itemProps}>
      <Component
        ref={ref}
        className={cx('vk-sidebar__link', className)}
        href={safeHref(href)}
        target={target}
        rel={safeRel(target, rel)}
        aria-current={active ? 'page' : undefined}
        data-active={active || undefined}
        data-collapsed={ctx?.collapsed || undefined}
        {...rest}
      >
        {icon ? (
          <span className="vk-sidebar__icon" aria-hidden="true">
            {icon}
          </span>
        ) : (
          /*
           * No icon supplied: fall back to the label's initial.
           *
           * Collapsing clips every label, so an item without an icon collapsed to nothing
           * at all - an empty rail with no way to tell one row from another, or even that
           * rows existed. `aria-hidden`, because the clipped label is still what names the
           * link; this is purely so the collapsed state degrades to something usable
           * rather than to blank.
           */
          <span className="vk-sidebar__icon" data-fallback="" aria-hidden="true">
            {initialOf(children)}
          </span>
        )}
        {/* Slottable, so `asChild` keeps the icon, the label wrapper and the badge:
            see utils/slot.tsx. */}
        <Slottable wrapperClassName="vk-sidebar__label">{children}</Slottable>
        {badge !== undefined && badge !== null && badge !== false ? (
          <span className="vk-sidebar__badge">{badge}</span>
        ) : null}
      </Component>
    </li>
  )
})

export interface SidebarToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name while expanded. Default `"Collapse sidebar"`. */
  collapseLabel?: string
  /** Accessible name while collapsed. Default `"Expand sidebar"`. */
  expandLabel?: string
  /** Replaces the default chevron. */
  children?: ReactNode
}

/**
 * Switches the rail between full and icons-only.
 *
 * `aria-expanded` describes the sidebar it controls, not itself, which is why it is
 * `aria-controls`-wired to the `nav` — "expanded" here means "showing its labels".
 */
const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(function SidebarToggle(
  {
    collapseLabel = 'Collapse sidebar',
    expandLabel = 'Expand sidebar',
    className,
    onClick,
    children,
    ...rest
  },
  forwardedRef,
) {
  const ctx = useSidebarContext()
  const collapsed = ctx?.collapsed ?? false
  const setCollapsed = ctx?.setCollapsed

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      setCollapsed?.(!collapsed)
    },
    [onClick, setCollapsed, collapsed],
  )

  return (
    <button
      ref={forwardedRef}
      type="button"
      className={cx('vk-sidebar__toggle', className)}
      aria-expanded={!collapsed}
      aria-controls={ctx?.sidebarId}
      aria-label={collapsed ? expandLabel : collapseLabel}
      data-state={collapsed ? 'collapsed' : 'expanded'}
      onClick={handleClick}
      {...rest}
    >
      {children ?? (
        <svg
          className="vk-sidebar__toggle-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 5l-5 5 5 5" />
        </svg>
      )}
    </button>
  )
})

/**
 * Compound component: `Sidebar`, `Sidebar.Section`, `Sidebar.Item`, `Sidebar.Toggle`.
 */
export const Sidebar = Object.assign(SidebarRoot, {
  Section: SidebarSection,
  Item: SidebarItem,
  Toggle: SidebarToggle,
})

/* Named part exports — see scripts/add-compound-exports.mjs.
 *
 * Sidebar is a client component, so a Server Component receives it as a client
 * reference and `Sidebar.Part` reads `undefined` off that reference. These named
 * exports are the server-usable form; the dot access still works in client components.
 */
export { SidebarItem, SidebarSection, SidebarToggle }
