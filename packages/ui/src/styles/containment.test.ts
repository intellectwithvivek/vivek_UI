/**
 * Guards a CSS mistake that is invisible to every other kind of test.
 *
 * `container-type: inline-size` makes an element's inline size independent of its contents.
 * On a block-level box that is exactly what you want — the width comes from the parent. On
 * an INLINE-level box (`inline-flex`, `inline-block`, `inline-grid`) there is no parent
 * width to inherit, so the box collapses to its padding and its contents spill out of it.
 *
 * `.vk-calendar` shipped this way. It rendered as a narrow vertical capsule with the month
 * grid overflowing to the right of it, and the DatePicker inherited the same collapse
 * because it embeds a Calendar. Nothing caught it: the DOM is correct, every axe assertion
 * passes, and jsdom does not do layout — the component is only broken once a real engine
 * computes a size for it.
 *
 * So this reads the stylesheets as text. It cannot verify layout, but it can verify the one
 * property combination that guarantees a broken layout.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return cssFiles(path)
    return name.endsWith('.css') ? [path] : []
  })
}

/** Rule bodies, with comments removed so a documented counter-example is not flagged. */
function rules(css: string): Array<{ selector: string; body: string }> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const out: Array<{ selector: string; body: string }> = []
  // Deliberately simple: these stylesheets are flat, hand-written and use no nesting.
  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push({ selector: (match[1] ?? '').trim(), body: match[2] ?? '' })
  }
  return out
}

const INLINE_DISPLAY = /display:\s*inline(-flex|-grid|-block)?\s*;/

/**
 * Both spellings establish a containment context, and both were used in this codebase:
 * the `container-type` longhand, and the `container: <name> / <type>` shorthand. Checking
 * only the longhand is how the first version of this test missed most of the stylesheets.
 */
const ESTABLISHES_CONTAINMENT =
  /container-type:\s*(inline-size|size)|container:\s*[^;]*\/\s*(inline-size|size)/

describe('container queries', () => {
  const files = cssFiles(SRC)

  it('finds stylesheets to check', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it.each(files.map((file) => [file.slice(SRC.length + 1), file] as const))(
    '%s never combines container-type with an inline display',
    (_name, file) => {
      const offenders = rules(readFileSync(file, 'utf8'))
        .filter((rule) => ESTABLISHES_CONTAINMENT.test(rule.body))
        .filter((rule) => INLINE_DISPLAY.test(rule.body))
        .map((rule) => rule.selector)

      expect(
        offenders,
        `${offenders.join(', ')} sets container-type on an inline-level box, which collapses its inline size to zero`,
      ).toEqual([])
    },
  )

  it('keeps every @container rule pointed at a name that is actually declared', () => {
    // A query naming a container that no longer exists silently never matches, so the
    // responsive behaviour it was written for just stops happening.
    const declared = new Set<string>()
    const queried: Array<{ file: string; name: string }> = []

    for (const file of files) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const match of css.matchAll(/container-name:\s*([a-zA-Z0-9_-]+)/g)) {
        if (match[1]) declared.add(match[1])
      }
      // The shorthand: `container: vk-navbar / inline-size`.
      for (const match of css.matchAll(/container:\s*([a-zA-Z0-9_-]+)\s*\//g)) {
        if (match[1]) declared.add(match[1])
      }
      for (const match of css.matchAll(/@container\s+([a-zA-Z0-9_-]+)\s*\(/g)) {
        if (match[1]) queried.push({ file: file.slice(SRC.length + 1), name: match[1] })
      }
    }

    const dangling = queried.filter((query) => !declared.has(query.name))
    expect(
      dangling.map((query) => `${query.file}: @container ${query.name}`),
      'these queries name a container that is never declared',
    ).toEqual([])
  })
})
