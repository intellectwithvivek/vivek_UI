/**
 * Canonical site identity. One place, because the base URL ends up baked into every
 * canonical link, every Open Graph image URL, the sitemap and the JSON-LD — and a mismatch
 * between any two of those is the single most common reason a technically-fine site does
 * not get indexed or cited.
 *
 * The host lives in code, deliberately. It was env-var-first, and that shipped a live
 * failure: `NEXT_PUBLIC_SITE_URL` was set in the hosting dashboard to a subdomain that had
 * been guessed before the real one existed, so all 106 sitemap URLs, the robots.txt Sitemap
 * directive and every canonical tag pointed at a host that did not resolve at all. Fixing
 * the code fallback changed nothing, because an explicitly-set variable wins. A stale
 * dashboard value silently overriding correct source is not a failure mode worth keeping.
 *
 * `NEXT_PUBLIC_SITE_URL` still works, for a fork or a rename, but `assertSiteUrl()` warns
 * loudly in the build log when it disagrees with the constant below - so the next person to
 * set it sees that they have done so.
 */

/** The real, deployed host. No trailing slash: paths are joined as `${SITE_URL}${path}`. */
export const CANONICAL_SITE_URL = 'https://ui.vivekkumarsingh.in'

const OVERRIDE = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const SITE_URL = (OVERRIDE || CANONICAL_SITE_URL).replace(/\/$/, '')

/**
 * Surfaced in the build log rather than thrown.
 *
 * Throwing would break preview deployments, which legitimately run on a different host.
 * Silence is what let a dead host reach production, so this is deliberately noisy.
 */
export function assertSiteUrl(): void {
  if (OVERRIDE && SITE_URL !== CANONICAL_SITE_URL) {
    console.warn(
      [
        '',
        '  NEXT_PUBLIC_SITE_URL is overriding the canonical host.',
        `    override : ${SITE_URL}`,
        `    canonical: ${CANONICAL_SITE_URL}`,
        '  Every canonical link, Open Graph URL and sitemap entry will use the override.',
        '  If this is a production build, unset the variable so the canonical host is used.',
        '',
      ].join('\n'),
    )
  }
}

export const SITE_NAME = 'VivekUI'

/**
 * The one-sentence answer to "what is this".
 *
 * Written to be quotable on its own, because an answer engine lifts a sentence, not a
 * page: it leads with the category, then the number, then the differentiator.
 */
export const SITE_TAGLINE =
  'VivekUI is a free, MIT-licensed React component library with 88 accessible components and 6 SVG charts, and zero runtime dependencies.'

export const SITE_DESCRIPTION =
  'A free React component library with zero dependencies: 88 accessible, server-safe components and 6 SVG charts. One install, one CSS import, no Tailwind. MIT.'

export const PACKAGE_NAME = '@the_viveksingh/vivek-ui'
export const NPM_URL = `https://www.npmjs.com/package/${PACKAGE_NAME}`
export const REPO_URL = 'https://github.com/intellectwithvivek/vivek_UI'

export const AUTHOR = {
  name: 'Vivek Kumar Singh',
  url: 'https://vivekkumarsingh.in',
  linkedin: 'https://www.linkedin.com/in/singhvvk/',
  github: 'https://github.com/intellectwithvivek',
} as const

/** Absolute URL for a site-relative path. */
export function url(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Keywords that are actually worth targeting: phrases a developer types when they have the
 * problem this library solves. Deliberately short — a hundred keywords signals spam to
 * both search and answer engines, and dilutes the ones that matter.
 */
export const SITE_KEYWORDS = [
  'react component library',
  'zero dependency react components',
  'accessible react components',
  'react charts without dependencies',
  'shadcn alternative',
  'react server components ui library',
  'tailwind free component library',
  'MIT react ui kit',
]
