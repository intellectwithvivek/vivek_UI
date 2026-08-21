/**
 * Canonical site identity. One place, because the base URL ends up baked into every
 * canonical link, every Open Graph image URL, the sitemap and the JSON-LD — and a mismatch
 * between any two of those is the single most common reason a technically-fine site does
 * not get indexed or cited.
 *
 * Override at build time:
 *
 *   NEXT_PUBLIC_SITE_URL=https://vivekui.vivekkumarsingh.in pnpm build
 *
 * Set it in Vercel's environment variables for the production deployment. The fallback is
 * only there so a local build and `next build` in CI both produce absolute URLs.
 */

/** No trailing slash: every path is joined as `${SITE_URL}${path}`. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vivekui.vivekkumarsingh.in'
).replace(/\/$/, '')

export const SITE_NAME = 'VivekUI'

/**
 * The one-sentence answer to "what is this".
 *
 * Written to be quotable on its own, because an answer engine lifts a sentence, not a
 * page: it leads with the category, then the number, then the differentiator.
 */
export const SITE_TAGLINE =
  'VivekUI is a free, MIT-licensed React component library with 83 accessible components and 6 SVG charts, and zero runtime dependencies.'

export const SITE_DESCRIPTION =
  'VivekUI is a free React component library: 83 accessible, server-safe components and 6 dependency-free SVG charts. One npm install, one CSS import, no build configuration, no Tailwind required. MIT licensed.'

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
