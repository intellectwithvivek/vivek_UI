import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

/**
 * The live preview slot on a component page.
 *
 * Each slug's previews live in their own module and are loaded through `next/dynamic`, so
 * a route only ever ships the previews it actually renders. Importing them from one
 * barrel would make every component page pay for all 83 — the classic way a docs site
 * becomes slow, and the specific thing `optimizePackageImports` cannot fix because the
 * previews are local files.
 *
 * The map is explicit rather than a template-literal import because a variable path
 * cannot be statically analysed, and an unanalysable dynamic import defeats the splitting
 * this exists to achieve.
 */
const PREVIEWS: Record<string, ComponentType<{ name: string }>> = {
  accordion: dynamic(() => import('../previews/accordion')),
  alert: dynamic(() => import('../previews/alert')),
  'animated-counter': dynamic(() => import('../previews/animated-counter')),
  'aspect-ratio': dynamic(() => import('../previews/aspect-ratio')),
  avatar: dynamic(() => import('../previews/avatar')),
  badge: dynamic(() => import('../previews/badge')),
  'bento-grid': dynamic(() => import('../previews/bento-grid')),
  box: dynamic(() => import('../previews/box')),
  breadcrumb: dynamic(() => import('../previews/breadcrumb')),
  button: dynamic(() => import('../previews/button')),
  'button-group': dynamic(() => import('../previews/button-group')),
  calendar: dynamic(() => import('../previews/calendar')),
  card: dynamic(() => import('../previews/card')),
  carousel: dynamic(() => import('../previews/carousel')),
  'chat-code-block': dynamic(() => import('../previews/chat-code-block')),
  'chat-input': dynamic(() => import('../previews/chat-input')),
  'chat-message': dynamic(() => import('../previews/chat-message')),
  'chat-thread': dynamic(() => import('../previews/chat-thread')),
  checkbox: dynamic(() => import('../previews/checkbox')),
  clock: dynamic(() => import('../previews/clock')),
  code: dynamic(() => import('../previews/code')),
  combobox: dynamic(() => import('../previews/combobox')),
  'command-palette': dynamic(() => import('../previews/command-palette')),
  container: dynamic(() => import('../previews/container')),
  'copy-button': dynamic(() => import('../previews/copy-button')),
  countdown: dynamic(() => import('../previews/countdown')),
  cta: dynamic(() => import('../previews/cta')),
  'data-table': dynamic(() => import('../previews/data-table')),
  'date-picker': dynamic(() => import('../previews/date-picker')),
  divider: dynamic(() => import('../previews/divider')),
  drawer: dynamic(() => import('../previews/drawer')),
  'dropdown-menu': dynamic(() => import('../previews/dropdown-menu')),
  'empty-state': dynamic(() => import('../previews/empty-state')),
  faq: dynamic(() => import('../previews/faq')),
  'feature-grid': dynamic(() => import('../previews/feature-grid')),
  field: dynamic(() => import('../previews/field')),
  'file-upload': dynamic(() => import('../previews/file-upload')),
  footer: dynamic(() => import('../previews/footer')),
  grid: dynamic(() => import('../previews/grid')),
  heading: dynamic(() => import('../previews/heading')),
  hero: dynamic(() => import('../previews/hero')),
  'icon-button': dynamic(() => import('../previews/icon-button')),
  input: dynamic(() => import('../previews/input')),
  kbd: dynamic(() => import('../previews/kbd')),
  label: dynamic(() => import('../previews/label')),
  'line-chart': dynamic(() => import('../previews/line-chart')),
  'logo-cloud': dynamic(() => import('../previews/logo-cloud')),
  marquee: dynamic(() => import('../previews/marquee')),
  modal: dynamic(() => import('../previews/modal')),
  navbar: dynamic(() => import('../previews/navbar')),
  'otp-input': dynamic(() => import('../previews/otp-input')),
  pagination: dynamic(() => import('../previews/pagination')),
  'password-input': dynamic(() => import('../previews/password-input')),
  popover: dynamic(() => import('../previews/popover')),
  portal: dynamic(() => import('../previews/portal')),
  pricing: dynamic(() => import('../previews/pricing')),
  progress: dynamic(() => import('../previews/progress')),
  prose: dynamic(() => import('../previews/prose')),
  'radio-group': dynamic(() => import('../previews/radio-group')),
  rating: dynamic(() => import('../previews/rating')),
  'relative-time': dynamic(() => import('../previews/relative-time')),
  'scroll-area': dynamic(() => import('../previews/scroll-area')),
  section: dynamic(() => import('../previews/section')),
  select: dynamic(() => import('../previews/select')),
  sidebar: dynamic(() => import('../previews/sidebar')),
  skeleton: dynamic(() => import('../previews/skeleton')),
  slider: dynamic(() => import('../previews/slider')),
  spinner: dynamic(() => import('../previews/spinner')),
  stack: dynamic(() => import('../previews/stack')),
  stats: dynamic(() => import('../previews/stats')),
  stepper: dynamic(() => import('../previews/stepper')),
  switch: dynamic(() => import('../previews/switch')),
  table: dynamic(() => import('../previews/table')),
  tabs: dynamic(() => import('../previews/tabs')),
  'virtual-list': dynamic(() => import('../previews/virtual-list')),
  'tag-input': dynamic(() => import('../previews/tag-input')),
  testimonials: dynamic(() => import('../previews/testimonials')),
  text: dynamic(() => import('../previews/text')),
  textarea: dynamic(() => import('../previews/textarea')),
  'theme-provider': dynamic(() => import('../previews/theme-provider')),
  'theme-toggle': dynamic(() => import('../previews/theme-toggle')),
  timeline: dynamic(() => import('../previews/timeline')),
  toast: dynamic(() => import('../previews/toast')),
  tooltip: dynamic(() => import('../previews/tooltip')),
  'typing-indicator': dynamic(() => import('../previews/typing-indicator')),
}

export function ComponentPreview({ slug, name }: { slug: string; name: string }) {
  const Preview = PREVIEWS[slug]
  if (!Preview) return null
  return (
    <div className="preview">
      <Preview name={name} />
    </div>
  )
}

/** Slugs with a preview module, for the coverage report. */
export const previewSlugs = Object.keys(PREVIEWS)
