/**
 * The on-page signals a search engine and an answer engine actually read.
 *
 * `canonical.test.ts` covers canonicals, titles and description lengths. This covers the
 * rest of the surface, and it exists because all of it is invisible while browsing: a page
 * with three `<h1>`s, a heading outline that jumps h2 to h4, or an image with no `alt`
 * renders perfectly and is worse for every reader that is not a pair of eyes.
 *
 * Each of these caught something real on its first run — three extra `<h1>`s across two
 * component pages, and seven pages skipping a heading level, four of them from the
 * generated props table.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const BUILD = join(__dirname, '..', '.next', 'server', 'app')

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return htmlFiles(path)
    return entry.name.endsWith('.html') ? [path] : []
  })
}

function routeOf(file: string): string {
  const rel = file.split(sep).join('/').split('/server/app')[1] ?? ''
  const route = rel.replace(/\.html$/, '')
  return route === '/index' ? '/' : route
}

const built = existsSync(BUILD)
const pages = built
  ? htmlFiles(BUILD)
      .filter((file) => !/_global-error/.test(file))
      .map((file) => ({ route: routeOf(file), html: readFileSync(file, 'utf8') }))
  : []

describe.skipIf(!built)('on-page SEO across the built site', () => {
  it('found pages to check', () => {
    expect(pages.length).toBeGreaterThan(100)
  })

  it('gives every page exactly one h1', () => {
    // Two h1s split the topic signal a search engine reads, and give a screen-reader user
    // two "top" headings to choose between. The Hero and Heading previews each rendered a
    // real h1 inside a page that already had one.
    const wrong = pages
      .map(({ route, html }) => ({ route, count: [...html.matchAll(/<h1\b/g)].length }))
      .filter(({ count }) => count !== 1)
      .map(({ route, count }) => `${route}: ${count}`)
    expect(wrong).toEqual([])
  })

  it('never skips a heading level', () => {
    // WCAG 1.3.1, and axe's own `heading-order` rule. A jump from h2 to h4 tells assistive
    // tech there is a missing section between them.
    const skips: string[] = []
    for (const { route, html } of pages) {
      const levels = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]))
      for (let index = 1; index < levels.length; index++) {
        const previous = levels[index - 1] ?? 0
        const current = levels[index] ?? 0
        if (current - previous > 1) {
          skips.push(`${route}: h${previous} -> h${current}`)
          break
        }
      }
    }
    expect(skips).toEqual([])
  })

  it('gives every image an alt attribute', () => {
    // An `<img>` with no `alt` at all is announced by its filename or its URL. Decorative
    // images need `alt=""`, which this accepts — what it rejects is the attribute missing.
    const missing: string[] = []
    for (const { route, html } of pages) {
      for (const match of html.matchAll(/<img\b[^>]*>/g)) {
        if (!/\salt=/.test(match[0])) missing.push(`${route}: ${match[0].slice(0, 80)}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('gives every page the social card tags', () => {
    // Without these a shared link renders as a bare URL, which is most of what a link is
    // worth on a social feed or in a chat client.
    const missing: string[] = []
    for (const { route, html } of pages) {
      if (!/property="og:title"/.test(html)) missing.push(`${route}: no og:title`)
      if (!/name="twitter:card"/.test(html)) missing.push(`${route}: no twitter:card`)
    }
    expect(missing).toEqual([])
  })

  it('declares a language and a viewport on every page', () => {
    const missing: string[] = []
    for (const { route, html } of pages) {
      if (!/<html[^>]+lang="/.test(html)) missing.push(`${route}: no lang`)
      if (!/name="viewport"/.test(html)) missing.push(`${route}: no viewport`)
    }
    expect(missing).toEqual([])
  })
})

describe.skipIf(!built)('structured data', () => {
  const blocks = pages.flatMap(({ route, html }) =>
    [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
      (match) => ({ route, raw: match[1] ?? '' }),
    ),
  )

  it('is on every page', () => {
    const without = pages
      .filter(({ html }) => !/application\/ld\+json/.test(html))
      .map(({ route }) => route)
    expect(without).toEqual([])
  })

  it('parses as JSON', () => {
    // A single unescaped character makes the whole block invisible to a crawler, and
    // nothing on the page looks different.
    const broken: string[] = []
    for (const { route, raw } of blocks) {
      try {
        JSON.parse(raw.replace(/\\u003c/g, '<'))
      } catch (error) {
        broken.push(`${route}: ${(error as Error).message.slice(0, 60)}`)
      }
    }
    expect(broken).toEqual([])
  })

  it('gives every node an @context and an @type', () => {
    const bad: string[] = []
    for (const { route, raw } of blocks) {
      let parsed: unknown
      try {
        parsed = JSON.parse(raw.replace(/\\u003c/g, '<'))
      } catch {
        continue
      }
      for (const node of (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[]) {
        if (!node['@context']) bad.push(`${route}: ${String(node['@type'])} has no @context`)
        if (!node['@type']) bad.push(`${route}: a node has no @type`)
      }
    }
    expect(bad).toEqual([])
  })

  it('emits the types answer engines actually use', () => {
    const types = new Set<string>()
    for (const { raw } of blocks) {
      let parsed: unknown
      try {
        parsed = JSON.parse(raw.replace(/\\u003c/g, '<'))
      } catch {
        continue
      }
      for (const node of (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[]) {
        if (typeof node['@type'] === 'string') types.add(node['@type'])
      }
    }
    // SoftwareApplication carries the price-of-zero, FAQPage is the one that wins rich
    // results, and BreadcrumbList is what puts a readable trail under the search result.
    for (const required of [
      'SoftwareApplication',
      'WebSite',
      'TechArticle',
      'BreadcrumbList',
      'FAQPage',
    ]) {
      expect(types, `no ${required} anywhere on the site`).toContain(required)
    }
  })
})
