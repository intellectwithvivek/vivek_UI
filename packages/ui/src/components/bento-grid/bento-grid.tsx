import { type CSSProperties, type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import type { ResponsiveCols } from '../grid'
import type { StackGap } from '../stack/stack'

/**
 * Responsive span, on the same fixed breakpoints as `Grid`: sm 640 · md 768 · lg 1024 · xl 1280.
 *
 * Aliased from `Grid`'s type on purpose — the breakpoint list is documented in exactly
 * one place, so it cannot drift between the two layout primitives.
 */
export type ResponsiveSpan = ResponsiveCols

/** Order matters: each breakpoint falls back to the one below it. */
const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl'] as const

/**
 * Zero-props default: one column on a phone, two on a tablet, four on a desktop —
 * the shape a bento wall actually wants, without the caller passing anything.
 */
const DEFAULT_COLS: ResponsiveCols = { base: 1, sm: 2, lg: 4 }

/** Track counts and spans are positive integers or nothing. Never trust the caller. */
function positiveInt(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined
  const truncated = Math.trunc(value)
  return truncated >= 1 ? truncated : 1
}

/**
 * Expand `number | ResponsiveSpan` into the inline custom properties the static
 * stylesheet reads inside its fixed media queries — the `Grid` technique. A number
 * lands on the base property and therefore holds at every width; an object writes one
 * property per breakpoint and CSS resolves the fallback chain.
 */
function responsiveVars(
  prefix: string,
  input: number | ResponsiveSpan | undefined,
): Record<string, number> {
  const vars: Record<string, number> = {}
  if (input === undefined) return vars

  if (typeof input === 'number') {
    const fixed = positiveInt(input)
    if (fixed !== undefined) vars[prefix] = fixed
    return vars
  }

  for (const breakpoint of BREAKPOINTS) {
    const value = positiveInt(input[breakpoint])
    if (value === undefined) continue
    vars[breakpoint === 'base' ? prefix : `${prefix}-${breakpoint}`] = value
  }
  return vars
}

export interface BentoGridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /**
   * Track count. A number is fixed at every width; an object is responsive.
   * Defaults to `{ base: 1, sm: 2, lg: 4 }`.
   */
  cols?: number | ResponsiveCols
  gap?: StackGap
  /**
   * Floor for every row, so a one-row tile still has presence and a `rowSpan={2}` tile
   * is exactly twice it. Defaults to `10rem`.
   */
  rowHeight?: string
  /**
   * Let later tiles backfill the holes a wide or tall neighbour leaves behind.
   *
   * Off by default: `grid-auto-flow: dense` reorders tiles visually without touching DOM
   * order, so a keyboard user can tab through a wall in an order that does not match what
   * they see. Turn it on for decorative walls, leave it off when tiles contain controls.
   */
  dense?: boolean
}

/**
 * The asymmetric card wall — a grid whose tiles claim different amounts of it.
 *
 * Server-safe: no state, no effects, no event handlers, and every responsive decision
 * is a custom property the static stylesheet resolves. `BentoGrid.Item` clamps its own
 * span to the track count with `min()`, so a `colSpan={4}` tile on a two-column phone
 * layout goes full-width instead of forcing implicit columns and a horizontal scrollbar.
 */
const BentoGridRoot = forwardRef<HTMLElement, BentoGridProps>(function BentoGrid(
  { as: Component = 'div', cols, gap = 4, rowHeight, dense, className, style, ...rest },
  ref,
) {
  const vars: Record<string, string | number> = responsiveVars(
    '--vk-bento-cols',
    cols ?? DEFAULT_COLS,
  )
  if (rowHeight) vars['--vk-bento-row-height'] = rowHeight

  return (
    <Component
      ref={ref}
      className={cx('vk-bento', className)}
      data-gap={gap}
      data-dense={dense || undefined}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    />
  )
})

export interface BentoGridItemProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Columns to claim. A number holds at every width; an object is responsive. */
  colSpan?: number | ResponsiveSpan
  /** Rows to claim. A number holds at every width; an object is responsive. */
  rowSpan?: number | ResponsiveSpan
}

/**
 * One tile. It is a plain box on purpose — drop a `Card` inside it, or style it yourself.
 * The only thing it owns is how much of the wall it takes up.
 */
const BentoGridItem = forwardRef<HTMLElement, BentoGridItemProps>(function BentoGridItem(
  { as: Component = 'div', colSpan, rowSpan, className, style, ...rest },
  ref,
) {
  const vars: Record<string, string | number> = {
    ...responsiveVars('--vk-bento-col-span', colSpan),
    ...responsiveVars('--vk-bento-row-span', rowSpan),
  }

  return (
    <Component
      ref={ref}
      className={cx('vk-bento__item', className)}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    />
  )
})

/** Compound component: `BentoGrid` and `BentoGrid.Item`. */
export const BentoGrid = Object.assign(BentoGridRoot, { Item: BentoGridItem })
