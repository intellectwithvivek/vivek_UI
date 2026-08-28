/**
 * Execute the shipped dist on whatever Node this process is — the engines-floor check.
 *
 * `engines` promises `node >= 18` and nothing used to run the built output on anything
 * but the development Node, so a utility quietly adopting `Array.prototype.toSorted` (Node
 * 20+) or a newer Intl option would pass every gate and crash a consumer's Node 18 SSR
 * fleet. CI calls this under the matrix Node after building under the development one.
 *
 * SSR-rendering a spread of components — not just importing — is the point: import alone
 * would miss a too-new API inside a render path.
 */
import { createRequire } from 'node:module'

/*
 * Resolution is anchored at packages/ui, not this script: pnpm does not hoist to the
 * repo root, so react-dom is only findable from inside the package that declares it.
 * The dist files' own bare `import 'react'` statements already resolve from their
 * location for the same reason.
 */
const require = createRequire(new URL('../packages/ui/package.json', import.meta.url))
const { renderToString } = require('react-dom/server')
const { createElement: h } = require('react')

// CJS half.
const cjs = require('./dist/index.cjs')
const cjsHtml = renderToString(h(cjs.Button, null, 'ok'))
if (!cjsHtml.includes('vk-button')) throw new Error('dist CJS render failed')

// ESM half, incl. components with real logic in their server render.
const esm = await import(new URL('../packages/ui/dist/index.js', import.meta.url))
const charts = await import(new URL('../packages/ui/dist/charts/index.js', import.meta.url))

const samples = [
  h(esm.Button, null, 'ok'),
  h(esm.FAQ, { items: [{ question: 'Q', answer: 'A' }], title: 'FAQ' }),
  h(esm.Segmented, {
    label: 'View',
    defaultValue: 'a',
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ],
  }),
  h(charts.ScatterChart, { title: 'S', data: [{ x: 1, y: 2 }] }),
  h(charts.Gauge, { title: 'G', value: 40 }),
  h(charts.Heatmap, { title: 'H', data: [{ x: 'a', y: 'b', value: 1 }] }),
]

for (const element of samples) {
  const html = renderToString(element)
  if (html.length < 20) throw new Error('suspiciously empty render')
}

console.log(`dist-smoke: ${process.version} renders CJS + ESM + charts`)
