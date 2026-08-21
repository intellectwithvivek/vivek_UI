import { type AnchorHTMLAttributes, type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  /** Root element. Defaults to `div`. */
  as?: ElementType
  size?: 'sm' | 'md' | 'lg'
  /** Cap the measure at a readable line length. Defaults to `true`. */
  measure?: boolean
}

/**
 * Schemes a link may use. Anything else - `javascript:`, `data:`, `vbscript:`,
 * `blob:` - is refused. Model output is untrusted input, and a `javascript:` href is a
 * one-click XSS.
 */
const ALLOWED_SCHEMES = new Set(['http:', 'https:'])

/** Does the value start with a URL scheme at all? */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

/**
 * Is this href safe to put in an `<a href>`?
 *
 * Whitespace and C0 control characters are stripped **before** the test, because
 * browsers strip them when resolving a URL: `java\tscript:alert(1)` navigates exactly
 * like `javascript:alert(1)`, and a naive `startsWith('javascript:')` check misses it.
 *
 * A value with no scheme at all - `/docs`, `./x`, `#top`, `?q=1`, `//host/path` - is
 * allowed: it resolves against the current document and cannot introduce a new scheme.
 * A relative path that happens to contain a colon in its first segment (`weird:file`)
 * parses as a scheme and is therefore refused; write `./weird:file` instead.
 */
export function isSafeHref(href: string): boolean {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping C0 controls is the point - browsers strip them too, so the check has to see the URL the browser will.
  const stripped = href.replace(/[\u0000-\u0020]+/g, '')
  if (!HAS_SCHEME.test(stripped)) return true
  const scheme = stripped.slice(0, stripped.indexOf(':') + 1).toLowerCase()
  return ALLOWED_SCHEMES.has(scheme)
}

/**
 * A styled wrapper for rich text, with no parser.
 *
 * It styles the elements the caller already rendered - headings, paragraphs, lists,
 * blockquotes, tables, inline code, links - and does not turn strings into markup. That
 * is not a limitation working around the zero-dependency rule; it is the security
 * boundary. Nothing here interprets model output as HTML or Markdown, so there is
 * nothing to sanitise: bring your own Markdown-to-React renderer if you want one, and
 * put its element output inside this wrapper.
 *
 * Server-safe: no hooks.
 */
const ProseRoot = forwardRef<HTMLDivElement, ProseProps>(function Prose(
  { as: Component = 'div', size = 'md', measure = true, className, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx('vk-prose', className)}
      data-size={size}
      data-measure={measure ? 'true' : 'false'}
      {...rest}
    />
  )
})

export interface ProseLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

/**
 * A link that refuses a dangerous `href`.
 *
 * Two rules, both aimed at untrusted content:
 *
 * 1. **Scheme allowlist.** `http:`/`https:` and scheme-less references only. Anything
 *    else renders as inert text (a `<span data-blocked-href>`) with the label intact,
 *    so the user still sees what the model wrote but cannot be navigated by it.
 * 2. **`target="_blank"` always gets `rel="noopener noreferrer"`,** merged with any
 *    `rel` the caller passed, so a new tab can never reach back through
 *    `window.opener` and cannot leak the referrer.
 *
 * This component does not linkify anything. A raw string stays a raw string; only an
 * explicit `<Prose.Link>` becomes an anchor. Auto-linkifying model output is how
 * `javascript:` payloads become clickable in the first place.
 */
const ProseLink = forwardRef<HTMLAnchorElement, ProseLinkProps>(function ProseLink(
  { href, target, rel, className, children, ...rest },
  ref,
) {
  if (href === undefined || !isSafeHref(href)) {
    return (
      <span
        className={cx('vk-prose__blocked-link', className)}
        data-blocked-href="true"
        // Anchor-only attributes are meaningless on a span; the cast is deliberate and
        // this path is the rare one (a refused href), so it stays simple.
        {...(rest as HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    )
  }

  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean))
  if (target === '_blank') {
    tokens.add('noopener')
    tokens.add('noreferrer')
  }
  const resolvedRel = tokens.size > 0 ? Array.from(tokens).join(' ') : undefined

  return (
    <a
      ref={ref}
      className={cx('vk-prose__link', className)}
      href={href}
      target={target}
      rel={resolvedRel}
      {...rest}
    >
      {children}
    </a>
  )
})

/** Compound component: `Prose` and `Prose.Link`. */
export const Prose = Object.assign(ProseRoot, { Link: ProseLink })
