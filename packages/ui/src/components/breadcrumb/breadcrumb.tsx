import {
  type AnchorHTMLAttributes,
  type ElementType,
  forwardRef,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '../../utils/cx'
import { safeHref, safeRel } from '../../utils/safe-href'
import { Slot, Slottable } from '../../utils/slot'

/** One hop in the trail. `href` is omitted on the current page — see `BreadcrumbProps`. */
export interface BreadcrumbItemData {
  label: ReactNode
  href?: string
  /** Leading glyph. Decorative: hidden from assistive tech. */
  icon?: ReactNode
  /**
   * Force the "you are here" rendering. Defaults to `true` for the last item, which is
   * what a breadcrumb trail means, so this is only needed for a trail that continues
   * past the current page.
   */
  current?: boolean
}

/** The default `/`-style divider: a chevron, sized in `em` so it tracks the text. */
function ChevronSeparator() {
  return (
    <svg
      className="vk-breadcrumb__chevron"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 5l5 5-5 5" />
    </svg>
  )
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Data-driven trail. Rendered in order, and the last entry becomes the current page
   * automatically. Ignored when `children` are given.
   */
  items?: BreadcrumbItemData[]
  /** Divider between items. A chevron by default; always decorative. */
  separator?: ReactNode
  size?: 'sm' | 'md'
  /** Accessible name for the `nav`. Defaults to `"Breadcrumb"`. */
  label?: string
  /** Compound form — `Breadcrumb.Item` and `Breadcrumb.Separator`. Wins over `items`. */
  children?: ReactNode
}

/**
 * The trail of ancestors above the current page.
 *
 * A named `<nav>` around an ordered list, because the order is the meaning. The current
 * page carries `aria-current="page"` and is deliberately **not** a link — a link to the
 * page you are already on is a dead end that screen reader users have to discover by
 * following it. Separators are `aria-hidden`, so the trail reads
 * "Home, Docs, Components" rather than "Home slash Docs slash Components".
 *
 * Server-safe: no state, no effects, no hooks — it renders untouched in a React Server
 * Component.
 *
 * ```tsx
 * <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'Breadcrumb' }]} />
 * ```
 */
const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, separator, size = 'md', label = 'Breadcrumb', className, children, ...rest },
  ref,
) {
  const divider = separator ?? <ChevronSeparator />
  /*
   * The last hop is the current page — unless the caller marked one themselves, which is
   * how a trail that continues past the page you are on is expressed. Auto-marking the
   * last hop as well would put two `aria-current="page"` in one trail.
   */
  const hasExplicitCurrent = items?.some((item) => item.current === true) ?? false

  return (
    <nav
      ref={ref}
      className={cx('vk-breadcrumb', className)}
      aria-label={label}
      data-size={size}
      {...rest}
    >
      <ol
        // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them.
        role="list"
        className="vk-breadcrumb__list"
      >
        {children ??
          items?.flatMap((item, index) => {
            const isLast = index === items.length - 1
            const current = item.current ?? (!hasExplicitCurrent && isLast)
            const hop = (
              <BreadcrumbItem
                // biome-ignore lint/suspicious/noArrayIndexKey: a trail is positional — two hops can legitimately share a label and an href, so the index is the only stable identity.
                key={`item-${index}`}
                href={item.href}
                icon={item.icon}
                current={current}
              >
                {item.label}
              </BreadcrumbItem>
            )
            if (isLast) return [hop]
            return [
              hop,
              // biome-ignore lint/suspicious/noArrayIndexKey: positional, like the item it follows.
              <BreadcrumbSeparator key={`sep-${index}`}>{divider}</BreadcrumbSeparator>,
            ]
          })}
      </ol>
    </nav>
  )
})

export interface BreadcrumbItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  href?: string
  /** Decorative leading glyph. */
  icon?: ReactNode
  /** Renders as the current page: `aria-current="page"`, and not a link. */
  current?: boolean
  /**
   * Render the caller's element (`next/link`, React Router `Link`) instead of an `<a>`,
   * with our class names, `aria-current` and ref merged onto it. Ignored when `current`
   * — the current page is not a link.
   */
  asChild?: boolean
  /** Extra attributes for the inner link, e.g. `rel` or `target`. */
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>
  children?: ReactNode
}

/** One hop. An `<li>` wrapping either a link or the current-page label. */
const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, icon, current, asChild, linkProps, className, children, ...rest },
  ref,
) {
  const glyph = icon ? (
    <span className="vk-breadcrumb__icon" aria-hidden="true">
      {icon}
    </span>
  ) : null

  const Component = (asChild ? Slot : 'a') as ElementType
  // A trail is usually built from a route table or a CMS. An unsafe scheme is dropped,
  // and the hop then renders as plain text rather than as a link that goes nowhere.
  const safe = safeHref(href)

  return (
    <li
      ref={ref}
      className={cx('vk-breadcrumb__item', className)}
      data-current={current || undefined}
      {...rest}
    >
      {current || (!safe && !asChild) ? (
        <span
          className={cx('vk-breadcrumb__page', !current && 'vk-breadcrumb__page--plain')}
          aria-current={current ? 'page' : undefined}
        >
          {glyph}
          {children}
        </span>
      ) : (
        <Component
          className="vk-breadcrumb__link"
          href={safe}
          {...linkProps}
          rel={safeRel(linkProps?.target, linkProps?.rel)}
        >
          {glyph}
          {/* Slottable, so `asChild` keeps the icon: see utils/slot.tsx. */}
          <Slottable>{children}</Slottable>
        </Component>
      )}
    </li>
  )
})

export interface BreadcrumbSeparatorProps extends LiHTMLAttributes<HTMLLIElement> {}

/**
 * The divider between two items, for the compound form.
 *
 * `aria-hidden` and out of the accessibility tree: it is punctuation, not a step in the
 * trail, and announcing it turns three items into five.
 */
const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ className, children, ...rest }, ref) {
    return (
      <li
        ref={ref}
        aria-hidden="true"
        className={cx('vk-breadcrumb__separator', className)}
        {...rest}
      >
        {children ?? <ChevronSeparator />}
      </li>
    )
  },
)

/** Compound component: `Breadcrumb`, `Breadcrumb.Item`, `Breadcrumb.Separator`. */
export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
  Separator: BreadcrumbSeparator,
})
