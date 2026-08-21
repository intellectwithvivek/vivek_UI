import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Which axis may overflow. Default `vertical`. */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /**
   * `auto` — a scrollbar appears when the content overflows (the browser default).
   * `always` — the track is reserved, so the content never reflows when it starts to
   * overflow. `hidden` — the scrollbar is not painted, but the area still scrolls with
   * the wheel, a trackpad, touch, and the keyboard.
   *
   * Default `auto`.
   */
  scrollbar?: 'auto' | 'always' | 'hidden'
  /** Scrollbar thickness where the browser lets us pick. Default `thin`. */
  thickness?: 'thin' | 'auto'
}

/**
 * A styled overflow container.
 *
 * Pure CSS: `scrollbar-width` / `scrollbar-color` for Firefox and Chrome 121+, plus a
 * `::-webkit-scrollbar` fallback for older WebKit, both driven from `--vk-*` tokens so a
 * dark theme gets a dark scrollbar with no extra props. No JavaScript, no overlay
 * scrollbar to keep in sync with a resizing viewport, and nothing to hydrate — it renders
 * untouched in a React Server Component.
 *
 * Two things it deliberately does **not** do, because both are how styled scroll
 * containers usually become keyboard traps:
 *
 * - `scrollbar="hidden"` hides the scrollbar, never the overflow. The element keeps
 *   `overflow: auto`, so PageUp/PageDown, the arrow keys and the wheel all still work.
 * - It is focusable (`tabIndex={0}` by default). A scroll container whose content holds
 *   no focusable elements is unreachable by keyboard unless the container itself can take
 *   focus — this is the axe `scrollable-region-focusable` rule, and it is on by default
 *   here rather than left to the consumer. Pass `tabIndex={-1}` to opt out when the
 *   content is a list of links that already provide the keyboard route.
 *
 * ```tsx
 * <ScrollArea style={{ maxHeight: '16rem' }} aria-label="Changelog">
 *   …
 * </ScrollArea>
 * ```
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    orientation = 'vertical',
    scrollbar = 'auto',
    thickness = 'thin',
    tabIndex = 0,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('vk-scroll-area', className)}
      data-orientation={orientation}
      data-scrollbar={scrollbar}
      data-thickness={thickness}
      tabIndex={tabIndex}
      {...rest}
    />
  )
})
