/**
 * The demo images served at `/demo/<name>.svg`.
 *
 * Blocks may import only from the published package, so they cannot call
 * `placeholderImage()` the way previews do. Instead they reference these URLs, and the
 * route handler in `app/demo/[image]/route.ts` renders each one at build time from the
 * same generator — deterministic, offline, ours. Adding a demo image means adding a row here;
 * the blocks test fails on a reference to a name that is not listed.
 */
import type { PlaceholderOptions } from './placeholder-image'

interface DemoImage extends Omit<PlaceholderOptions, 'seed'> {
  /** Serve as a PNG at `/demo/<name>.png` rather than an SVG. Video posters must be raster. */
  raster?: true
}

export const DEMO_IMAGES: Record<string, DemoImage> = {
  // Blocks
  'vk-app': { width: 900, height: 700, label: 'App' },
  'vk-dash': { width: 1200, height: 900, label: 'Dashboard' },
  'vk-editor': { width: 1600, height: 900, label: 'Editor' },
  'vk-inbox': { width: 1200, height: 900, label: 'Inbox' },
  'vk-keys': { width: 1200, height: 900, label: 'Keyboard' },
  'vk-phone': { width: 900, height: 1200, label: 'Phone' },
  'vk-ridge': { width: 1800, height: 1000 },
  'vk-summit': { width: 1800, height: 1000 },
  'vk-design': { width: 1200, height: 800, label: 'Design' },
  'vk-build': { width: 1200, height: 800, label: 'Build' },
  'vk-ship': { width: 1200, height: 800, label: 'Ship' },
  'video-poster': { width: 960, height: 540, raster: true },
  // Lightbox preview
  'lightbox-ridge': { width: 1600, height: 1000, label: 'Dawn on the ridge' },
  'lightbox-pines': { width: 1600, height: 1000, label: 'Fog in the pines' },
  'lightbox-lake': { width: 1600, height: 1000, label: 'Golden hour' },
}

export const demoImageUrl = (name: keyof typeof DEMO_IMAGES | string): string => `/demo/${name}.svg`
