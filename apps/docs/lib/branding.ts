import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'

/**
 * Brand assets, detected at build time.
 *
 * Dropping a file into `public/branding/` is the whole setup — no metadata to edit.
 *
 * Each role accepts SEVERAL filenames, in preference order, because the first version of this
 * only accepted names I had invented and the icons that actually arrived came out of
 * realfavicongenerator.net with its own names. Asking someone to rename six files to match a
 * spec they cannot see is the wrong way round: the tool is the standard, so this reads its
 * output as-is.
 *
 * Reading the filesystem is safe because this only runs during the build, from the root
 * layout, which is a Server Component. It must never be imported by a client component —
 * `branding.test.ts` asserts that.
 */

const BRANDING_DIR = join(process.cwd(), 'public', 'branding')

/**
 * Icon roles, split by how often a browser fetches them — which is what makes the size
 * budget meaningful rather than arbitrary.
 *
 * `everyLoad` icons are requested on ordinary page views, so they are held to a tight
 * budget. `install` icons are only fetched when someone adds the site to a home screen, so a
 * larger file there costs almost nothing.
 */
export const ICON_ROLES = {
  ico: {
    /** realfavicongenerator's name first, since that is what people actually have. */
    names: ['favicon.ico'],
    type: 'image/x-icon',
    sizes: '32x32',
    frequency: 'everyLoad',
    maxBytes: 100 * 1024,
  },
  svg: {
    names: ['favicon.svg', 'icon.svg'],
    type: 'image/svg+xml',
    sizes: undefined,
    frequency: 'everyLoad',
    // A real vector icon is a few KB. Anything larger is a raster in an SVG wrapper, and
    // browsers PREFER the SVG when it is offered - so an oversized one is the file that gets
    // downloaded on every page load. That happened: a 4.8 MB PNG inside an <svg>.
    maxBytes: 100 * 1024,
  },
  png96: {
    names: ['favicon-96x96.png', 'icon-96.png'],
    type: 'image/png',
    sizes: '96x96',
    frequency: 'everyLoad',
    maxBytes: 100 * 1024,
  },
  png192: {
    names: ['web-app-manifest-192x192.png', 'icon-192.png'],
    type: 'image/png',
    sizes: '192x192',
    frequency: 'install',
    maxBytes: 600 * 1024,
  },
  png512: {
    names: ['web-app-manifest-512x512.png', 'icon-512.png'],
    type: 'image/png',
    sizes: '512x512',
    frequency: 'install',
    maxBytes: 600 * 1024,
  },
  apple: {
    names: ['apple-touch-icon.png', 'apple-icon.png'],
    type: 'image/png',
    sizes: '180x180',
    frequency: 'install',
    maxBytes: 600 * 1024,
  },
} as const

export type IconRole = keyof typeof ICON_ROLES

/** Every filename any role will accept. Used to spot a stray file in the folder. */
export const RECOGNISED_FILENAMES: string[] = Object.values(ICON_ROLES).flatMap(
  (role) => role.names as readonly string[],
)

/** The first accepted filename that exists for a role, or null. */
export function resolveRole(role: IconRole): { file: string; bytes: number } | null {
  for (const name of ICON_ROLES[role].names) {
    const path = join(BRANDING_DIR, name)
    if (existsSync(path)) return { file: name, bytes: statSync(path).size }
  }
  return null
}

/**
 * Icon metadata for whatever is present.
 *
 * `undefined` when the folder is empty, and `app/icon.tsx` then supplies a generated favicon
 * — so the site always has one, and no browser requests an icon that does not exist.
 *
 * Ordering matters: a browser uses the LAST usable `rel="icon"` it finds, so the SVG is
 * listed after the `.ico` because a vector is sharp at every size while the `.ico` is the
 * compatibility fallback.
 */
export function brandIcons(): Metadata['icons'] {
  const icon: Array<{ url: string; sizes?: string; type?: string }> = []

  for (const role of ['ico', 'png96', 'svg'] as const) {
    const found = resolveRole(role)
    if (!found) continue
    const { type, sizes } = ICON_ROLES[role]
    icon.push({ url: `/branding/${found.file}`, ...(sizes ? { sizes } : {}), type })
  }

  const appleFound = resolveRole('apple')
  const apple = appleFound
    ? [{ url: `/branding/${appleFound.file}`, sizes: '180x180', type: 'image/png' }]
    : undefined

  if (icon.length === 0 && !apple) return undefined
  return { ...(icon.length > 0 ? { icon } : {}), ...(apple ? { apple } : {}) }
}

/** Manifest icons, for the install prompt and the Android splash screen. */
export function manifestIcons(): Array<{ src: string; sizes: string; type: string }> {
  const icons: Array<{ src: string; sizes: string; type: string }> = []
  for (const role of ['png192', 'png512'] as const) {
    const found = resolveRole(role)
    if (found)
      icons.push({
        src: `/branding/${found.file}`,
        sizes: ICON_ROLES[role].sizes,
        type: 'image/png',
      })
  }
  // Falls back to the generated icon route, so the manifest is never iconless.
  if (icons.length === 0) icons.push({ src: '/icon', sizes: '32x32', type: 'image/png' })
  return icons
}
