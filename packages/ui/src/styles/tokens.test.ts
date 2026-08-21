/**
 * Contrast gate for the token palette.
 *
 * Three real failures shipped before this test existed: `--vk-color-warning` measured
 * 2.94:1 on white, `--vk-color-success` 3.30:1, and the solid Alert/Badge/Toast variants
 * hardcoded `color: #fff`, which lands at 1.7:1 on the bright dark-theme accents. None of
 * those are visible by eye — a warning tone looks *fine* until you measure it — so they
 * can only be caught arithmetically.
 *
 * The palette is read out of `tokens.css` rather than duplicated here. A test that
 * restates the values it is checking passes even after the stylesheet has drifted away
 * from it, which is worse than no test.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Comments are stripped first. `tokens.css` documents rebranding with an example
 * `:root { --vk-color-primary: #0ea5e9 }` in its header comment, and a parser that keeps
 * comments finds that `:root` before the real one. This test only ever passed because the
 * genuine declarations came later in the same slice and overwrote the example - luck, not
 * correctness.
 */
const CSS = readFileSync(join(__dirname, 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** Every `--vk-*: value` pair inside the given selector block. */
function block(selector: string): Map<string, string> {
  const start = CSS.indexOf(selector)
  if (start === -1) throw new Error(`tokens.css has no ${selector} block`)
  const open = CSS.indexOf('{', start)
  const close = CSS.indexOf('\n}', open)
  const body = CSS.slice(open, close)
  const out = new Map<string, string>()
  for (const [, name, value] of body.matchAll(/(--vk-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    // Both groups are non-optional in the pattern, so this only satisfies the compiler.
    if (name === undefined || value === undefined) continue
    out.set(name, value.trim())
  }
  return out
}

const LIGHT = block(':root')
const DARK = block('[data-theme="dark"]')

/** Dark overrides only what it changes, so an absent name falls through to `:root`. */
function resolve(theme: Map<string, string>, name: string): string {
  const value = theme.get(name) ?? LIGHT.get(name)
  if (value === undefined) throw new Error(`no token ${name}`)
  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`${name} is "${value}" — this gate only measures plain 6-digit hex`)
  }
  return value
}

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

function luminance(hex: string): number {
  const at = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16) / 255
  return 0.2126 * channel(at(1)) + 0.7152 * channel(at(3)) + 0.0722 * channel(at(5))
}

function contrast(a: string, b: string): number {
  const x = luminance(a)
  const y = luminance(b)
  const hi = Math.max(x, y)
  const lo = Math.min(x, y)
  return (hi + 0.05) / (lo + 0.05)
}

/** WCAG 2.1 AA for body text. */
const AA = 4.5
/** AA for text at 24px, or 19px bold. Used only where a token is large-type-only. */
const AA_LARGE = 3

const THEMES: Array<[string, Map<string, string>]> = [
  ['light', LIGHT],
  ['dark', DARK],
]

describe.each(THEMES)('%s theme', (themeName, theme) => {
  const on = (name: string) => resolve(theme, name)

  it('reads text tokens against the page background', () => {
    const bg = on('--vk-color-bg')
    for (const name of ['--vk-color-fg', '--vk-color-fg-subtle', '--vk-color-muted']) {
      expect(
        contrast(on(name), bg),
        `${name} on --vk-color-bg in ${themeName}`,
      ).toBeGreaterThanOrEqual(AA)
    }
  })

  it('reads text tokens against every raised and recessed surface', () => {
    for (const surface of [
      '--vk-color-surface',
      '--vk-color-surface-subtle',
      '--vk-color-surface-sunken',
    ]) {
      for (const name of ['--vk-color-fg', '--vk-color-fg-subtle', '--vk-color-muted']) {
        expect(
          contrast(on(name), on(surface)),
          `${name} on ${surface} in ${themeName}`,
        ).toBeGreaterThanOrEqual(AA)
      }
    }
  })

  /*
   * The load-bearing one. Every accent is used BOTH as a text colour on the page and as a
   * solid background with `-fg` on top. Contrast is symmetric, so an accent that clears
   * 4.5:1 against the page also clears it under its own inverted text — but only if `-fg`
   * really is the opposite end, which is what the second assertion pins down.
   */
  it.each(['primary', 'danger', 'success', 'warning'])(
    'accent %s works as text and as a solid fill',
    (accent) => {
      const colour = on(`--vk-color-${accent}`)
      const onColour = on(`--vk-color-${accent}-fg`)
      expect(
        contrast(colour, on('--vk-color-bg')),
        `--vk-color-${accent} as text in ${themeName}`,
      ).toBeGreaterThanOrEqual(AA)
      expect(
        contrast(onColour, colour),
        `--vk-color-${accent}-fg on --vk-color-${accent} in ${themeName}`,
      ).toBeGreaterThanOrEqual(AA)
    },
  )

  /*
   * Interaction states, which the first version of this gate did not cover - and that gap
   * shipped a bug. `--vk-color-primary-hover` was set LIGHTER than the base on the
   * reasoning that platforms lighten on hover, which put white text at 4.32:1: a hovered
   * primary button below AA. An accent sitting 0.2 above the threshold has no room to be
   * lightened.
   *
   * The rule these assertions encode: hover and active must move AWAY from the foreground
   * that sits on them, so contrast can only improve when the user interacts.
   */
  it.each([
    ['primary', 'hover'],
    ['primary', 'active'],
    ['danger', 'hover'],
  ] as const)('accent %s keeps its %s state readable', (accent, state) => {
    const base = on(`--vk-color-${accent}`)
    const stateColour = on(`--vk-color-${accent}-${state}`)
    const foreground = on(`--vk-color-${accent}-fg`)

    expect(
      contrast(foreground, stateColour),
      `--vk-color-${accent}-fg on --vk-color-${accent}-${state} in ${themeName}`,
    ).toBeGreaterThanOrEqual(AA)

    /*
     * Hover additionally must not be worse than resting: it is a sustained state, and the
     * label gets read while the pointer is on it. `active` is exempt - it lasts as long as
     * a mouse-down, and a press that dims slightly is the conventional cue in a dark theme
     * where the accent is already bright. It still has to clear AA above.
     */
    if (state === 'hover') {
      expect(
        contrast(foreground, stateColour),
        `--vk-color-${accent}-hover in ${themeName} is harder to read than its resting state`,
      ).toBeGreaterThanOrEqual(contrast(foreground, base) - 0.01)
    }
  })

  it.each(['primary', 'danger', 'success', 'warning'])(
    'soft variant %s pairs a tint with a readable foreground',
    (accent) => {
      expect(
        contrast(on(`--vk-color-${accent}-subtle-fg`), on(`--vk-color-${accent}-subtle`)),
        `--vk-color-${accent}-subtle-fg on --vk-color-${accent}-subtle in ${themeName}`,
      ).toBeGreaterThanOrEqual(AA)
    },
  )

  it('keeps the focus ring visible against the page and every surface', () => {
    // A ring is a graphical object, so AA_LARGE (3:1) is the applicable threshold —
    // WCAG 2.1 SC 1.4.11 Non-text Contrast, not the body-text rule.
    for (const surface of ['--vk-color-bg', '--vk-color-surface', '--vk-color-surface-subtle']) {
      expect(
        contrast(on('--vk-color-ring'), on(surface)),
        `--vk-color-ring on ${surface} in ${themeName}`,
      ).toBeGreaterThanOrEqual(AA_LARGE)
    }
  })

  it('keeps the strong border at the non-text contrast threshold', () => {
    // WCAG 2.1 SC 1.4.11 asks 3:1 of any boundary that conveys meaning. `border` and
    // `border-subtle` are exempt as decoration - holding all three to 3:1 would collapse
    // them into one weight and defeat the point of having a ramp.
    expect(
      contrast(on('--vk-color-border-strong'), on('--vk-color-bg')),
      `--vk-color-border-strong on --vk-color-bg in ${themeName}`,
    ).toBeGreaterThanOrEqual(AA_LARGE)
  })
})

describe('palette hygiene', () => {
  it('defines a -fg, -subtle and -subtle-fg for every accent', () => {
    for (const accent of ['primary', 'danger', 'success', 'warning']) {
      for (const suffix of ['fg', 'subtle', 'subtle-fg']) {
        expect(LIGHT.has(`--vk-color-${accent}-${suffix}`), `--vk-color-${accent}-${suffix}`).toBe(
          true,
        )
      }
    }
  })

  it('re-tunes the shadow ramp for dark rather than inheriting it', () => {
    // A black shadow on a dark page is invisible, so inheriting the light ramp leaves
    // every card flat. This asserts the dark block actually overrides each step.
    for (const step of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(DARK.has(`--vk-shadow-${step}`), `dark --vk-shadow-${step}`).toBe(true)
    }
  })

  it('inverts the surface ramp in dark mode', () => {
    // Light: raised surfaces are at or above the page. Dark: they must be LIGHTER than
    // the page, because that is the only depth cue left once shadows stop reading.
    expect(luminance(resolve(DARK, '--vk-color-surface'))).toBeGreaterThan(
      luminance(resolve(DARK, '--vk-color-bg')),
    )
    expect(luminance(resolve(DARK, '--vk-color-surface-subtle'))).toBeGreaterThan(
      luminance(resolve(DARK, '--vk-color-surface')),
    )
  })
})
