import type { MetadataRoute } from 'next'
import { allRoutes } from '../lib/routes'
import { assertSiteUrl, url } from '../lib/site'

/**
 * Generated from the registry, so it lists exactly the routes that exist. A sitemap with
 * URLs the site does not serve gets treated as unreliable and quietly discounted.
 *
 * `lastModified` uses the build time. Fabricating per-page dates would be worse than
 * useless: a crawler that learns the dates are meaningless stops using them to schedule
 * recrawls, which is the only thing the field is for.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Runs once, at build. Warns in the build log if NEXT_PUBLIC_SITE_URL is overriding the
  // canonical host - the failure that put 106 dead URLs in this file once already.
  assertSiteUrl()

  const lastModified = new Date()
  return allRoutes().map((route) => ({
    url: url(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
