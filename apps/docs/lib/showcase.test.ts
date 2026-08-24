/**
 * The showcase makes claims about twelve sites that live outside this repository.
 *
 * Nothing here can check that those sites are up — a test that hits the network fails when
 * the wifi does. What it *can* check is that every claim is internally consistent: that the
 * components each site says it demonstrates actually exist, that the links are well formed,
 * and that the repository and live URLs are the ones the author gave rather than a typo that
 * sends a visitor to a 404 on someone else's domain.
 *
 * The component check is the one that matters. Those names become links into the docs, and a
 * name that does not exist is both a dead link and a false claim about what the site shows.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { registry } from './registry'
import { cloneCommand, displayUrl, SHOWCASE, SHOWCASE_CATEGORIES } from './showcase'

const exported = new Set([
  ...registry.components.flatMap((entry) => entry.exports),
  ...registry.charts.flatMap((entry) => entry.exports),
])

describe('showcase data', () => {
  it('has twelve sites with unique slugs', () => {
    expect(SHOWCASE).toHaveLength(12)
    expect(new Set(SHOWCASE.map((site) => site.slug)).size).toBe(12)
  })

  it('names only components the library actually exports', () => {
    // These render as links to /docs/components/<slug>. An invented name is a dead link and
    // a claim about the site that nobody can check.
    const unknown = SHOWCASE.flatMap((site) =>
      site.components.filter((name) => !exported.has(name)).map((name) => `${site.slug}: ${name}`),
    )
    expect(unknown, 'not exported by the library').toEqual([])
  })

  it('serves every live site over https', () => {
    // The site is HSTS-preloaded and the CSP upgrades insecure requests; an http URL here
    // would be silently rewritten in some browsers and blocked in others.
    const insecure = SHOWCASE.filter((site) => !site.live.startsWith('https://')).map((s) => s.slug)
    expect(insecure).toEqual([])
  })

  it('points every repository at a GitHub URL with no .git suffix', () => {
    // The suffix is added by `cloneCommand`. Storing it here as well produces `.git.git`.
    const wrong = SHOWCASE.filter(
      (site) => !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(site.repo),
    ).map((site) => `${site.slug}: ${site.repo}`)
    expect(wrong).toEqual([])
  })

  it('builds a clone command that ends in exactly one .git', () => {
    for (const site of SHOWCASE) {
      const command = cloneCommand(site)
      expect(command.startsWith('git clone https://github.com/')).toBe(true)
      expect(command.endsWith('.git')).toBe(true)
      expect(command.match(/\.git/g)).toHaveLength(1)
    }
  })

  it('shows a host in the URL pill, not a full URL', () => {
    for (const site of SHOWCASE) {
      expect(displayUrl(site)).not.toContain('://')
      expect(displayUrl(site)).toContain('.')
    }
  })

  it('uses only declared categories, and every declared category is used', () => {
    const used = new Set(SHOWCASE.map((site) => site.category))
    for (const site of SHOWCASE) expect(SHOWCASE_CATEGORIES).toContain(site.category)
    // An unused category renders an empty heading on the index.
    const unused = SHOWCASE_CATEGORIES.filter((category) => !used.has(category))
    expect(unused).toEqual([])
  })

  it('gives every site the copy a card and a meta description need', () => {
    for (const site of SHOWCASE) {
      expect(site.name.length, site.slug).toBeGreaterThan(2)
      expect(site.tagline.length, site.slug).toBeGreaterThan(40)
      expect(site.detail.length, site.slug).toBeGreaterThan(80)
      expect(site.highlights.length, site.slug).toBeGreaterThan(1)
    }
  })

  it('keeps the tagline short enough to survive as a meta description', () => {
    // The detail page appends this suffix, and `canonical.test.ts` rejects any rendered
    // description over 165 characters. The first version of this budgeted 190 and let nine
    // pages ship with a description Google would truncate mid-sentence.
    const suffix = ' Free and MIT licensed, source on GitHub.'
    const long = SHOWCASE.filter((site) => site.tagline.length + suffix.length > 165).map(
      (site) => `${site.slug}: ${site.tagline.length + suffix.length}`,
    )
    expect(long).toEqual([])
  })
})

const INDEX = join(__dirname, '..', '.next', 'server', 'app', 'showcase.html')
const built = existsSync(INDEX)

describe.skipIf(!built)('the framed previews', () => {
  const html = built ? readFileSync(INDEX, 'utf8') : ''
  const frames = [...html.matchAll(/<iframe[^>]*>/g)].map((match) => match[0])

  it('renders one thumbnail per site', () => {
    expect(frames).toHaveLength(SHOWCASE.length)
  })

  it('lazy-loads every one', () => {
    // Twelve full applications on one page is only defensible because the browser fetches
    // the frames near the viewport and no others. Drop this and the page pulls twelve sites
    // on first paint.
    const eager = frames.filter((frame) => !/loading="lazy"/.test(frame))
    expect(eager).toEqual([])
  })

  it('grants allow-same-origin, without which the sites render blank', () => {
    // An opaque origin makes every localStorage access throw a SecurityError rather than
    // returning null. These sites read localStorage on mount for their theme, so the
    // exception lands during hydration and nothing renders — a white rectangle, no error.
    const opaque = frames.filter(
      (frame) => /sandbox=/.test(frame) && !/allow-same-origin/.test(frame),
    )
    expect(opaque, 'sandboxed into an opaque origin').toEqual([])
  })

  it('keeps every frame sandboxed and out of the accessibility tree', () => {
    for (const frame of frames) {
      expect(frame, 'unsandboxed frame').toMatch(/sandbox="/)
      // Decorative duplication of the card's link: announcing it would read a whole website
      // to a screen-reader user who asked for a card.
      expect(frame, 'thumbnail is not hidden from AT').toMatch(/aria-hidden="true"/)
    }
  })
})
