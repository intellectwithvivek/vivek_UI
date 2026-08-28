/**
 * The block gallery, held to the same claim as the page templates: built only from the
 * published package, and the code shown is the code running. Plus the promise the gallery
 * exists to keep — ten heroes and ten headers.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BLOCK_CATEGORIES } from '../blocks'
import { blockPreviewSlugs } from '../components/block-preview'
import { blocks, componentsUsedAcrossBlocks } from './blocks'
import { allRoutes } from './routes'

const ROOT = join(__dirname, '..')
const read = (slug: string) => readFileSync(join(ROOT, 'blocks', `${slug}.tsx`), 'utf8')

const exported = new Set<string>()
const chartExports = new Set<string>()
const libraryLoaded = (async () => {
  const lib = await import('@the_viveksingh/vivek-ui')
  for (const name of Object.keys(lib)) exported.add(name)
  const charts = await import('@the_viveksingh/vivek-ui/charts')
  for (const name of Object.keys(charts)) chartExports.add(name)
})()

describe('blocks · the set', () => {
  it('has ten heroes and ten headers, and at least four of everything else', () => {
    const count = (category: string) => blocks.filter((b) => b.category === category).length
    expect(count('Heroes')).toBeGreaterThanOrEqual(10)
    expect(count('Headers')).toBeGreaterThanOrEqual(10)
    for (const category of BLOCK_CATEGORIES) {
      expect(count(category), category).toBeGreaterThanOrEqual(4)
    }
    expect(blocks.length).toBeGreaterThanOrEqual(60)
  })

  it('registers a preview module for every block, and no strays', () => {
    expect([...blockPreviewSlugs].sort()).toEqual(blocks.map((b) => b.slug).sort())
  })

  it('gives every block a route, so it reaches the sitemap', () => {
    const paths = new Set(allRoutes().map((route) => route.path))
    expect(paths.has('/blocks')).toBe(true)
    for (const block of blocks) expect(paths.has(`/blocks/${block.slug}`), block.slug).toBe(true)
  })

  it('has unique slugs and unique titles, and sensible frame heights', () => {
    const slugs = blocks.map((b) => b.slug)
    const titles = blocks.map((b) => b.title)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(titles).size).toBe(titles.length)
    for (const block of blocks) {
      expect(block.height, block.slug).toBeGreaterThanOrEqual(160)
      expect(block.height, block.slug).toBeLessThanOrEqual(1000)
    }
  })
})

describe('blocks · copy-and-run', () => {
  it('imports nothing but the package, its charts and React', async () => {
    await libraryLoaded
    for (const block of blocks) {
      const specifiers = Array.from(read(block.slug).matchAll(/from\s+'([^']+)'/g), (m) => m[1])
      for (const specifier of specifiers) {
        expect(
          ['@the_viveksingh/vivek-ui', '@the_viveksingh/vivek-ui/charts', 'react'],
          `${block.slug}.tsx imports "${specifier}"`,
        ).toContain(specifier)
      }
    }
  })

  it('lists only real exports as what it uses', async () => {
    await libraryLoaded
    for (const block of blocks) {
      for (const name of block.uses) expect(exported, `${block.slug} uses ${name}`).toContain(name)
      for (const name of block.chartUses) {
        expect(chartExports, `${block.slug} uses chart ${name}`).toContain(name)
      }
    }
  })

  it('shows the source that actually renders, byte for byte', () => {
    for (const block of blocks) {
      expect(block.source, block.slug).toBe(read(block.slug).replace(/\r\n/g, '\n'))
    }
  })

  it('marks a block as a client component when, and only when, it says so', () => {
    for (const block of blocks) {
      expect(block.isClient, block.slug).toBe(/^'use client'/m.test(read(block.slug)))
    }
  })

  it('default-exports a component', () => {
    for (const block of blocks) {
      expect(read(block.slug), block.slug).toMatch(/export default function \w+/)
    }
  })
})

describe('blocks · what search engines get', () => {
  it('writes a description inside the window Google renders, ending as a sentence', () => {
    for (const block of blocks) {
      expect(
        block.description.length,
        `${block.slug} is ${block.description.length}`,
      ).toBeGreaterThanOrEqual(60)
      expect(
        block.description.length,
        `${block.slug} is ${block.description.length}`,
      ).toBeLessThanOrEqual(200)
      expect(block.description.trim(), block.slug).toMatch(/[.!?]$/)
    }
  })
})

describe('blocks · coverage of the library', () => {
  it('exercises the section components and a broad slice beyond them', () => {
    const used = new Set(componentsUsedAcrossBlocks())
    for (const name of [
      'Hero',
      'Navbar',
      'Pricing',
      'FAQ',
      'CTA',
      'Footer',
      'Stats',
      'Testimonials',
      'FeatureGrid',
    ]) {
      expect(used, `no block uses ${name}`).toContain(name)
    }
    expect(used.size).toBeGreaterThanOrEqual(30)
  })

  it('is mostly server-safe: at most a handful of blocks need a client boundary', () => {
    expect(blocks.filter((block) => block.isClient).length).toBeLessThanOrEqual(3)
  })
})
