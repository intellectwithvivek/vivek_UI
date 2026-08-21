/**
 * The accent presets offered by the docs site.
 *
 * The values live in `app/accent.css` as `[data-accent="…"]` blocks. This module only names
 * them and supplies a swatch colour for the picker, so there is exactly one place that
 * decides what an accent *is*.
 */
export interface Accent {
  id: string
  label: string
  /** Swatch colour: the light-theme accent, matching `app/accent.css`. */
  swatch: string
}

export const ACCENTS: Accent[] = [
  { id: 'blue', label: 'Blue', swatch: '#0071e3' },
  { id: 'violet', label: 'Violet', swatch: '#6d28d9' },
  { id: 'emerald', label: 'Emerald', swatch: '#0f7a3d' },
  { id: 'rose', label: 'Rose', swatch: '#c8215d' },
  { id: 'amber', label: 'Amber', swatch: '#9a6700' },
]

export const DEFAULT_ACCENT = 'blue'
export const ACCENT_STORAGE_KEY = 'vk-docs-accent'
export const ACCENT_ATTRIBUTE = 'data-accent'

/**
 * Applies the stored accent before first paint.
 *
 * Same problem the theme script solves, and the same reason it cannot be done in React: the
 * server has no idea what the visitor picked last time, so a component would only apply it
 * after hydration and every reload would flash the default accent first.
 *
 * Inlined into `<head>` as a build-time constant, never from user input. The allow-list
 * matters: `localStorage` is writable by anything running on the origin, and this value goes
 * straight into a DOM attribute.
 */
export const accentScript = `(function(){try{var a=localStorage.getItem('${ACCENT_STORAGE_KEY}');var ok=${JSON.stringify(
  ACCENTS.map((accent) => accent.id),
)};if(a&&ok.indexOf(a)>-1){document.documentElement.setAttribute('${ACCENT_ATTRIBUTE}',a)}else{document.documentElement.setAttribute('${ACCENT_ATTRIBUTE}','${DEFAULT_ACCENT}')}}catch(e){document.documentElement.setAttribute('${ACCENT_ATTRIBUTE}','${DEFAULT_ACCENT}')}})()`
