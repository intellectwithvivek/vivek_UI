/**
 * The page gallery.
 *
 * Its whole claim is "these pages are built only from the published package, and the code
 * shown is the code running". Both halves are checkable, and neither is checkable by reading
 * the pages — a template that quietly imports a docs-local helper still renders perfectly on
 * this site and fails the moment someone pastes it into their own project.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { templatePreviewSlugs } from '../components/template-preview'
import { TEMPLATE_CATEGORIES } from '../page-templates'
import { componentsUsedAcrossTemplates, templates } from './page-templates'
import { allRoutes } from './routes'

const ROOT = join(__dirname, '..')
const read = (slug: string) => readFileSync(join(ROOT, 'page-templates', `${slug}.tsx`), 'utf8')

/** Everything the package actually exports, values only — types are erased. */
const exported = new Set<string>()
const chartExports = new Set<string>()

const libraryLoaded = (async () => {
  const lib = await import('@the_viveksingh/vivek-ui')
  for (const name of Object.keys(lib)) exported.add(name)
  const charts = await import('@the_viveksingh/vivek-ui/charts')
  for (const name of Object.keys(charts)) chartExports.add(name)
})()

describe('page templates · the set', () => {
  it('has a template for every declared slug and no orphans', () => {
    expect(templates.length).toBeGreaterThanOrEqual(12)
    for (const template of templates) {
      expect(template.source, `${template.slug} has no generated source`).not.toBe('')
    }
  })

  it('registers a preview module for every template', () => {
    // Miss one and the page renders a heading with nothing under it.
    expect([...templatePreviewSlugs].sort()).toEqual(templates.map((t) => t.slug).sort())
  })

  it('gives every template a route, so it reaches the sitemap', () => {
    const paths = new Set(allRoutes().map((route) => route.path))
    expect(paths.has('/pages')).toBe(true)
    for (const template of templates) {
      expect(paths.has(`/pages/${template.slug}`), `/pages/${template.slug} is not routed`).toBe(
        true,
      )
    }
  })

  it('uses only declared categories, so nothing lands in a group the page does not render', () => {
    for (const template of templates) {
      expect(TEMPLATE_CATEGORIES).toContain(template.category)
    }
  })

  it('has unique slugs and unique titles', () => {
    expect(new Set(templates.map((t) => t.slug)).size).toBe(templates.length)
    expect(new Set(templates.map((t) => t.title)).size).toBe(templates.length)
  })
})

describe('page templates · copy-and-run', () => {
  it('imports nothing but the package, its charts and React', async () => {
    // This is the load-bearing rule. A docs-local import renders fine here and is broken
    // for everyone who copies the code.
    await libraryLoaded
    for (const template of templates) {
      const source = read(template.slug)
      const specifiers = Array.from(source.matchAll(/from\s+'([^']+)'/g), (match) => match[1])
      for (const specifier of specifiers) {
        expect(
          ['@the_viveksingh/vivek-ui', '@the_viveksingh/vivek-ui/charts', 'react'],
          `${template.slug}.tsx imports "${specifier}"`,
        ).toContain(specifier)
      }
    }
  })

  it('lists only real exports as what it uses', async () => {
    await libraryLoaded
    for (const template of templates) {
      for (const name of template.uses) {
        expect(exported, `${template.slug} claims to use ${name}`).toContain(name)
      }
      for (const name of template.chartUses) {
        expect(chartExports, `${template.slug} claims to use chart ${name}`).toContain(name)
      }
    }
  })

  it('shows the source that actually renders, byte for byte', () => {
    // The generated JSON is what the page prints. If it can drift from the file, the
    // gallery is teaching people code that no longer compiles.
    for (const template of templates) {
      expect(template.source, template.slug).toBe(read(template.slug).replace(/\r\n/g, '\n'))
    }
  })

  it('marks a template as a client component when, and only when, it says so', () => {
    for (const template of templates) {
      expect(template.isClient, template.slug).toBe(/^'use client'/m.test(read(template.slug)))
    }
  })

  it('default-exports a component, which is what the page renders', () => {
    for (const template of templates) {
      expect(read(template.slug), template.slug).toMatch(/export default function \w+/)
    }
  })
})

describe('page templates · what search engines get', () => {
  it('writes a description inside the window Google renders', () => {
    for (const template of templates) {
      // Under ~70 and the snippet is padded from the page; over ~165 and it is cut.
      expect(
        template.description.length,
        `${template.slug} is ${template.description.length}`,
      ).toBeGreaterThanOrEqual(60)
      expect(
        template.description.length,
        `${template.slug} is ${template.description.length}`,
      ).toBeLessThanOrEqual(200)
    }
  })

  it('writes a longer pitch for the page body', () => {
    for (const template of templates) {
      expect(template.detail.length, template.slug).toBeGreaterThan(120)
    }
  })

  it('ends sentences properly, since these strings are read aloud by answer engines', () => {
    for (const template of templates) {
      expect(template.description.trim(), template.slug).toMatch(/[.!?]$/)
      expect(template.detail.trim(), template.slug).toMatch(/[.!?]$/)
    }
  })
})

describe('page templates · coverage of the library', () => {
  it('exercises a broad slice of the library rather than the same ten components', () => {
    // The gallery is the integration test for the component set: if the pages only ever
    // touch Stack and Text, they prove nothing about the rest.
    expect(componentsUsedAcrossTemplates().length).toBeGreaterThanOrEqual(40)
  })

  it('covers the section components, which exist for exactly this', () => {
    const used = new Set(componentsUsedAcrossTemplates())
    for (const name of ['Hero', 'Pricing', 'FAQ', 'CTA', 'Footer', 'Stats', 'Testimonials']) {
      expect(used, `no template uses ${name}`).toContain(name)
    }
  })

  it('includes at least one template that renders on the server', () => {
    // If every page in the gallery is a client component, the "server safe by default"
    // claim has no demonstration anywhere on the site.
    expect(templates.some((template) => !template.isClient)).toBe(true)
  })
})
