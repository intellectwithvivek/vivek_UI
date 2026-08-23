'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { PreviewFrame } from './preview-frame'

/**
 * The live demo on a page-template page.
 *
 * Same reasoning as `component-preview.tsx`: an explicit map of `next/dynamic` imports, so
 * each template page ships only its own template. A template-literal path cannot be
 * statically analysed, and an unanalysable dynamic import defeats the splitting.
 *
 * These are the same modules the source panel below the demo prints, so what you read is
 * what is running — there is no second copy to fall out of date.
 */
const TEMPLATES: Record<string, ComponentType> = {
  blog: dynamic(() => import('../page-templates/blog')),
  checkout: dynamic(() => import('../page-templates/checkout')),
  contact: dynamic(() => import('../page-templates/contact')),
  dashboard: dynamic(() => import('../page-templates/dashboard')),
  landing: dynamic(() => import('../page-templates/landing')),
  login: dynamic(() => import('../page-templates/login')),
  'not-found': dynamic(() => import('../page-templates/not-found')),
  pricing: dynamic(() => import('../page-templates/pricing')),
  product: dynamic(() => import('../page-templates/product')),
  settings: dynamic(() => import('../page-templates/settings')),
  signup: dynamic(() => import('../page-templates/signup')),
  team: dynamic(() => import('../page-templates/team')),
}

export function TemplatePreview({ slug, title }: { slug: string; title: string }) {
  const Template = TEMPLATES[slug]
  if (!Template) return null
  return (
    <PreviewFrame title={`${title} — live demo`}>
      <Template />
    </PreviewFrame>
  )
}

/** Slugs with a template module, for the coverage check. */
export const templatePreviewSlugs = Object.keys(TEMPLATES)
