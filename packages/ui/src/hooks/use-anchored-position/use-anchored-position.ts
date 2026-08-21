'use client'

import { type RefObject, useLayoutEffect, useState } from 'react'
import { type Align, type PositionResult, position, type Side } from '../../utils/position'

/**
 * Resolve where a floating element should sit relative to an anchor.
 *
 * A layout effect rather than an effect, so the panel is positioned in the same commit
 * that first paints it — otherwise it appears at 0,0 and visibly jumps. This is safe on
 * the server because floating panels only ever render inside a `Portal`, which returns
 * `null` until it has mounted, so this never runs during server rendering.
 *
 * Returns `null` until the anchor and the panel are both measurable; callers keep the
 * panel transparent until then (`data-positioned`).
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  side: Side,
  align: Align,
  offset: number,
  padding: number,
): PositionResult | null {
  const [resolved, setResolved] = useState<PositionResult | null>(null)

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    const floating = floatingRef.current
    if (!anchor || !floating) return

    const update = () => {
      const trigger = anchor.getBoundingClientRect()
      const box = floating.getBoundingClientRect()
      const next = position({
        trigger: { x: trigger.x, y: trigger.y, width: trigger.width, height: trigger.height },
        floating: { width: box.width, height: box.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        side,
        align,
        offset,
        padding,
      })
      // Bail out on an unchanged result, so scrolling a nested scroller that does not
      // move the anchor costs no re-render.
      setResolved((previous) =>
        previous &&
        previous.x === next.x &&
        previous.y === next.y &&
        previous.side === next.side &&
        previous.align === next.align
          ? previous
          : next,
      )
    }

    update()
    // Capture phase, so scrolling in any ancestor scroller counts, not just the window.
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [anchorRef, floatingRef, side, align, offset, padding])

  return resolved
}
