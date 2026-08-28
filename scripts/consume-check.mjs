/**
 * Install the packed tarball with one package manager and import it in bare Node.
 *
 * Usage: node scripts/consume-check.mjs <npm|yarn|pnpm>   (TARBALL env = path to .tgz)
 *
 * This is the job that makes the README's "verified against npm, yarn and pnpm" sentence
 * true — before it existed, the claim was aspiration. It is also the only gate where a
 * module-scope `window` access would surface before a consumer hits it: the unit suite
 * runs in jsdom, where `window` always exists, so "server-safe by default" was otherwise
 * circumstantial.
 *
 * Both module systems are exercised because the exports map has two halves and each has
 * broken independently in this repo's history (the FalseESM types defect).
 */
import { execSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const pm = process.argv[2]
if (!['npm', 'yarn', 'pnpm'].includes(pm ?? '')) {
  console.error('usage: node scripts/consume-check.mjs <npm|yarn|pnpm>')
  process.exit(1)
}

const tarball = process.env.TARBALL
if (!tarball) {
  console.error('TARBALL env must point at the packed .tgz')
  process.exit(1)
}

const dir = join(process.env.RUNNER_TEMP ?? tmpdir(), `consume-${pm}`)
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })

const run = (cmd) => execSync(cmd, { cwd: dir, stdio: 'inherit', env: process.env })

writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: `consume-${pm}`, private: true }))

// yarn classic prompts on some registries without a lockfile; --non-interactive covers it.
const install = {
  npm: `npm install --no-audit --no-fund react react-dom "${tarball}"`,
  yarn: `yarn add --non-interactive react react-dom "file:${tarball}"`,
  pnpm: `pnpm add react react-dom "${tarball}"`,
}[pm]
run(install)

/*
 * The import checks live in files, not -e strings: quoting a JS program through a YAML
 * string through a shell is how these checks silently stop checking anything.
 */
writeFileSync(
  join(dir, 'check.mjs'),
  `import { Button, Segmented, Form } from '@the_viveksingh/vivek-ui'
import { ScatterChart, Gauge } from '@the_viveksingh/vivek-ui/charts'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
const html = renderToString(createElement(Button, null, 'ok'))
if (!html.includes('vk-button')) throw new Error('ESM SSR render failed')
// forwardRef components are exotic objects, not functions - render is the real check.
const chart = renderToString(createElement(ScatterChart, { title: 'S', data: [{ x: 1, y: 2 }] }))
if (!chart.includes('vk-scatter-chart')) throw new Error('charts subpath broken')
if (!Gauge) throw new Error('Gauge missing from charts subpath')
console.log('${pm}: ESM ok')
`,
)
writeFileSync(
  join(dir, 'check.cjs'),
  `const { Button } = require('@the_viveksingh/vivek-ui')
const { renderToString } = require('react-dom/server')
const { createElement } = require('react')
if (!renderToString(createElement(Button, null, 'ok')).includes('vk-button')) {
  throw new Error('CJS SSR render failed')
}
console.log('${pm}: CJS ok')
`,
)

run('node check.mjs')
run('node check.cjs')
console.log(`consume-check: ${pm} passed`)
