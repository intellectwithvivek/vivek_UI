/**
 * Checks the metadata people actually see before they install anything.
 *
 * The npm package page is the first thing a developer evaluating this library looks at, and
 * for a long time it linked nowhere useful: `homepage` pointed at a README anchor on GitHub,
 * chosen before the documentation site existed, and the README itself never mentioned the
 * site at all. Both were true once and then quietly were not.
 *
 * Nothing about that is visible from inside the repo, which is why it is asserted here.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(__dirname, '..')
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const README = readFileSync(join(ROOT, 'README.md'), 'utf8')

/** The live documentation site. Also the `homepage` npm renders in its sidebar. */
const DOCS_URL = 'https://ui.vivekkumarsingh.in'

describe('package metadata', () => {
  it('points homepage at the documentation site', () => {
    // npm shows this as the package's primary link. A GitHub README anchor is a worse
    // destination than a site with a page per component.
    expect(PKG.homepage).toBe(DOCS_URL)
  })

  it('declares repository and bugs, so npm renders both links', () => {
    expect(PKG.repository?.url).toContain('github.com/intellectwithvivek/vivek_UI')
    // `directory` matters in a monorepo: without it "Repository" links to the repo root and
    // the provenance UI cannot find the package's own source.
    expect(PKG.repository?.directory).toBe('packages/ui')
    expect(PKG.bugs?.url).toContain('/issues')
  })

  it('has no runtime dependencies', () => {
    // The central claim of the package. Cheap to assert, catastrophic to get wrong.
    expect(PKG.dependencies, 'a `dependencies` field appeared').toBeUndefined()
    expect(Object.keys(PKG.peerDependencies ?? {}).sort()).toEqual(['react', 'react-dom'])
  })

  it('ships only dist', () => {
    expect(PKG.files).toEqual(['dist'])
  })
})

describe('the README npm renders', () => {
  it('links the documentation site above the fold', () => {
    // "Above the fold" being the header block, before the install instructions - the only
    // part most people read.
    const header = README.slice(0, README.indexOf('## Install'))
    expect(header, 'the docs site is not linked before the install section').toContain(DOCS_URL)
  })

  it('links the pages a newcomer needs, not just the home page', () => {
    for (const path of ['/docs/components', '/docs/charts', '/playground', '/docs/installation']) {
      expect(README, `no link to ${path}`).toContain(`${DOCS_URL}${path}`)
    }
  })

  it('does not describe the documentation site as unfinished', () => {
    // The roadmap listed it under "Next" for several releases after it shipped.
    const roadmap = README.slice(README.indexOf('## Roadmap'))
    expect(roadmap).not.toMatch(/\|\s*Next\s*\|\s*Documentation site/)
  })

  it('quotes a component size that matches the size-limit budget', () => {
    // The badge said 198 B against a measured 773 B. A specific number is worth more than a
    // vague one only while it is right.
    const badge = README.match(/one%20component-(\d+)%20B/)
    expect(badge?.[1], 'the one-component badge is missing or reformatted').toBeDefined()
    const stated = Number(badge?.[1])
    const budget = (PKG['size-limit'] as Array<{ name: string; limit: string }>).find((entry) =>
      entry.name.toLowerCase().includes('button'),
    )
    expect(budget, 'no size-limit budget mentions Button').toBeDefined()
    const limitBytes = Number.parseFloat(budget?.limit ?? '0') * 1000
    expect(stated, `README says ${stated} B, budget is ${budget?.limit}`).toBeLessThanOrEqual(
      limitBytes,
    )
  })
})
