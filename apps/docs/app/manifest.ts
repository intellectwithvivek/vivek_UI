import type { MetadataRoute } from 'next'
import { manifestIcons } from '../lib/branding'
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/site'

/**
 * Web app manifest.
 *
 * Modest on purpose: this is a documentation site, not an app. It exists so an install
 * prompt, a pinned tab or an Android home-screen shortcut gets the right name, colour and
 * icon instead of a URL and a screenshot.
 *
 * `display: 'browser'` rather than `standalone` — a docs site stripped of the browser's
 * address bar and back button is worse, not better. Choosing `standalone` because it sounds
 * more app-like is the usual mistake here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — React component library`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'browser',
    // Matches --vk-color-bg and --vk-color-primary in the light theme. There is no way to
    // make this theme-aware: the manifest is static, and browsers read it once at install.
    background_color: '#ffffff',
    theme_color: '#0071e3',
    icons: manifestIcons(),
  }
}
