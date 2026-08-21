'use client'

import { useEffect } from 'react'

/** Anything ref-like: a `useRef` object, or a hand-rolled `{ current }` box. */
export type FocusTrapRef = { readonly current: HTMLElement | null }

/**
 * Everything the platform can focus with Tab, before filtering. `[tabindex]` catches
 * the `div tabindex="0"` case; the filter below throws out the negative ones.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'audio[controls]',
  'button',
  'details',
  'embed',
  'iframe',
  'input',
  'object',
  'select',
  'summary',
  'textarea',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

function isDisabled(element: HTMLElement): boolean {
  // `disabled` on a fieldset takes its descendants out of the tab order too.
  return element.hasAttribute('disabled') || element.closest('fieldset[disabled]') !== null
}

function isHidden(element: HTMLElement): boolean {
  if (element.tagName === 'INPUT' && element.getAttribute('type') === 'hidden') return true

  const view = element.ownerDocument.defaultView
  for (let node: HTMLElement | null = element; node !== null; node = node.parentElement) {
    if (node.hasAttribute('hidden') || node.hasAttribute('inert')) return true
    if (view) {
      const style = view.getComputedStyle(node)
      if (style.display === 'none' || style.visibility === 'hidden') return true
    }
  }
  return false
}

/**
 * The container's tabbable descendants, in DOM order.
 *
 * Recomputed on every Tab rather than cached, which is what makes a trap survive
 * content that mounts, unmounts or becomes disabled while it is open.
 *
 * Known limitation: positive `tabindex` values are not re-ordered. They are a bug in
 * user code more often than a feature, and honouring them would mean sorting the list
 * on every keystroke.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = []
  for (const element of container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) {
    if (element.tabIndex < 0) continue
    if (isDisabled(element)) continue
    if (isHidden(element)) continue
    result.push(element)
  }
  return result
}

/**
 * Keeps Tab and Shift+Tab inside `containerRef` while `active`, and hands focus back
 * to wherever it came from on deactivate.
 *
 * On activate, focus moves to the first tabbable descendant. If there is none the
 * container itself is focused (borrowing `tabindex="-1"` for as long as the trap
 * lasts) and Tab is swallowed, because the alternative — letting focus fall through to
 * the page behind an open modal — is the failure mode this hook exists to prevent.
 *
 * The listener sits on the document in the capture phase, so focus that has escaped
 * the container (a stray `.focus()`, a click on the backdrop) is pulled back on the
 * next Tab instead of walking the rest of the page.
 */
export function useFocusTrap(containerRef: FocusTrapRef, active: boolean): void {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const doc = container.ownerDocument
    const previouslyFocused = doc.activeElement instanceof HTMLElement ? doc.activeElement : null

    // Only take focus if it is not already somewhere inside; stealing it from a child
    // the consumer deliberately focused (an autofocused input) would be a regression.
    let borrowedTabIndex = false
    if (!container.contains(doc.activeElement)) {
      const first = getFocusableElements(container)[0]
      if (first) {
        first.focus()
      } else {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1')
          borrowedTabIndex = true
        }
        container.focus()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return

      const focusable = getFocusableElements(container)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) {
        // Nothing to move to. Swallow the key so focus cannot leak out.
        event.preventDefault()
        return
      }

      const current = doc.activeElement
      const index = current instanceof HTMLElement ? focusable.indexOf(current) : -1

      if (event.shiftKey) {
        // index === -1 means focus is on the container or outside it: wrap to the end.
        if (index <= 0) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (index === -1 || index === focusable.length - 1) {
        event.preventDefault()
        first.focus()
      }
    }

    doc.addEventListener('keydown', onKeyDown, true)

    return () => {
      doc.removeEventListener('keydown', onKeyDown, true)
      if (borrowedTabIndex) container.removeAttribute('tabindex')
      // Restore only if the trap still owns focus. If something outside took it in the
      // meantime, that was deliberate and yanking it back would be the rude thing.
      const holdsFocus = container.contains(doc.activeElement) || doc.activeElement === doc.body
      if (previouslyFocused?.isConnected && holdsFocus) previouslyFocused.focus()
    }
  }, [active, containerRef])
}
