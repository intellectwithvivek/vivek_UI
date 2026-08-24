/**
 * A deterministic gradient per showcase site.
 *
 * These are posters, not screenshots. A screenshot would be better, and a *stale* screenshot
 * would be worse than either — sites get redesigned and nobody re-captures twelve of them, so
 * the gallery would slowly fill with pictures of what the sites used to look like. A poster
 * is honestly a placeholder and stays true forever; the live frame one click away is the
 * real thing.
 *
 * Derived from the slug, so a site keeps its colour across builds and deploys.
 */

/** FNV-1a. Stable across Node versions, unlike anything built on hashing objects. */
function hash(seed: string): number {
  let h = 2166136261
  for (let index = 0; index < seed.length; index++) {
    h ^= seed.charCodeAt(index)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Hue pairs that sit near the brand's own violet-to-blue without repeating it exactly.
 * All are dark enough for white text to clear 4.5:1 at the lightness used below.
 */
const HUES: Array<[number, number]> = [
  [258, 214], // the brand pair
  [200, 172],
  [280, 320],
  [150, 190],
  [18, 348],
  [220, 258],
]

export function posterFor(slug: string): string {
  const seed = hash(slug)
  const [from, to] = HUES[seed % HUES.length] ?? HUES[0]
  const angle = 120 + (seed % 5) * 15
  // Lightness capped at 46% so white text stays above 4.5:1 against the lighter stop.
  return `linear-gradient(${angle}deg, oklch(46% 0.17 ${from}), oklch(38% 0.15 ${to}))`
}
