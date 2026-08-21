/**
 * End-to-end test of the playground's compile path.
 *
 * The playground was broken for every input: the scope keys were passed to `new Function`
 * as parameter names, and the namespace objects include `default` and `module.exports`,
 * so it threw `SyntaxError: Unexpected token 'default'` before reaching user code. Nothing
 * caught it because the only tests covered `prepareSource` in isolation — the string
 * transform was fine, and the failure was one step later.
 *
 * So this drives the whole pipeline the editor drives: prepare, transpile, bind the scope,
 * evaluate, and server-render the result. If any link breaks, this fails.
 */
import * as ui from '@the_viveksingh/vivek-ui'
import * as charts from '@the_viveksingh/vivek-ui/charts'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transform } from 'sucrase'
import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '../app/playground/templates'
import { buildScope } from './playground-scope'
import { prepareSource } from './prepare-source'

const SCOPE = buildScope({ ...ui, ...charts, React, ...React })

/** Exactly what `PlaygroundEditor.compile` does, minus the React state plumbing. */
function run(source: string): { markup: string; js: string } {
  const prepared = prepareSource(source)
  const { code: js } = transform(prepared.code, {
    transforms: ['typescript', 'jsx'],
    production: true,
  })
  const factory = new Function(...SCOPE.names, `${js};\nreturn ${prepared.resolver};`)
  const Component = factory(...SCOPE.values)
  if (typeof Component !== 'function') {
    throw new Error(`no component resolved; candidates were ${prepared.candidates.join(', ')}`)
  }
  return { markup: renderToStaticMarkup(React.createElement(Component)), js }
}

describe('playground compile path', () => {
  it('has templates to test', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0)
  })

  it.each(TEMPLATES.map((t) => [t.label, t.code] as const))(
    'compiles and renders the %s template',
    (_label, code) => {
      const { markup } = run(code)
      expect(markup.length).toBeGreaterThan(0)
      // Every template is built from the library, so at least one `vk-` class must appear.
      // Asserting only "did not throw" would pass on a component that renders nothing.
      expect(markup).toMatch(/vk-[a-z]/)
    },
  )

  it('runs a docs example pasted verbatim, imports and export default included', () => {
    // The shape someone actually copies off a component page.
    const pasted = [
      "import { Button, Stack } from '@the_viveksingh/vivek-ui'",
      '',
      'export default function Example() {',
      '  return (',
      '    <Stack direction="horizontal" gap={3}>',
      '      <Button>Solid</Button>',
      '      <Button variant="outline">Outline</Button>',
      '    </Stack>',
      '  )',
      '}',
    ].join('\n')
    const { markup } = run(pasted)
    expect(markup).toContain('vk-button')
    expect(markup).toContain('Outline')
  })

  it('compiles TypeScript annotations away', () => {
    const typed = [
      'interface Props { tone: string }',
      'function App() {',
      '  const items: string[] = ["a", "b"]',
      '  const label: string = items.join("-")',
      '  return <Badge tone="primary">{label}</Badge>',
      '}',
    ].join('\n')
    const { markup, js } = run(typed)
    expect(js).not.toContain('interface')
    expect(markup).toContain('a-b')
  })

  it('renders a chart, so the charts entry point is really in scope', () => {
    const source = [
      'function App() {',
      '  return (',
      '    <LineChart',
      '      title="Revenue"',
      '      height={200}',
      '      series={[{ name: "Revenue", data: [{ x: "Jan", y: 10 }, { x: "Feb", y: 20 }] }]}',
      '    />',
      '  )',
      '}',
    ].join('\n')
    const { markup } = run(source)
    expect(markup).toContain('vk-chart')
    // The accessible table fallback should come along with it.
    expect(markup).toContain('<table')
  })

  it('reports a missing component instead of rendering nothing', () => {
    expect(() => run('const x = 1')).toThrow(/no component resolved/)
  })
})
