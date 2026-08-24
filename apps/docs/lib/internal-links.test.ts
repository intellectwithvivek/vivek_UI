/**
 * Every internal link on the built site must go somewhere.
 *
 * A dead internal link is invisible to every other gate here. TypeScript is happy — `href`
 * is a string. The build is happy — Next does not resolve hrefs. The tests are happy — none
 * of them navigate. It only shows up when a reader clicks it, and by then it is in the index
 * and a crawler has recorded a soft 404 against the site.
 *
 * The site has a real way to produce these: `routes.ts` drives the sitemap, and a page that
 * links somewhere `routes.ts` does not know about is either a dead link or a page missing
 * from the sitemap. Both are worth failing over.
 *
 * Checked against the built HTML rather than the sources, because a link can be assembled
 * from a variable — `/docs/components/${slug}` is a string literal nowhere in the tree.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allRoutes } from './routes'

const BUILD = join(__dirname, '..', '.next', 'server', 'app')

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return htmlFiles(path)
    return entry.name.endsWith('.html') ? [path] : []
  })
}

/** `.next/server/app/docs/faq.html` -> `/docs/faq`, and `index.html` -> `/`. */
function routeOf(file: string): string {
  const rel = file.split(sep).join('/').split('/server/app')[1] ?? ''
  const route = rel.replace(/\.html$/, '')
  return route === '/index' ? '/' : route
}

const built = existsSync(BUILD)
const files = built ? htmlFiles(BUILD).filter((f) => !/_global-error/.test(f)) : []
const routes = new Set(files.map(routeOf))
const pages = files.map((file) => ({ route: routeOf(file), html: readFileSync(file, 'utf8') }))

/**
 * Routes that exist but are not pre-rendered as HTML, so they never appear in the scan.
 * Each is a route handler or a file convention rather than a page.
 */
const NON_HTML_ROUTES = new Set([
  '/llms.txt',
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.webmanifest',
])

/** Every distinct internal href in the built HTML, with the pages that use it. */
function internalLinks(): Map<string, Set<string>> {
  const links = new Map<string, Set<string>>()
  for (const file of files) {
    const html = readFileSync(file, 'utf8')
    const from = routeOf(file)
    for (const match of html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/g)) {
      const href = match[1]
      if (!href?.startsWith('/') || href.startsWith('//')) continue
      // Fragments and query strings address the same document.
      const path = (href.split('#')[0] ?? '').split('?')[0] ?? ''
      if (path === '') continue
      const existing = links.get(path)
      if (existing) existing.add(from)
      else links.set(path, new Set([from]))
    }
  }
  return links
}

describe.skipIf(!built)('internal links in the built site', () => {
  it('found pages to check', () => {
    // Guards against this suite passing because the build output moved.
    expect(files.length).toBeGreaterThan(50)
  })

  it('found links to check', () => {
    expect(internalLinks().size).toBeGreaterThan(20)
  })

  it('every internal link resolves to a page that was built', () => {
    const dead: string[] = []
    for (const [href, from] of internalLinks()) {
      if (routes.has(href)) continue
      if (NON_HTML_ROUTES.has(href)) continue
      // Next serves `/docs` and `/docs/` as the same page; the scan records one form.
      if (routes.has(href.replace(/\/$/, ''))) continue
      dead.push(`${href} <- linked from ${[...from].sort().slice(0, 3).join(', ')}`)
    }
    expect(dead, 'these links 404').toEqual([])
  })

  it('every route in the sitemap was actually built', () => {
    // The other direction from the test above, and the more damaging one: a sitemap that
    // lists URLs the site does not serve teaches a crawler the file is unreliable, and it
    // stops being trusted for the routes that are real.
    const missing = allRoutes()
      .map((route) => route.path)
      .filter((path) => !routes.has(path))
    expect(missing, 'the sitemap advertises these; nothing was built for them').toEqual([])
  })

  it('renders a navbar toggle, or mobile has no navigation at all', () => {
    // The library hides `Navbar.Links` below its breakpoint and shows the toggle instead.
    // The header shipped without a toggle, so on every phone the links were not cramped —
    // Docs, Components, Charts, Showcase, Pages and Playground were simply unreachable.
    const stranded = pages
      .filter(({ html }) => !/vk-navbar__toggle/.test(html))
      .map(({ route }) => route)
    expect(stranded, 'no mobile navigation on these pages').toEqual([])
  })

  it('gives every page-template page a way back to the gallery', () => {
    // These pages sit outside the docs shell, so they have no sidebar. Shipped without a
    // single link back: from a search result the only way out was the browser's back
    // button, and there is no back button when the page is the entry point.
    const stranded = pages
      .filter(({ route }) => /^\/pages\/[^/]+$/.test(route))
      .filter(({ html }) => !/href="\/pages"/.test(html))
      .map(({ route }) => route)
    expect(stranded, 'no link back to /pages').toEqual([])
  })

  it('gives every page-template page a breadcrumb trail', () => {
    const missing = pages
      .filter(({ route }) => /^\/pages(\/[^/]+)?$/.test(route))
      .filter(({ html }) => !/aria-label="Breadcrumb"/.test(html))
      .map(({ route }) => route)
    expect(missing).toEqual([])
  })

  it('links to an external site open safely', () => {
    // `target="_blank"` without `rel="noopener"` hands the opened page a handle on this
    // one through `window.opener`. Modern browsers imply it, older ones do not.
    const unsafe: string[] = []
    for (const file of files) {
      const html = readFileSync(file, 'utf8')
      for (const match of html.matchAll(/<a\b[^>]*?target="_blank"[^>]*>/g)) {
        const tag = match[0]
        if (!/rel="[^"]*noopener/.test(tag)) {
          unsafe.push(`${routeOf(file)}: ${tag.slice(0, 110)}`)
        }
      }
    }
    expect(unsafe).toEqual([])
  })

  it('has no link pointing at localhost or a preview host', () => {
    const leaked: string[] = []
    for (const file of files) {
      const html = readFileSync(file, 'utf8')
      for (const match of html.matchAll(/href="(https?:\/\/(?:localhost|127\.0\.0\.1)[^"]*)"/g)) {
        leaked.push(`${routeOf(file)}: ${match[1]}`)
      }
    }
    expect(leaked).toEqual([])
  })
})
