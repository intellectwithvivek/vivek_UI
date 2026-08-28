'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { PreviewFrame } from './preview-frame'

/**
 * The live demo on a block page. An explicit map of `next/dynamic` imports, as for the
 * page templates: each block page ships only its own block, and what you read below the
 * frame is the module that is running inside it.
 */
const BLOCKS: Record<string, ComponentType> = {
  'hero-centered': dynamic(() => import('../blocks/hero-centered')),
  'hero-split-media': dynamic(() => import('../blocks/hero-split-media')),
  'hero-media-first': dynamic(() => import('../blocks/hero-media-first')),
  'hero-backdrop-gradient': dynamic(() => import('../blocks/hero-backdrop-gradient')),
  'hero-fullscreen-dark': dynamic(() => import('../blocks/hero-fullscreen-dark')),
  'hero-with-logos': dynamic(() => import('../blocks/hero-with-logos')),
  'hero-with-stats': dynamic(() => import('../blocks/hero-with-stats')),
  'hero-product-launch': dynamic(() => import('../blocks/hero-product-launch')),
  'hero-app-store': dynamic(() => import('../blocks/hero-app-store')),
  'hero-newsletter': dynamic(() => import('../blocks/hero-newsletter')),
  'header-simple': dynamic(() => import('../blocks/header-simple')),
  'header-centered-links': dynamic(() => import('../blocks/header-centered-links')),
  'header-links-end': dynamic(() => import('../blocks/header-links-end')),
  'header-transparent': dynamic(() => import('../blocks/header-transparent')),
  'header-floating': dynamic(() => import('../blocks/header-floating')),
  'header-with-search': dynamic(() => import('../blocks/header-with-search')),
  'header-with-theme-toggle': dynamic(() => import('../blocks/header-with-theme-toggle')),
  'header-with-avatar': dynamic(() => import('../blocks/header-with-avatar')),
  'header-large-brand': dynamic(() => import('../blocks/header-large-brand')),
  'header-announcement': dynamic(() => import('../blocks/header-announcement')),
  'features-grid-3': dynamic(() => import('../blocks/features-grid-3')),
  'features-grid-4-icons': dynamic(() => import('../blocks/features-grid-4-icons')),
  'features-bento': dynamic(() => import('../blocks/features-bento')),
  'features-split-image': dynamic(() => import('../blocks/features-split-image')),
  'features-list-checks': dynamic(() => import('../blocks/features-list-checks')),
  'features-tabs': dynamic(() => import('../blocks/features-tabs')),
  'pricing-three': dynamic(() => import('../blocks/pricing-three')),
  'pricing-two': dynamic(() => import('../blocks/pricing-two')),
  'pricing-with-toggle': dynamic(() => import('../blocks/pricing-with-toggle')),
  'pricing-comparison-table': dynamic(() => import('../blocks/pricing-comparison-table')),
  'pricing-single': dynamic(() => import('../blocks/pricing-single')),
  'pricing-with-faq': dynamic(() => import('../blocks/pricing-with-faq')),
  'testimonials-grid': dynamic(() => import('../blocks/testimonials-grid')),
  'testimonials-single-quote': dynamic(() => import('../blocks/testimonials-single-quote')),
  'testimonials-marquee': dynamic(() => import('../blocks/testimonials-marquee')),
  'testimonials-with-logos': dynamic(() => import('../blocks/testimonials-with-logos')),
  'testimonials-two-column': dynamic(() => import('../blocks/testimonials-two-column')),
  'cta-band-primary': dynamic(() => import('../blocks/cta-band-primary')),
  'cta-inset-card': dynamic(() => import('../blocks/cta-inset-card')),
  'cta-split': dynamic(() => import('../blocks/cta-split')),
  'cta-with-newsletter': dynamic(() => import('../blocks/cta-with-newsletter')),
  'cta-app-download': dynamic(() => import('../blocks/cta-app-download')),
  'cta-muted-bordered': dynamic(() => import('../blocks/cta-muted-bordered')),
  'faq-stack': dynamic(() => import('../blocks/faq-stack')),
  'faq-two-columns': dynamic(() => import('../blocks/faq-two-columns')),
  'faq-side': dynamic(() => import('../blocks/faq-side')),
  'faq-with-contact': dynamic(() => import('../blocks/faq-with-contact')),
  'faq-categorised': dynamic(() => import('../blocks/faq-categorised')),
  'footer-columns': dynamic(() => import('../blocks/footer-columns')),
  'footer-minimal': dynamic(() => import('../blocks/footer-minimal')),
  'footer-with-newsletter': dynamic(() => import('../blocks/footer-with-newsletter')),
  'footer-social': dynamic(() => import('../blocks/footer-social')),
  'footer-centered': dynamic(() => import('../blocks/footer-centered')),
  'footer-with-badges': dynamic(() => import('../blocks/footer-with-badges')),
  'stats-band': dynamic(() => import('../blocks/stats-band')),
  'stats-with-title': dynamic(() => import('../blocks/stats-with-title')),
  'stats-in-cards': dynamic(() => import('../blocks/stats-in-cards')),
  'stats-primary': dynamic(() => import('../blocks/stats-primary')),
  'form-contact': dynamic(() => import('../blocks/form-contact')),
  'form-signup-card': dynamic(() => import('../blocks/form-signup-card')),
  'form-newsletter-inline': dynamic(() => import('../blocks/form-newsletter-inline')),
  'form-settings-row': dynamic(() => import('../blocks/form-settings-row')),
}

export function BlockPreview({
  slug,
  title,
  height,
}: {
  slug: string
  title: string
  height: number
}) {
  const Block = BLOCKS[slug]
  if (!Block) return null
  return (
    <PreviewFrame title={`${title} — live demo`} height={height}>
      <Block />
    </PreviewFrame>
  )
}

/** Slugs with a block module, for the coverage check. */
export const blockPreviewSlugs = Object.keys(BLOCKS)
