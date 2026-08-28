import sources from '../block-sources.json'
import { BLOCK_CATEGORIES, BLOCKS, type BlockCategory, type BlockMeta } from '../blocks'
import type { TemplateSource } from './page-templates'

export type { BlockCategory, BlockMeta }

export interface Block extends BlockMeta, TemplateSource {}

const BY_SLUG = sources as Record<string, TemplateSource>

/**
 * Metadata joined to generated source, exactly as `page-templates.ts` does for whole pages.
 * `gen-page-sources.mjs --dir blocks` fails the build when the list and the directory
 * disagree, so the fallback only ever renders in a partially generated tree.
 */
export const blocks: Block[] = BLOCKS.map((meta) => ({
  ...meta,
  ...(BY_SLUG[meta.slug] ?? { source: '', uses: [], chartUses: [], isClient: false, lines: 0 }),
}))

export const blockBySlug = (slug: string): Block | undefined =>
  blocks.find((block) => block.slug === slug)

/** Blocks grouped for the gallery, in the order the categories are declared. */
export function blocksByCategory(): Array<{ category: BlockCategory; items: Block[] }> {
  return BLOCK_CATEGORIES.map((category) => ({
    category,
    items: blocks.filter((block) => block.category === category),
  })).filter((group) => group.items.length > 0)
}

/** Previous and next in gallery order, for the pager at the foot of a block page. */
export function neighbouringBlocks(slug: string): { previous: Block | null; next: Block | null } {
  const index = blocks.findIndex((block) => block.slug === slug)
  if (index === -1) return { previous: null, next: null }
  return { previous: blocks[index - 1] ?? null, next: blocks[index + 1] ?? null }
}

/** Distinct library exports used across every block. */
export function componentsUsedAcrossBlocks(): string[] {
  return [...new Set(blocks.flatMap((block) => [...block.uses, ...block.chartUses]))].sort()
}
