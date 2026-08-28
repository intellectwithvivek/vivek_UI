'use client'

import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  createContext,
  type ElementType,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useDismiss } from '../../hooks/use-dismiss'
import { useFocusTrap } from '../../hooks/use-focus-trap'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { safeHref, safeRel } from '../../utils/safe-href'
import { mergeRefs, Slot, Slottable } from '../../utils/slot'
import { Container, type ContainerProps } from '../container'

/**
 * The container width at which the links stop collapsing, in `rem`.
 *
 * This number also lives in `navbar.css` as `@container vk-navbar (min-width: 48rem)`,
 * because a container query cannot read a custom property in its condition. The two must
 * stay in step: CSS decides what the user sees, and this constant is only used to close a
 * menu that was opened while narrow and then widened underneath itself, which would
 * otherwise leave a focus trap running over a perfectly ordinary desktop navbar.
 */
const COLLAPSE_REM = { md: 48, lg: 64 } as const

interface NavbarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  menuId: string
  /** `false` until a `Navbar.Links` has mounted, so `aria-controls` never dangles. */
  hasMenu: boolean
  registerMenu: (present: boolean) => void
  menuRef: { current: HTMLUListElement | null }
  toggleRef: { current: HTMLButtonElement | null }
}

const NavbarContext = createContext<NavbarContextValue | null>(null)

/**
 * Parts read the context when there is one and fall back to sensible defaults when there
 * is not, so a `Navbar.Link` still renders as a link if someone reuses it in a footer.
 * Only `Navbar.Toggle` and `Navbar.Links` genuinely need the wiring, and both degrade to
 * inert rather than throwing.
 */
function useNavbarContext(): NavbarContextValue | null {
  return useContext(NavbarContext)
}

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Pin to the top of the scroll container. Default `false`. */
  sticky?: boolean
  /** Hairline rule along the bottom edge. Default `true`. */
  bordered?: boolean
  /** Bar height. Default `md`. */
  size?: 'sm' | 'md' | 'lg'
  /** Max width of the inner `Container`. Default `lg`. */
  container?: ContainerProps['size']
  /** Controlled state of the collapsed mobile menu. */
  open?: boolean
  /** Initial state of the collapsed mobile menu while uncontrolled. Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * The container width at which the links leave the sheet and line up in the bar.
   * `md` (48rem, the default) suits four or five links; `lg` (64rem) is for a bar that also
   * carries actions, where six links plus a theme toggle do not fit at 768px once fonts
   * are a few pixels wider than the ones they were designed against - Linux and Android
   * fallback faces, for instance.
   */
  collapseAt?: 'md' | 'lg'
}

/**
 * The site header.
 *
 * A `nav` landmark with an accessible name (`"Main"` unless you say otherwise), a brand,
 * a row of links, a slot for actions, and a toggle that only exists below a container
 * width.
 *
 * **How the collapse works.** There is exactly one copy of the links in the DOM. Above
 * `48rem` of navbar width a container query lays `Navbar.Links` out as an inline row and
 * hides `Navbar.Toggle`; below it, the row becomes a full-width sheet dropping out of the
 * bar and the toggle appears. So the responsive behaviour costs no props, no JavaScript
 * and no duplicated markup — and because the sheet is `display: none` while closed, its
 * links are genuinely out of the tab order rather than invisibly focusable.
 *
 * While the sheet is open, Tab is trapped inside it, Escape and an outside press close
 * it, and focus returns to the toggle. It is deliberately **not** built on `Drawer`:
 * `Drawer` is a modal dialog that portals to `document.body`, locks the page scroll and
 * marks everything else `inert`, none of which is right for a navigation menu attached to
 * a header that is still on screen. It reuses `useFocusTrap` and `useDismiss` — the parts
 * of `Drawer` that do apply — instead.
 *
 * ```tsx
 * <Navbar sticky>
 *   <Navbar.Brand href="/">VivekUI</Navbar.Brand>
 *   <Navbar.Links>
 *     <Navbar.Link href="/docs" active>Docs</Navbar.Link>
 *     <Navbar.Link asChild><Link href="/blog">Blog</Link></Navbar.Link>
 *   </Navbar.Links>
 *   <Navbar.Actions><Button size="sm">Sign in</Button></Navbar.Actions>
 *   <Navbar.Toggle />
 * </Navbar>
 * ```
 */
const NavbarRoot = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  {
    sticky = false,
    bordered = true,
    size = 'md',
    container = 'lg',
    collapseAt = 'md',
    open,
    defaultOpen = false,
    onOpenChange,
    id,
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  forwardedRef,
) {
  const baseId = useIsomorphicId(id)
  const menuId = `${baseId}-menu`
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const rootRef = useRef<HTMLElement | null>(null)
  const menuRef = useRef<HTMLUListElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  // A count rather than a boolean: a consumer may render two link groups, and unmounting
  // one must not claim there is no menu left for `aria-controls` to point at.
  const [menuCount, setMenuCount] = useState(0)
  const registerMenu = useCallback((present: boolean) => {
    setMenuCount((count) => Math.max(0, count + (present ? 1 : -1)))
  }, [])

  useFocusTrap(menuRef, isOpen)
  useDismiss({
    onDismiss: () => setIsOpen(false),
    refs: [menuRef, toggleRef],
    enabled: isOpen,
  })

  /*
   * Close the sheet if the navbar grows past the collapse width while it is open — a
   * phone rotating to landscape, a sidebar collapsing beside it, a desktop window dragged
   * wider. The stylesheet has already turned the sheet back into a plain inline row by
   * then; without this, the focus trap would still be running over it.
   */
  useEffect(() => {
    if (!isOpen) return
    const root = rootRef.current
    if (!root || typeof ResizeObserver === 'undefined') return

    const view = root.ownerDocument.defaultView
    const rootFontSize = view
      ? Number.parseFloat(view.getComputedStyle(root.ownerDocument.documentElement).fontSize)
      : Number.NaN
    const rem = Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : 16
    const threshold = rem * COLLAPSE_REM[collapseAt]

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width >= threshold) setIsOpen(false)
      }
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [isOpen, setIsOpen, collapseAt])

  const value = useMemo<NavbarContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      menuId,
      hasMenu: menuCount > 0,
      registerMenu,
      menuRef,
      toggleRef,
    }),
    [isOpen, setIsOpen, menuId, menuCount, registerMenu],
  )

  return (
    <nav
      ref={mergeRefs(rootRef, forwardedRef)}
      className={cx('vk-navbar', className)}
      // A bare `nav` is one of several on a page; a name is what makes it findable in a
      // landmark list. A caller-supplied name always wins, and an `aria-labelledby`
      // suppresses the default rather than fighting it.
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Main')}
      aria-labelledby={ariaLabelledBy}
      data-sticky={sticky || undefined}
      data-bordered={bordered || undefined}
      data-size={size}
      data-collapse={collapseAt}
      data-open={isOpen || undefined}
      {...rest}
    >
      <NavbarContext.Provider value={value}>
        <Container size={container} className="vk-navbar__inner">
          {children}
        </Container>
      </NavbarContext.Provider>
    </nav>
  )
})

export interface NavbarBrandProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Renders an `a`. Without it, a plain `span` — a wordmark, not a link. */
  href?: string
  /** Render the caller's element (`next/link`, React Router `Link`) instead of an `a`. */
  asChild?: boolean
  children?: ReactNode
}

/** Logo and wordmark, at the start of the bar. */
const NavbarBrand = forwardRef<HTMLAnchorElement, NavbarBrandProps>(function NavbarBrand(
  { href, asChild, className, children, target, rel, ...rest },
  ref,
) {
  // A brand href is routinely a route-table or CMS value. An unsafe scheme is dropped
  // rather than rendered, which also means the element falls back to a plain `span`:
  // a wordmark that does nothing beats an `<a>` with a dead href.
  const safe = safeHref(href)
  const Component = (asChild ? Slot : safe ? 'a' : 'span') as ElementType
  return (
    <Component
      ref={ref}
      className={cx('vk-navbar__brand', className)}
      href={safe}
      target={target}
      rel={safeRel(target, rel)}
      {...rest}
    >
      {children}
    </Component>
  )
})

export interface NavbarLinksProps extends HTMLAttributes<HTMLUListElement> {}

/**
 * The row of links, and the sheet they become on a narrow navbar.
 *
 * Carries the id that `Navbar.Toggle` points `aria-controls` at, and the `data-state` the
 * stylesheet keys the collapse off.
 */
const NavbarLinks = forwardRef<HTMLUListElement, NavbarLinksProps>(function NavbarLinks(
  { className, id, children, ...rest },
  forwardedRef,
) {
  const ctx = useNavbarContext()
  const register = ctx?.registerMenu

  useEffect(() => {
    if (!register) return
    register(true)
    return () => register(false)
  }, [register])

  return (
    <ul
      ref={mergeRefs(ctx?.menuRef, forwardedRef)}
      id={id ?? ctx?.menuId}
      // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
      role="list"
      className={cx('vk-navbar__links', className)}
      data-state={ctx?.open ? 'open' : 'closed'}
      {...rest}
    >
      {children}
    </ul>
  )
})

export interface NavbarLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Marks the destination as the page you are on: `aria-current="page"`. */
  active?: boolean
  /** Render the caller's element (`next/link`, React Router `Link`) instead of an `a`. */
  asChild?: boolean
  /** Decorative leading glyph. */
  icon?: ReactNode
  children?: ReactNode
}

/**
 * One destination.
 *
 * Renders an `li` wrapping the link; `className`, `...rest` and the forwarded ref all
 * land on the link, which is the element consumers actually want to reach. Selecting one
 * closes the mobile sheet — a no-op on a wide navbar, where the sheet is never open.
 */
const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(function NavbarLink(
  { active, asChild, icon, className, children, onClick, href, target, rel, ...rest },
  ref,
) {
  const ctx = useNavbarContext()
  const Component = (asChild ? Slot : 'a') as ElementType
  const setOpen = ctx?.setOpen

  const handleClick = useCallback(
    (event: MouseEvent | { defaultPrevented: boolean }) => {
      onClick?.(event as never)
      if (event.defaultPrevented) return
      setOpen?.(false)
    },
    [onClick, setOpen],
  )

  return (
    <li className="vk-navbar__item">
      <Component
        ref={ref}
        className={cx('vk-navbar__link', className)}
        href={safeHref(href)}
        target={target}
        rel={safeRel(target, rel)}
        aria-current={active ? 'page' : undefined}
        data-active={active || undefined}
        onClick={handleClick}
        {...rest}
      >
        {icon ? (
          <span className="vk-navbar__link-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {/* Slottable, so `asChild` keeps the icon: see utils/slot.tsx. */}
        <Slottable>{children}</Slottable>
      </Component>
    </li>
  )
})

export interface NavbarActionsProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Buttons at the end of the bar — sign in, theme switch, avatar menu.
 *
 * Stays in the bar at every width rather than collapsing with the links: the one or two
 * controls that earn a place here are the ones that must not need two taps to reach.
 */
const NavbarActions = forwardRef<HTMLDivElement, NavbarActionsProps>(function NavbarActions(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('vk-navbar__actions', className)} {...rest} />
})

export interface NavbarToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name while the sheet is closed. Default `"Open menu"`. */
  openLabel?: string
  /** Accessible name while the sheet is open. Default `"Close menu"`. */
  closeLabel?: string
  /** Replaces the default hamburger/close glyph. */
  children?: ReactNode
}

/**
 * The hamburger. Hidden by the stylesheet above the collapse width, so it is never a tab
 * stop on a wide navbar.
 *
 * `aria-expanded` tracks the sheet and `aria-controls` points at `Navbar.Links` — but
 * only once a `Navbar.Links` has actually mounted, because an `aria-controls` pointing at
 * nothing is worse than none at all.
 */
const NavbarToggle = forwardRef<HTMLButtonElement, NavbarToggleProps>(function NavbarToggle(
  { openLabel = 'Open menu', closeLabel = 'Close menu', className, onClick, children, ...rest },
  forwardedRef,
) {
  const ctx = useNavbarContext()
  const isOpen = ctx?.open ?? false

  return (
    <button
      ref={mergeRefs(ctx?.toggleRef, forwardedRef)}
      type="button"
      className={cx('vk-navbar__toggle', className)}
      aria-expanded={isOpen}
      aria-controls={ctx?.hasMenu ? ctx.menuId : undefined}
      aria-label={isOpen ? closeLabel : openLabel}
      data-state={isOpen ? 'open' : 'closed'}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        ctx?.setOpen(!isOpen)
      }}
      {...rest}
    >
      {children ??
        (isOpen ? (
          <svg
            className="vk-navbar__toggle-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        ) : (
          <svg
            className="vk-navbar__toggle-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        ))}
    </button>
  )
})

/**
 * Compound component: `Navbar`, `Navbar.Brand`, `Navbar.Links`, `Navbar.Link`,
 * `Navbar.Actions`, `Navbar.Toggle`.
 */
export const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Links: NavbarLinks,
  Link: NavbarLink,
  Actions: NavbarActions,
  Toggle: NavbarToggle,
})

/* Named part exports — see scripts/add-compound-exports.mjs.
 *
 * Navbar is a client component, so a Server Component receives it as a client
 * reference and `Navbar.Part` reads `undefined` off that reference. These named
 * exports are the server-usable form; the dot access still works in client components.
 */
export { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarToggle }
