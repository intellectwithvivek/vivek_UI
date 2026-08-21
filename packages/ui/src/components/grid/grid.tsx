import { type CSSProperties, type ElementType, forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import type { StackGap } from '../stack/stack'

/** Fixed breakpoints, documented once: sm 640 · md 768 · lg 1024 · xl 1280. */
export interface ResponsiveCols {
  base?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /**
   * Column count. A number is fixed at every width; an object is responsive.
   * Omit it entirely and the grid auto-fits using `minItemWidth`.
   */
  cols?: number | ResponsiveCols
  /** Auto-fit track floor when `cols` is omitted. Defaults to `16rem`. */
  minItemWidth?: string
  gap?: StackGap
}

/**
 * Responsive grid at zero runtime cost. Responsive `cols` become inline custom
 * properties that the static stylesheet reads inside fixed media queries — no style
 * computation, no CSS generation, SSR-identical.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  { as: Component = 'div', cols, minItemWidth, gap = 4, className, style, ...rest },
  ref,
) {
  const responsive = typeof cols === 'object' && cols !== null ? cols : undefined
  const fixed = typeof cols === 'number' ? cols : undefined

  const vars: Record<string, string | number> = {}
  if (fixed !== undefined) vars['--vk-cols'] = fixed
  if (responsive) {
    if (responsive.base !== undefined) vars['--vk-cols'] = responsive.base
    if (responsive.sm !== undefined) vars['--vk-cols-sm'] = responsive.sm
    if (responsive.md !== undefined) vars['--vk-cols-md'] = responsive.md
    if (responsive.lg !== undefined) vars['--vk-cols-lg'] = responsive.lg
    if (responsive.xl !== undefined) vars['--vk-cols-xl'] = responsive.xl
  }
  if (minItemWidth) vars['--vk-item-min'] = minItemWidth

  return (
    <Component
      ref={ref}
      className={cx('vk-grid', className)}
      data-mode={cols === undefined ? 'auto' : 'cols'}
      data-gap={gap}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    />
  )
})
