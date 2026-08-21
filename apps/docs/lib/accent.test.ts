/**
 * Contrast gate for the accent presets.
 *
 * A theme picker is exactly the kind of feature that ships four accessible options and one
 * that fails, because the failure is only visible in one state of one theme. So every
 * preset is measured here against the same rules the library's own token gate enforces.
 *
 * This test was written after a real failure: the presets were first derived by lightening
 * on hover, which is the platform convention, and it put white text at 4.32:1 on the
 * default blue. The rule below — hover moves AWAY from the foreground on it — is the fix.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ACCENTS, DEFAULT_ACCENT } from './accents'

const CSS = readFileSync(join(__dirname, '..', 'app', 'accent.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/** The tokens declared for one preset, in one theme. */
function tokens(accent: string, theme: 'light' | 'dark'): Map<string, string> {
  const selector =
    theme === 'light' ? `[data-accent="${accent}"]` : `[data-theme="dark"][data-accent="${accent}"]`
  const start = CSS.indexOf(selector)
  if (start === -1) throw new Error(`accent.css has no ${selector} block`)
  const open = CSS.indexOf('{', start)
  const body = CSS.slice(open, CSS.indexOf('}', open))
  const out = new Map<string, string>()
  for (const match of body.matchAll(/(--vk-[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})/gi)) {
    if (match[1] && match[2]) out.set(match[1], match[2].toLowerCase())
  }
  return out
}

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const luminance = (hex: string) => {
  const at = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16) / 255
  return 0.2126 * channel(at(1)) + 0.7152 * channel(at(3)) + 0.0722 * channel(at(5))
}
const contrast = (a: string, b: string) => {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const AA = 4.5
const NON_TEXT = 3
/** Page background per theme, matching the library's tokens. */
const PAGE = { light: '#ffffff', dark: '#0a0a0b' } as const
const SURFACE = { light: '#ffffff', dark: '#17171a' } as const

const CASES = ACCENTS.flatMap((accent) =>
  (['light', 'dark'] as const).map((theme) => [accent.id, theme] as const),
)

describe.each(CASES)('accent %s in %s', (accentId, theme) => {
  const t = tokens(accentId, theme)
  const get = (name: string) => {
    const value = t.get(name)
    if (!value) throw new Error(`${accentId}/${theme} is missing ${name}`)
    return value
  }

  it('declares the full set of tokens the components use', () => {
    for (const name of [
      '--vk-color-primary',
      '--vk-color-primary-fg',
      '--vk-color-primary-hover',
      '--vk-color-primary-active',
      '--vk-color-primary-subtle',
      '--vk-color-primary-subtle-fg',
      '--vk-color-ring',
    ]) {
      expect(t.has(name), name).toBe(true)
    }
  })

  it('reads as text on the page', () => {
    expect(contrast(get('--vk-color-primary'), PAGE[theme])).toBeGreaterThanOrEqual(AA)
  })

  it.each(['--vk-color-primary', '--vk-color-primary-hover', '--vk-color-primary-active'])(
    'keeps its foreground readable on %s',
    (name) => {
      expect(
        contrast(get('--vk-color-primary-fg'), get(name)),
        `${accentId}/${theme}: fg on ${name}`,
      ).toBeGreaterThanOrEqual(AA)
    },
  )

  it('does not make hover harder to read than resting', () => {
    // Hover is sustained — the label is read while the pointer is on it. `active` lasts as
    // long as a mouse-down and is allowed to dip, provided it still clears AA above.
    const fg = get('--vk-color-primary-fg')
    expect(contrast(fg, get('--vk-color-primary-hover'))).toBeGreaterThanOrEqual(
      contrast(fg, get('--vk-color-primary')) - 0.01,
    )
  })

  it('pairs the subtle tint with a readable foreground', () => {
    expect(
      contrast(get('--vk-color-primary-subtle-fg'), get('--vk-color-primary-subtle')),
    ).toBeGreaterThanOrEqual(AA)
  })

  it('keeps the focus ring visible on the page and on a raised surface', () => {
    const ring = get('--vk-color-ring')
    expect(contrast(ring, PAGE[theme])).toBeGreaterThanOrEqual(NON_TEXT)
    expect(contrast(ring, SURFACE[theme])).toBeGreaterThanOrEqual(NON_TEXT)
  })

  it('keeps the subtle tint distinct from the page, so a tinted row is visible', () => {
    // A tint that matches the background makes selected rows and soft badges invisible.
    expect(contrast(get('--vk-color-primary-subtle'), PAGE[theme])).toBeGreaterThan(1.03)
  })
})

describe('accent registry', () => {
  it('has a block in accent.css for every listed accent', () => {
    for (const accent of ACCENTS) {
      expect(CSS).toContain(`[data-accent="${accent.id}"]`)
      expect(CSS).toContain(`[data-theme="dark"][data-accent="${accent.id}"]`)
    }
  })

  it('has no orphan blocks in accent.css that the picker cannot reach', () => {
    const declared = [...CSS.matchAll(/\[data-accent="([a-z]+)"\]/g)].map((m) => m[1])
    const known = new Set(ACCENTS.map((accent) => accent.id))
    for (const id of declared) {
      expect(known.has(id ?? ''), `accent.css declares "${id}" but ACCENTS does not list it`).toBe(
        true,
      )
    }
  })

  it('uses the light-theme accent as the picker swatch, so the dot matches the result', () => {
    for (const accent of ACCENTS) {
      expect(accent.swatch.toLowerCase(), accent.id).toBe(
        tokens(accent.id, 'light').get('--vk-color-primary'),
      )
    }
  })

  it('defaults to an accent that exists', () => {
    expect(ACCENTS.some((accent) => accent.id === DEFAULT_ACCENT)).toBe(true)
  })

  it('matches the library default, so the site opens on the shipped palette', () => {
    // If these diverge the docs advertise one brand colour and the package ships another.
    const libraryTokens = readFileSync(
      join(
        __dirname,
        '..',
        'node_modules',
        '@the_viveksingh',
        'vivek-ui',
        'src',
        'styles',
        'tokens.css',
      ),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '')
    const root = libraryTokens.slice(
      libraryTokens.indexOf(':root'),
      libraryTokens.indexOf('[data-theme="dark"]'),
    )
    const libraryPrimary = root.match(/--vk-color-primary:\s*(#[0-9a-f]{6})/i)?.[1]?.toLowerCase()
    expect(tokens(DEFAULT_ACCENT, 'light').get('--vk-color-primary')).toBe(libraryPrimary)
  })
})
