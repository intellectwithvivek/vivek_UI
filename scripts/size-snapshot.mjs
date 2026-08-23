/**
 * Record what the library actually weighs, so the website cannot quote a figure that stopped
 * being true.
 *
 * The docs stated 40.8 kB for the whole core library while size-limit measured 47.35 kB, and
 * the test guarding that number passed the entire time — because it compared the *stated*
 * figure against the *budget* (48 kB) rather than against the measurement. A claim under the
 * budget is not a claim that is true; every understatement passes a check like that.
 *
 * So the measurement is written down here, and two things read it: the docs test, which
 * asserts the numbers on the site match it, and `--check`, which re-measures and fails when
 * the snapshot has drifted. Actual -> snapshot -> stated, with no gap in the middle.
 *
 *   node scripts/size-snapshot.mjs            # measure and write
 *   node scripts/size-snapshot.mjs --check    # measure and fail on drift
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const HERE = dirname(fileURLToPath(import.meta.url))
const UI = resolve(HERE, '..', 'packages', 'ui')
// Written into the docs app rather than beside the library: the app is the only thing that
// reads it, and one file that both the check and the website share is the whole point.
const OUT = resolve(HERE, '..', 'apps', 'docs', 'size-snapshot.json')

/**
 * How far a measurement may move before this fails.
 *
 * Not zero: brotli output varies by a byte or two across versions, and failing CI on that
 * teaches people to regenerate the file without reading it. Wide enough to absorb noise,
 * narrow enough that a real component landing in a bundle shows up.
 */
const TOLERANCE = 0.03

const check = process.argv.includes('--check')

/**
 * Run size-limit's own entry point directly rather than through `npx`.
 *
 * `execFileSync` with `shell: true` concatenates arguments instead of escaping them, which
 * Node deprecated for exactly the reason it sounds like. Resolving the bin means no shell.
 */
const requireFromUi = createRequire(join(UI, 'package.json'))
const sizeLimitPkgPath = requireFromUi.resolve('size-limit/package.json')
const sizeLimitPkg = JSON.parse(readFileSync(sizeLimitPkgPath, 'utf8'))
const sizeLimitBin =
  typeof sizeLimitPkg.bin === 'string' ? sizeLimitPkg.bin : sizeLimitPkg.bin['size-limit']

/**
 * size-limit exits non-zero when a budget is blown, which makes `execFileSync` throw — but
 * it has already printed the JSON we want, and that JSON is how this reports *which* budget
 * went. So the output is taken off the error rather than the throw being allowed to stand.
 */
function runSizeLimit() {
  const args = [join(dirname(sizeLimitPkgPath), sizeLimitBin), '--json']
  const options = { cwd: UI, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }
  try {
    return JSON.parse(execFileSync(process.execPath, args, options))
  } catch (error) {
    const stdout = typeof error?.stdout === 'string' ? error.stdout.trim() : ''
    if (stdout.startsWith('[')) return JSON.parse(stdout)
    throw error
  }
}

const measured = runSizeLimit()

// size-limit's own verdict. This script replaces the separate `size-limit` invocation in the
// `size` script, so a blown budget has to fail here or it stops failing anywhere.
const overBudget = measured.filter((entry) => entry.passed === false)
if (overBudget.length > 0) {
  console.error('size-limit: over budget.')
  for (const entry of overBudget) {
    console.error(
      `  - ${entry.name}: ${(entry.size / 1000).toFixed(2)} kB against a limit of ` +
        `${(entry.sizeLimit / 1000).toFixed(2)} kB`,
    )
  }
  process.exit(1)
}

const bundles = Object.fromEntries(measured.map((entry) => [entry.name, entry.size]))

// The stylesheet is not in size-limit's remit — it is a static file, not an entry point —
// but it is the single biggest thing a consumer downloads, so quoting it is fair game and
// it needs the same protection from going stale.
const css = {}
for (const [name, file] of [
  ['styles.css', 'dist/styles.css'],
  ['charts.css', 'dist/charts.css'],
]) {
  const contents = readFileSync(join(UI, file))
  css[name] = {
    raw: contents.length,
    gzip: gzipSync(contents, { level: 9 }).length,
    brotli: brotliCompressSync(contents).length,
  }
}

const snapshot = { bundles, css }
const json = `${JSON.stringify(snapshot, null, 2)}\n`

// --- the README tables -------------------------------------------------------------------

/** 771 -> "771 B"; 47354 -> "47.4 kB". Decimal kB, as size-limit reports. */
const kb = (bytes) => (bytes < 1000 ? `${bytes} B` : `${(bytes / 1000).toFixed(1)} kB`)

/**
 * Both READMEs quote these figures, and both had drifted badly — Button was listed at 198 B
 * against a real 771 B, and the whole library at 41.6 kB against 47.35 kB. Nothing checked
 * them, because a README is prose. Generating the table between markers makes it checkable.
 */
const READMES = [resolve(HERE, '..', 'README.md'), join(UI, 'README.md')]

const ROWS = [
  ['`{ Button }`', 'Button only'],
  ['`{ Modal }` (focus trap + scroll lock + portal)', 'Modal (focus trap + scroll lock + portal)'],
  [
    'A whole landing page (`Hero`+`FeatureGrid`+`Pricing`+`FAQ`+`CTA`+`Footer`)',
    'A landing page (Hero+Features+Pricing+FAQ+CTA+Footer)',
  ],
  ['All six charts', 'All charts'],
  ['Every component, imported at once', 'Whole core library'],
]

function sizeTable() {
  const lines = ['| Import | Cost |', '|---|---|']
  for (const [label, key] of ROWS) {
    const size = bundles[key]
    if (size === undefined) throw new Error(`size-limit has no entry named "${key}"`)
    lines.push(`| ${label} | **${kb(size)}** |`)
  }
  for (const [file, sizes] of Object.entries(css)) {
    lines.push(`| \`${file}\` | ${kb(sizes.raw)} raw, **${kb(sizes.gzip)} gzipped** |`)
  }
  return lines.join('\n')
}

const badge = () =>
  `[![one component](https://img.shields.io/badge/one%20component-${encodeURIComponent(
    kb(bundles['Button only'] ?? 0),
  ).replace(/%20/g, '%20')}-4f46e5)](#how-small-actually)`

/** Replace what sits between `<!-- name:start -->` and `<!-- name:end -->`. */
function fill(text, name, body) {
  const start = `<!-- ${name}:start -->`
  const end = `<!-- ${name}:end -->`
  const from = text.indexOf(start)
  const to = text.indexOf(end)
  if (from === -1 || to === -1) throw new Error(`missing ${start} / ${end} marker`)
  return `${text.slice(0, from + start.length)}\n${body}\n${text.slice(to)}`
}

const renderReadme = (text) => fill(fill(text, 'size-table', sizeTable()), 'size-badge', badge())

if (!check) {
  writeFileSync(OUT, json)
  for (const path of READMES) writeFileSync(path, renderReadme(readFileSync(path, 'utf8')))
  console.log('size-snapshot: written, and both READMEs updated.')
  for (const [name, size] of Object.entries(bundles)) {
    console.log(`  ${(size / 1000).toFixed(2).padStart(7)} kB  ${name}`)
  }
  for (const [name, sizes] of Object.entries(css)) {
    console.log(`  ${(sizes.gzip / 1000).toFixed(2).padStart(7)} kB  ${name} (gzip)`)
  }
  process.exit(0)
}

for (const path of READMES) {
  const current = readFileSync(path, 'utf8')
  if (renderReadme(current) !== current) {
    console.error(
      `size-snapshot: ${path} quotes sizes that no longer match the build. ` +
        'Run `pnpm size:update`.',
    )
    process.exit(1)
  }
}

let previous
try {
  previous = JSON.parse(readFileSync(OUT, 'utf8'))
} catch {
  console.error('size-snapshot: no snapshot recorded. Run `pnpm size:update`.')
  process.exit(1)
}

const drifted = []

const compare = (label, was, now) => {
  if (typeof was !== 'number') {
    drifted.push(`${label}: not in the snapshot (${now} B measured)`)
    return
  }
  const change = Math.abs(now - was) / was
  if (change > TOLERANCE) {
    const direction = now > was ? 'grew' : 'shrank'
    drifted.push(
      `${label}: ${direction} from ${(was / 1000).toFixed(2)} kB to ${(now / 1000).toFixed(2)} kB ` +
        `(${(change * 100).toFixed(1)}%)`,
    )
  }
}

for (const [name, size] of Object.entries(bundles)) compare(name, previous.bundles?.[name], size)
for (const [name, sizes] of Object.entries(css)) {
  compare(`${name} (gzip)`, previous.css?.[name]?.gzip, sizes.gzip)
}

if (drifted.length > 0) {
  console.error('size-snapshot: the recorded sizes are out of date.\n')
  for (const line of drifted) console.error(`  - ${line}`)
  console.error(
    '\nIf the change is intended, run `pnpm size:update` and check whether any figure quoted' +
      '\non the website needs updating with it — apps/docs asserts against this file.',
  )
  process.exit(1)
}

console.log(
  `size-snapshot: OK - ${Object.keys(bundles).length} bundles within ${TOLERANCE * 100}%.`,
)
