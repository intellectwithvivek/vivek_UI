/**
 * Keeps the sitemap honest.
 *
 * The failure this prevents is silent and permanent: someone adds a page, never adds it to
 * `GUIDES`, and it is simply never submitted for indexing. Nothing errors, nothing looks
 * wrong, and the page gets no traffic for as long as the site exists.
 *
 * So the route list is checked against the filesystem in both directions.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { registry } from './registry'
import { allRoutes, GUIDES, TOP_ROUTES } from './routes'

const APP = join(__dirname, '..', 'app')

/** Directories under app/docs that are real pages, excluding dynamic segments. */
function docsPageDirs(): string[] {
  return readdirSync(join(APP, 'docs'))
    .filter((name) => {
      const path = join(APP, 'docs', name)
      if (!statSync(path).isDirectory()) return false
      // `[slug]` routes are generated from the registry, not from this list.
      if (name.startsWith('[')) return false
      return existsSync(join(path, 'page.tsx'))
    })
    .sort()
}

describe('route list', () => {
  const guideSlugs = GUIDES.map((guide) => guide.slug).sort()
  const dirs = docsPageDirs()

  it('lists every hand-written guide page that exists on disk', () => {
    // `components` and `charts` are index pages and live in TOP_ROUTES instead.
    const expected = dirs.filter((name) => name !== 'components' && name !== 'charts')
    expect(guideSlugs).toEqual(expected)
  })

  it('does not list a guide whose page was deleted', () => {
    for (const slug of guideSlugs) {
      expect(existsSync(join(APP, 'docs', slug, 'page.tsx')), `/docs/${slug}`).toBe(true)
    }
  })

  it('covers every component and chart in the registry', () => {
    const paths = new Set(allRoutes().map((route) => route.path))
    for (const entry of registry.components) {
      expect(paths.has(`/docs/components/${entry.slug}`), entry.slug).toBe(true)
    }
    for (const entry of registry.charts) {
      expect(paths.has(`/docs/charts/${entry.slug}`), entry.slug).toBe(true)
    }
  })

  it('has the top-level pages it claims', () => {
    for (const route of TOP_ROUTES) {
      if (route.path === '/') {
        expect(existsSync(join(APP, 'page.tsx'))).toBe(true)
        continue
      }
      const dir = join(APP, ...route.path.split('/').filter(Boolean))
      expect(existsSync(join(dir, 'page.tsx')), route.path).toBe(true)
    }
  })

  it('emits no duplicate URLs', () => {
    // A duplicated URL in a sitemap is not fatal but it is a signal of a generated file
    // nobody checks, and it splits whatever ranking the page has.
    const paths = allRoutes().map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('keeps every path root-relative with no trailing slash', () => {
    for (const route of allRoutes()) {
      expect(route.path.startsWith('/'), route.path).toBe(true)
      if (route.path !== '/') {
        expect(route.path.endsWith('/'), route.path).toBe(false)
      }
    }
  })
})
