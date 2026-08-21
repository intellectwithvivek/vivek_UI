/**
 * Keeps the social-card palette in step with the real tokens.
 *
 * `next/og` renders through Satori, which cannot resolve CSS custom properties — so the
 * card has to hardcode its colours. That makes it the one place in the project where the
 * palette is duplicated, and a drift there is close to invisible: nobody looks at their own
 * Open Graph image after the first time, so a card would keep shipping the old brand colour
 * indefinitely.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { OG_COLOURS, plainText } from '../components/og-card'

const require_ = createRequire(import.meta.url)
const TOKENS = readFileSync(
  join(dirname(require_.resolve('@the_viveksingh/vivek-ui/package.json')), 'src/styles/tokens.css'),
  'utf8',
)

/**
 * Strip CSS comments before parsing.
 *
 * `tokens.css` documents rebranding with `:root { --vk-color-primary: #0ea5e9 }` inside a
 * comment. A parser that does not remove comments finds that first and reports the example
 * value as the real one - which is exactly what happened here, and what made the OG card
 * test claim the brand colour was #0ea5e9.
 */
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** The value of a token in the `:root` block. */
function token(name: string): string {
  const css = withoutComments(TOKENS)
  const root = css.slice(css.indexOf(':root'), css.indexOf('[data-theme="dark"]'))
  const match = root.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))
  if (!match?.[1]) throw new Error(`tokens.css has no plain-hex ${name} in :root`)
  return match[1].toLowerCase()
}

describe('OG card palette', () => {
  it.each([
    ['bg', '--vk-color-bg'],
    ['fg', '--vk-color-fg'],
    ['muted', '--vk-color-muted'],
    ['primary', '--vk-color-primary'],
    ['surfaceSubtle', '--vk-color-surface-subtle'],
    ['border', '--vk-color-border'],
  ] as const)('%s matches %s', (key, tokenName) => {
    expect(OG_COLOURS[key].toLowerCase()).toBe(token(tokenName))
  })
})

describe('plainText', () => {
  it('drops glyphs Satori has no font for', () => {
    // The real case: the CommandPalette description contains U+2318, and Satori's font
    // fetch returns 400 for it, failing the build step and leaving a blank on the card.
    expect(plainText('The ⌘K palette: a search box.')).toBe('The K palette: a search box.')
  })

  it('keeps dashes and smart quotes, which the default face does have', () => {
    expect(plainText('A heading — with “quotes” and an ellipsis…')).toBe(
      'A heading — with “quotes” and an ellipsis…',
    )
  })

  it('strips markdown backticks, since nothing renders them here', () => {
    expect(plainText('Use `Accordion.Item` inside `Accordion`.')).toBe(
      'Use Accordion.Item inside Accordion.',
    )
  })

  it('collapses the newlines a JSDoc block leaves behind', () => {
    expect(plainText('One line\n *  and another')).toBe('One line * and another')
  })
})
