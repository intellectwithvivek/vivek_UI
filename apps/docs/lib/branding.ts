import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'

/**
 * Brand assets, detected at build time.
 *
 * The point is that dropping a file into `public/branding/` is enough — no metadata to edit
 * afterwards. The alternative was to reference all five filenames unconditionally, which
 * means every browser requests five icons and 404s on the four that do not exist yet. A
 * `<link rel="icon">` pointing at nothing is worse than no link: the browser has to fetch,
 * fail, and then fall back.
 *
 * Reading the filesystem is safe here because this only runs during the build, from the root
 * layout, which is a Server Component. It must never be imported by a client component —
 * `branding.test.ts` asserts that.
 */

const BRANDING_DIR = join(process.cwd(), 'public', 'branding')

/** Filenames the site looks for. Documented in `public/branding/README.md`. */
export const BRAND_FILES = {
  favicon: 'favicon.ico',
  svg: 'icon.svg',
  png192: 'icon-192.png',
  png512: 'icon-512.png',
  apple: 'apple-icon.png',
} as const

export function hasBrandFile(name: string): boolean {
  return existsSync(join(BRANDING_DIR, name))
}

/**
 * Icon metadata for whatever is actually present.
 *
 * When nothing is present this returns `undefined`, and `app/icon.tsx` supplies a generated
 * favicon instead — so the site always has one. Note the ordering when both exist: a browser
 * picks the LAST usable `<link rel="icon">`, so `icon.svg` is listed after `favicon.ico`
 * because a vector icon is sharp at every size and the `.ico` is the compatibility fallback.
 */
export function brandIcons(): Metadata['icons'] {
  const icon: Array<{ url: string; sizes?: string; type?: string }> = []

  if (hasBrandFile(BRAND_FILES.favicon)) {
    icon.push({ url: `/branding/${BRAND_FILES.favicon}`, sizes: '32x32', type: 'image/x-icon' })
  }
  if (hasBrandFile(BRAND_FILES.svg)) {
    icon.push({ url: `/branding/${BRAND_FILES.svg}`, type: 'image/svg+xml' })
  }
  if (hasBrandFile(BRAND_FILES.png192)) {
    icon.push({ url: `/branding/${BRAND_FILES.png192}`, sizes: '192x192', type: 'image/png' })
  }

  const apple = hasBrandFile(BRAND_FILES.apple)
    ? [{ url: `/branding/${BRAND_FILES.apple}`, sizes: '180x180', type: 'image/png' }]
    : undefined

  if (icon.length === 0 && !apple) return undefined
  return { ...(icon.length > 0 ? { icon } : {}), ...(apple ? { apple } : {}) }
}

/** Manifest icons, for the PWA install prompt and the Android splash screen. */
export function manifestIcons(): Array<{ src: string; sizes: string; type: string }> {
  const icons: Array<{ src: string; sizes: string; type: string }> = []
  if (hasBrandFile(BRAND_FILES.png192)) {
    icons.push({ src: `/branding/${BRAND_FILES.png192}`, sizes: '192x192', type: 'image/png' })
  }
  if (hasBrandFile(BRAND_FILES.png512)) {
    icons.push({ src: `/branding/${BRAND_FILES.png512}`, sizes: '512x512', type: 'image/png' })
  }
  // Falls back to the generated icon, so the manifest is never iconless.
  if (icons.length === 0) {
    icons.push({ src: '/icon', sizes: '32x32', type: 'image/png' })
  }
  return icons
}
