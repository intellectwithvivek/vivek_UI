import type { Metadata } from 'next'
import { PACKAGE_NAME, SITE_NAME, url } from './site'

/**
 * Per-page metadata, built the same way everywhere.
 *
 * Two things this centralises, both of which are easy to get wrong once per page and
 * impossible to get wrong once in total:
 *
 * 1. A self-referencing canonical. Without one, a page reachable at more than one URL
 *    (trailing slash, query string, a link from an aggregator) competes with itself and
 *    neither version ranks.
 * 2. Open Graph and Twitter titles that match the page title. A mismatch is not fatal but
 *    it is the difference between a shared link that reads as the page and one that reads
 *    as the site.
 */
export function pageMeta(input: {
  title: string
  description: string
  path: string
  /** Extra phrases for this page specifically. Kept short on purpose. */
  keywords?: string[]
  /**
   * Set when the route has its own `opengraph-image` file, so Next resolves that instead.
   * Declaring `openGraph` here otherwise REPLACES the inherited file-based image, which is
   * how these pages ended up with no `og:image` at all - a shared link with no preview.
   */
  hasOwnImage?: boolean
}): Metadata {
  const { title, description, path, keywords, hasOwnImage } = input
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title,
      description,
      url: url(path),
      locale: 'en_US',
      // Point at the sitewide card unless the route generates its own.
      ...(hasOwnImage ? {} : { images: [{ url: '/opengraph-image', width: 1200, height: 630 }] }),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/**
 * Description for a component or chart page.
 *
 * Leads with the name and the words a developer would search, then the library. Written so
 * the first clause stands alone, because that is the part a search result or an answer
 * engine shows — a description that only makes sense after the title is wasted there.
 */
export function apiDescription(input: {
  title: string
  kind: 'component' | 'chart'
  description: string
  exports: string[]
}): string {
  const lead = input.description
    ? input.description.replace(/\s+/g, ' ').trim()
    : `The ${input.title} ${input.kind}.`
  const importable = input.exports.slice(0, 4).join(', ')
  return `${input.title} — a React ${input.kind} from ${SITE_NAME}. ${lead} Props, live examples and usage. Import { ${importable} } from '${PACKAGE_NAME}'.`
}
