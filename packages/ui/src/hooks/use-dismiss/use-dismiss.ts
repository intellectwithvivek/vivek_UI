'use client'

import { useEffect, useRef } from 'react'

/** Anything ref-like: a `useRef` object, or a hand-rolled `{ current }` box. */
export type DismissRef = { readonly current: Element | null }

/** Why the layer is closing. Handy for animation direction and analytics. */
export type DismissReason = 'escape-key' | 'outside-press'

export interface UseDismissOptions {
  /** Called when the user asks for the layer to close. */
  onDismiss: (reason: DismissReason) => void
  /**
   * Everything that counts as "inside": the panel, its trigger, and any sub-layer
   * rendered through a portal. Refs whose `current` is still `null` are skipped, so an
   * array built before mount is fine.
   */
  refs?: ReadonlyArray<DismissRef | null | undefined>
  /** Turn the whole hook off. Default `true`. */
  enabled?: boolean
  /** Close on Escape. Default `true`. */
  escapeKey?: boolean
  /** Close on a pointer press outside every ref. Default `true`. */
  outsidePress?: boolean
}

/**
 * The stack of layers currently listening, oldest first.
 *
 * Escape must close one thing: the popover inside the modal, not the modal too. Since
 * every layer listens on the document, they would all fire on the same keystroke, and
 * `stopPropagation` cannot help — listeners on the same node all run regardless. So the
 * layers agree among themselves that only the last one registered responds.
 */
const layers: object[] = []

/**
 * Escape-to-close and press-outside-to-close for any overlay.
 *
 * Outside presses are detected on `pointerdown`, never on `click`. A click event is
 * dispatched on the nearest common ancestor of press and release, so a drag that starts
 * inside the panel — selecting text, dragging a slider — and releases outside it reports
 * `<body>` as its target, and a click-based implementation closes the layer the user was
 * in the middle of using. The press target is unambiguous, so that misfire cannot happen
 * here.
 */
export function useDismiss({
  onDismiss,
  refs,
  enabled = true,
  escapeKey = true,
  outsidePress = true,
}: UseDismissOptions): void {
  // Latest-value refs: `refs` is a fresh array literal on most renders, and `onDismiss`
  // an inline closure. Depending on either would resubscribe on every render.
  const onDismissRef = useRef(onDismiss)
  const refsRef = useRef(refs)
  const escapeKeyRef = useRef(escapeKey)
  const outsidePressRef = useRef(outsidePress)
  onDismissRef.current = onDismiss
  refsRef.current = refs
  escapeKeyRef.current = escapeKey
  outsidePressRef.current = outsidePress

  useEffect(() => {
    if (!enabled) return

    const layer = {}
    layers.push(layer)
    const doc = document

    const isInside = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false
      for (const ref of refsRef.current ?? []) {
        const element = ref?.current
        if (element?.contains(target)) return true
      }
      return false
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (!escapeKeyRef.current) return
      // Only the innermost (most recently opened) layer answers.
      if (layers[layers.length - 1] !== layer) return
      onDismissRef.current('escape-key')
    }

    // Typed as `Event` rather than `PointerEvent`: only `target` is read, and this keeps
    // the handler working with the plainer events some test environments dispatch.
    const onPointerDown = (event: Event) => {
      if (!outsidePressRef.current) return
      if (isInside(event.target)) return
      onDismissRef.current('outside-press')
    }

    doc.addEventListener('keydown', onKeyDown, true)
    doc.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      doc.removeEventListener('keydown', onKeyDown, true)
      doc.removeEventListener('pointerdown', onPointerDown, true)
      const index = layers.indexOf(layer)
      if (index !== -1) layers.splice(index, 1)
    }
  }, [enabled])
}
