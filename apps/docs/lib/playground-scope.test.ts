import * as ui from '@the_viveksingh/vivek-ui'
import * as charts from '@the_viveksingh/vivek-ui/charts'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { assertBindable, buildScope } from './playground-scope'

describe('buildScope', () => {
  it('drops the reserved and non-identifier keys namespaces carry', () => {
    const { names, dropped } = buildScope({
      Button: () => null,
      default: 'the namespace default export',
      'module.exports': {},
      __esModule: true,
      Card: () => null,
    })
    expect(names).toEqual(['Button', 'Card'])
    expect(dropped.sort()).toEqual(['__esModule', 'default', 'module.exports'])
  })

  it('keeps names and values positionally aligned', () => {
    const { names, values } = buildScope({ a: 1, default: 2, b: 3 })
    expect(names).toEqual(['a', 'b'])
    expect(values).toEqual([1, 3])
  })

  it('rejects every reserved word, not just default', () => {
    const { names } = buildScope({ Ok: 1, class: 1, function: 1, return: 1, typeof: 1, yield: 1 })
    expect(names).toEqual(['Ok'])
  })

  it('allows $ and _ prefixed names, which are valid bindings', () => {
    const { names } = buildScope({ $: 1, _private: 1, $$x: 1 })
    expect(names.sort()).toEqual(['$', '$$x', '_private'])
  })
})

describe('the real playground scope', () => {
  /*
   * The regression test for the actual bug. Before the filter, this exact expression threw
   * `SyntaxError: Unexpected token 'default'` — so the playground could not compile
   * anything at all, and the error looked like it came from the user's source.
   */
  const scope = buildScope({ ...ui, ...charts, React, ...React })

  it('is bindable by new Function', () => {
    expect(() => assertBindable(scope.names)).not.toThrow()
  })

  it('actually excluded something, so the filter is not a no-op here', () => {
    // If the bundler ever stops emitting these keys this test still passes for the right
    // reason, but the assertion documents what was really in there.
    expect(scope.dropped).toContain('default')
  })

  it('still exposes the library, the charts and React hooks', () => {
    for (const name of ['Button', 'Card', 'DataTable', 'LineChart', 'PieChart', 'useState']) {
      expect(scope.names, name).toContain(name)
    }
  })

  it('can compile and run a component through the same path the editor uses', () => {
    const factory = new Function(...scope.names, 'return function App() { return null }')
    const Component = factory(...scope.values)
    expect(typeof Component).toBe('function')
  })
})
