/**
 * Per-component stylesheets: `dist/css/<name>.css`, one per component, plus `tokens.css`
 * and `reset.css`.
 *
 * `dist/styles.css` is the whole library in one file — 34 kB gzipped, of which a page that
 * uses a Button and a Card needs about 4. Consumers who care import the parts instead:
 *
 *   import '@the_viveksingh/vivek-ui/css/reset.css'
 *   import '@the_viveksingh/vivek-ui/css/tokens.css'
 *   import '@the_viveksingh/vivek-ui/css/button.css'
 *
 * Each part is the component's own stylesheet, minified with the same browser targets as
 * the bundle. Parts do not import each other: a component that needs another's styles
 * (Combobox uses Input's look) says so in its docs, and `styles.css` remains the answer for
 * anyone who would rather not think about it.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const UI = resolve(HERE, '..', 'packages', 'ui')
const COMPONENTS = join(UI, 'src', 'components')
const OUT = join(UI, 'dist', 'css')

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

/** [output name, source path] */
const parts = [
  ['reset.css', join(UI, 'src', 'styles', 'reset.css')],
  ['tokens.css', join(UI, 'src', 'styles', 'tokens.css')],
  ['touch.css', join(UI, 'src', 'styles', 'touch.css')],
]

for (const dir of readdirSync(COMPONENTS).sort()) {
  const path = join(COMPONENTS, dir)
  if (!statSync(path).isDirectory() || dir === 'internal') continue
  const css = readdirSync(path).filter((file) => file.endsWith('.css'))
  // One stylesheet per component directory is the convention; a directory with several
  // (toast has its provider styles alongside) gets them concatenated by lightningcss.
  for (const file of css) {
    const name = css.length === 1 ? `${dir}.css` : `${dir}-${file}`
    parts.push([name, join(path, file)])
  }
}

const bin = join(
  UI,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'lightningcss.cmd' : 'lightningcss',
)
for (const [name, source] of parts) {
  execFileSync(bin, ['--minify', '--browserslist', source, '-o', join(OUT, name)], {
    cwd: UI,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

console.log(`build-css-parts: ${parts.length} stylesheet(s) in dist/css/.`)
