'use client'

import { useEffect } from 'react'

/**
 * How many mounted hooks currently want the scroll locked.
 *
 * Module scope is deliberate: a Modal that opens a Drawer must not have the Drawer's
 * unmount hand scrolling back to the user while the Modal is still open. Reading a
 * counter at module scope is server-safe — nothing here touches `document` until an
 * effect runs.
 */
let lockCount = 0
/** Undoes the one real lock. Non-null exactly while `lockCount > 0`. */
let releaseLock: (() => void) | null = null

function applyLock(): () => void {
  const { body, documentElement } = document
  const view = documentElement.ownerDocument.defaultView

  const previousOverflow = body.style.overflow
  const previousPaddingRight = body.style.paddingRight

  // Hiding the overflow removes the scrollbar, which widens the viewport and shifts
  // every centred layout sideways. Replace exactly the width that disappeared.
  const scrollbarWidth = view ? Math.max(0, view.innerWidth - documentElement.clientWidth) : 0

  body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) {
    const existing = view ? Number.parseFloat(view.getComputedStyle(body).paddingRight) : 0
    const base = Number.isNaN(existing) ? 0 : existing
    body.style.paddingRight = `${base + scrollbarWidth}px`
  }

  return () => {
    // Assigning back the empty string removes the inline property, so a page that
    // never set these ends up with a clean style attribute rather than `overflow: ''`.
    body.style.overflow = previousOverflow
    body.style.paddingRight = previousPaddingRight
  }
}

/**
 * Locks scrolling on `document.body` while `active`, without the layout shift that
 * `overflow: hidden` alone causes.
 *
 * Reference counted: N active hooks mean one lock, and it lifts only when the last of
 * them releases it.
 */
export function useScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return

    lockCount += 1
    if (lockCount === 1) releaseLock = applyLock()

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0 && releaseLock) {
        releaseLock()
        releaseLock = null
      }
    }
  }, [active])
}
