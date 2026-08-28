/**
 * URL scheme validation for any `href` the library renders from consumer data.
 *
 * This is a real security boundary, not defensive padding. Components like `Footer`,
 * `Breadcrumb` and `Navbar.Brand` take hrefs from props, and those props are routinely
 * fed from a CMS, a route table or an API — data a consumer does not fully control.
 *
 * React 19 blocks `javascript:` URLs itself, but React 18 only warns and still renders
 * the attribute, and `^18.0.0` is inside this package's supported peer range. Verified
 * against React 18.3.1: `<a href="javascript:alert(document.domain)">` renders verbatim.
 * So the check has to live here, not in React.
 */

/**
 * Schemes safe to place in an `href`.
 *
 * `mailto:` and `tel:` are included deliberately: neither can execute script, and a
 * footer that cannot link an email address is broken for no security gain. Everything
 * else with a scheme is refused — notably `javascript:` (direct execution) and
 * `data:` (a `data:text/html` document runs script in the embedding origin).
 */
const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/**
 * The stricter policy Prose uses for links inside long-form content: no mailto/tel, because
 * prose links routinely come from CMS-authored markdown where a tel: link is more likely a
 * mistake or a lure than a feature. Exported so the two policies are two SETS, not two
 * diverging implementations of the check.
 */
export const HTTP_SCHEMES_ONLY: ReadonlySet<string> = new Set(['http:', 'https:'])

/** Does the value start with a URL scheme at all? */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

/**
 * Is this href safe to put in an `<a href>`?
 *
 * Whitespace and C0 control characters are stripped **before** the scheme test, because
 * browsers strip them when resolving a URL: `java<TAB>script:alert(1)` navigates exactly like
 * `javascript:alert(1)`, so a naive `startsWith('javascript:')` check misses it.
 *
 * A value with no scheme at all — `/docs`, `./x`, `#top`, `?q=1`, `//host/path` — is
 * allowed: it resolves against the current document and cannot introduce a new scheme.
 * A relative path whose first segment contains a colon (`weird:file`) parses as a scheme
 * and is therefore refused; write `./weird:file` instead.
 */
export function isSafeHref(href: string, allow: ReadonlySet<string> = ALLOWED_SCHEMES): boolean {
  // Browsers strip C0 controls and spaces while resolving a URL, so the check has to
  // see the same string they will: `java<TAB>script:alert(1)` navigates exactly like
  // `javascript:alert(1)`. Done as a codepoint filter rather than a regex so the
  // control-character range cannot be mangled by an escaping layer.
  let stripped = ''
  for (const character of href) {
    const code = character.codePointAt(0) ?? 0
    if (code > 0x20) stripped += character
  }
  if (!HAS_SCHEME.test(stripped)) return true
  const scheme = stripped.slice(0, stripped.indexOf(':') + 1).toLowerCase()
  return allow.has(scheme)
}

/**
 * The href to actually render, or `undefined` when the value is unsafe.
 *
 * Returning `undefined` makes the anchor render with no `href`, which is inert and not
 * focusable — a visible but dead link. That is the right failure mode: silently dropping
 * the attribute is safe, whereas rendering it is an XSS, and throwing would take down a
 * consumer's whole page because one CMS row was bad.
 */
export function safeHref(href: string | undefined): string | undefined {
  if (href === undefined) return undefined
  return isSafeHref(href) ? href : undefined
}

/**
 * Merge `noopener noreferrer` into `rel` whenever the link opens in a new tab.
 *
 * Without `noopener`, the opened page can reach back through `window.opener` and
 * navigate the original — reverse tabnabbing. Modern browsers imply `noopener` for
 * `target="_blank"`, but older ones do not, and `noreferrer` additionally stops the
 * referrer leaking.
 */
export function safeRel(target: string | undefined, rel: string | undefined): string | undefined {
  if (target !== '_blank') return rel
  const parts = new Set((rel ?? '').split(/\s+/).filter(Boolean))
  parts.add('noopener')
  parts.add('noreferrer')
  return [...parts].join(' ')
}
