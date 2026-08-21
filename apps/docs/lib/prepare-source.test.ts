/**
 * These run under the library package's Vitest (the docs app has no test runner of its
 * own), invoked with `pnpm --filter @the_viveksingh/vivek-ui vitest run --dir ../../apps/docs`.
 * Kept here because the bug they guard was reported from the running playground: pasting a
 * docs example failed with "Unexpected token 'default'".
 */
import { describe, expect, it } from 'vitest'
import { prepareSource } from './prepare-source'

describe('prepareSource', () => {
  it('strips a default export so the code is script-safe', () => {
    const { code, resolver } = prepareSource(`export default function Page() {
  return <p>hi</p>
}`)
    expect(code).not.toContain('export')
    expect(code).toContain('function Page()')
    expect(resolver).toContain('Page')
  })

  it('drops single-line imports', () => {
    const { code } = prepareSource(`import { Button } from '@the_viveksingh/vivek-ui'
import '@the_viveksingh/vivek-ui/styles.css'
function App() { return <Button /> }`)
    expect(code).not.toContain('import')
    expect(code).toContain('function App()')
  })

  it('drops multi-line imports', () => {
    const { code } = prepareSource(`import {
  Button,
  Card,
} from '@the_viveksingh/vivek-ui'
function App() { return null }`)
    expect(code).not.toContain('Button,')
    expect(code).toContain('function App()')
  })

  it('drops a side-effect import', () => {
    const { code } = prepareSource(`import './styles.css'
function App() { return null }`)
    expect(code.trim()).toBe('function App() { return null }')
  })

  it('unwraps named exports', () => {
    const { code, resolver } = prepareSource(`export function Dashboard() { return null }
export const Widget = () => null`)
    expect(code).not.toContain('export')
    expect(code).toContain('function Dashboard()')
    expect(code).toContain('const Widget =')
    expect(resolver).toContain('Dashboard')
  })

  it('drops an export list', () => {
    const { code } = prepareSource(`function App() { return null }
export { App }`)
    expect(code).not.toContain('export {')
    expect(code).toContain('function App()')
  })

  it('drops a multi-line export list', () => {
    const { code } = prepareSource(`function App() { return null }
export {
  App,
}`)
    expect(code).not.toContain('export')
    expect(code).not.toContain('App,')
  })

  it('aliases an anonymous default export', () => {
    const { code, resolver } = prepareSource(`export default function () { return null }`)
    expect(code).toContain('const __vkDefaultExport =')
    expect(resolver).toContain('__vkDefaultExport')
  })

  it('aliases an arrow default export', () => {
    const { code, resolver } = prepareSource(`export default () => null`)
    expect(code).toContain('const __vkDefaultExport = () => null')
    expect(resolver).toContain('__vkDefaultExport')
  })

  it('prefers App over other candidates', () => {
    const { resolver } = prepareSource(`export function Other() { return null }
function App() { return null }`)
    expect(resolver.indexOf('App')).toBeLessThan(resolver.indexOf('Other'))
  })

  it('finds an unexported capitalised component', () => {
    const { resolver } = prepareSource(`function Dashboard() { return null }`)
    expect(resolver).toContain('Dashboard')
  })

  it('guards every candidate with typeof so a miss cannot throw', () => {
    const { resolver } = prepareSource(`export default function Page() { return null }`)
    expect(resolver).toContain("typeof Page !== 'undefined'")
  })

  it('still looks for App when nothing is declared, so the error names it', () => {
    // `App` stays in the preference list unconditionally: the typeof guard makes it
    // harmless, and it is what lets the error message say what to define.
    const { resolver, candidates } = prepareSource(`const x = 1`)
    expect(candidates).toContain('App')
    expect(resolver).toContain("typeof App !== 'undefined'")
  })

  it('leaves ordinary code untouched', () => {
    const source = `function App() {
  const [n, setN] = React.useState(0)
  return <button onClick={() => setN(n + 1)}>{n}</button>
}`
    expect(prepareSource(source).code.trim()).toBe(source)
  })
})
