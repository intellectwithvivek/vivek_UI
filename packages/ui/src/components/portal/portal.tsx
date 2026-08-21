'use client'

import { forwardRef, type HTMLAttributes, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'

/** Where to portal to: an element, a ref to one, or `null` for "not ready yet". */
export type PortalContainer = Element | { readonly current: Element | null } | null

export interface PortalProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Mount point. Defaults to `document.body`.
   *
   * Passing a ref is supported and is usually what you want, since the element it points
   * at typically renders in the same pass as the Portal.
   */
  container?: PortalContainer
}

function resolveContainer(container: PortalContainer): Element | null {
  if (!container) return null
  return 'current' in container ? container.current : container
}

/**
 * Renders its children somewhere else in the DOM — the escape hatch every overlay needs
 * to get out from under `overflow: hidden` and a parent's stacking context.
 *
 * Two things make this server-safe. It renders `null` on the first pass and only portals
 * after mount, so the server never reaches for a `document` that does not exist and
 * hydration has nothing to mismatch on. And the mount point is resolved inside an effect,
 * which also means a `container` ref that was still empty on the first attempt is picked
 * up as soon as it is attached, instead of silently falling back to the body and dragging
 * the children across the DOM a moment later.
 *
 * The wrapper div is `display: contents`, so it generates no box and a fixed-position
 * overlay inside it positions exactly as it would without it.
 */
export const Portal = forwardRef<HTMLDivElement, PortalProps>(function Portal(
  { container, className, children, ...rest },
  ref,
) {
  const [target, setTarget] = useState<Element | null>(null)

  // No dependency array on purpose: re-resolving after every render is what catches a
  // ref that filled in later. `setState` bails out when the element is unchanged, so
  // this settles after one pass rather than looping.
  useEffect(() => {
    setTarget(container === undefined ? document.body : resolveContainer(container))
  })

  if (!target) return null

  return createPortal(
    <div ref={ref} className={cx('vk-portal', className)} {...rest}>
      {children}
    </div>,
    target,
  )
})
