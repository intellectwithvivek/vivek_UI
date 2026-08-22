/**
 * Every page must declare its OWN canonical URL.
 *
 * This exists because of the most damaging bug the site has had, and one that is completely
 * invisible while browsing: fourteen pages — including `/docs`, `/docs/components`,
 * `/docs/charts`, `/playground` and all eight guides — emitted
 *
 *     <link rel="canonical" href="https://ui.vivekkumarsingh.in">
 *
 * pointing at the HOMEPAGE rather than at themselves. A canonical is an instruction, not a
 * hint: it tells a search engine "this page is a duplicate of that one, index that one
 * instead". Fourteen of the richest pages on the site were asking to be dropped from the
 * index and folded into `/`.
 *
 * The cause is subtle. The root layout sets `alternates: { canonical: '/' }` so the homepage
 * gets a self-reference, and Next.js resolves that against `metadataBase` — so any page that
 * does NOT override it inherits a canonical pointing at `/`. There is no warning, and the
 * page looks perfect in a browser.
 *
 * This asserts against the BUILT HTML rather than the source, because the bug lived in what
 * Next resolved, not in what any single file said.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SITE_URL } from './site'

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
const pages = built ? htmlFiles(BUILD).filter((f) => !/_not-found|_global-error/.test(f)) : []

describe.skipIf(!built)('canonical URLs in the built site', () => {
  it('found pages to check', () => {
    // Guards against this suite silently passing because the build output moved.
    expect(pages.length).toBeGreaterThan(50)
  })

  it('every page points its canonical at its own URL', () => {
    const wrong: string[] = []
    for (const file of pages) {
      const html = readFileSync(file, 'utf8')
      const canonical = html.match(/rel="canonical" href="([^"]*)"/)?.[1]
      const route = routeOf(file)
      const expected = `${CANONICAL_SITE_URL}${route === '/' ? '' : route}`
      const strip = (url: string) => url.replace(/\/$/, '')
      if (!canonical) {
        wrong.push(`${route} -> no canonical at all`)
      } else if (strip(canonical) !== strip(expected)) {
        wrong.push(`${route} -> ${canonical}`)
      }
    }
    expect(wrong, 'these pages tell search engines they are duplicates of another URL').toEqual([])
  })

  it('every page has a unique title', () => {
    // Two pages sharing a title compete with each other for the same query.
    const seen = new Map<string, string[]>()
    for (const file of pages) {
      const title = readFileSync(file, 'utf8').match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
      seen.set(title, [...(seen.get(title) ?? []), routeOf(file)])
    }
    const dupes = [...seen.entries()].filter(([, routes]) => routes.length > 1)
    expect(dupes.map(([t, r]) => `"${t}" on ${r.join(', ')}`)).toEqual([])
  })

  it('every page has a meta description', () => {
    const missing = pages
      .filter((f) => !/name="description" content="[^"]+"/.test(readFileSync(f, 'utf8')))
      .map(routeOf)
    expect(missing, 'a page with no description lets Google invent the snippet').toEqual([])
  })

  it('keeps descriptions inside the length Google renders', () => {
    /*
     * Google truncates a snippet around 160 characters. Over that and the sentence is cut
     * mid-word; under ~70 and the result wastes the only copy on the page you control.
     * The ceiling is 165 rather than 160 to leave a little room for wording.
     */
    const bad: string[] = []
    for (const file of pages) {
      const desc = readFileSync(file, 'utf8').match(/name="description" content="([^"]*)"/)?.[1]
      if (!desc) continue
      // Entities like &amp; count as one rendered character, not five.
      const rendered = desc.replace(/&[a-z]+;/g, 'x').length
      if (rendered > 165) bad.push(`${routeOf(file)} ${rendered}ch (too long)`)
      else if (rendered < 70) bad.push(`${routeOf(file)} ${rendered}ch (too short)`)
    }
    expect(bad).toEqual([])
  })
})
