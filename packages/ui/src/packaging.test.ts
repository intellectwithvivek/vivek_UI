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
import { readdirSync, readFileSync } from 'node:fs'
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

  it('ships the print stylesheet printElement depends on', () => {
    // printElement's docblock told people to load styles/print.css for a release in which
    // no such file was bundled or exported - a shipped feature that could not work. The
    // subpath plus this test keep the docblock honest.
    expect(PKG.exports['./print.css']).toBe('./dist/print.css')
    expect(PKG.scripts['build:css']).toContain('src/styles/print.css -o dist/print.css')
  })

  it('excludes every stylesheet export from the are-the-types-wrong check in CI', () => {
    // attw models JS and type resolution only; a .css subpath reports NoResolution, which
    // is a tool limitation and not a defect. The exclusion list in ci.yml is hand-written,
    // and ./print.css was added to exports without extending it - CI went red for a whole
    // push. Now the list cannot fall behind the exports map.
    const ci = readFileSync(join(ROOT, '..', '..', '.github', 'workflows', 'ci.yml'), 'utf8')
    const flag = ci.match(/--exclude-entrypoints (.*)/)?.[1] ?? ''
    const cssExports = Object.keys(PKG.exports).filter((key) => key.endsWith('.css'))
    expect(cssExports.length).toBeGreaterThan(0)
    for (const subpath of cssExports) {
      expect(flag, `${subpath} missing from attw --exclude-entrypoints`).toContain(subpath)
    }
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

describe('the description npm shows in search results', () => {
  /*
   * The description claimed "100+ components" while the README and the documentation site
   * both said 83. Whichever number is right, an evaluator who reads the npm page and then
   * the site sees a contradiction - and that is worse than either figure being slightly off.
   *
   * The counts are derived from the source tree here, so the description cannot drift away
   * from the library as components are added. It is a static string in package.json, so this
   * fails and tells you to update it rather than fixing it silently.
   */
  const componentDirs = readdirSync(join(ROOT, 'src', 'components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'internal')
    .map((entry) => entry.name)

  const chartDirs = readdirSync(join(ROOT, 'src', 'charts'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'internal')
    .map((entry) => entry.name)

  it('states the real number of components', () => {
    expect(
      PKG.description,
      `there are ${componentDirs.length} component directories; update the description in package.json`,
    ).toContain(`${componentDirs.length} accessible`)
  })

  it('states the real number of charts', () => {
    expect(
      PKG.description,
      `there are ${chartDirs.length} chart directories; update the description in package.json`,
    ).toContain(`${chartDirs.length} SVG charts`)
  })

  it('stays inside the length npm renders without truncating', () => {
    // npm truncates around 250 characters in search listings; the whole point of the
    // description is the part a stranger reads before deciding to click.
    expect(PKG.description.length).toBeLessThanOrEqual(300)
  })
})
