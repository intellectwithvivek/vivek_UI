'use client'

import { Tooltip } from '@the_viveksingh/vivek-ui'
import { useEffect, useState } from 'react'
import { ACCENT_ATTRIBUTE, ACCENT_STORAGE_KEY, ACCENTS, DEFAULT_ACCENT } from '../lib/accents'

/**
 * Switches the site's accent colour.
 *
 * It sets one attribute on `<html>`; `app/accent.css` does the rest. Nothing is recomputed
 * in JavaScript and no component is re-rendered — every colour in the page is already a
 * `var(--vk-color-primary)` reference, so the whole site changes in one style recalculation.
 *
 * That is the point of shipping it: it is the most direct demonstration available that the
 * token system is real, and it is roughly twenty lines to build.
 *
 * A radiogroup, not five buttons: this is one choice among mutually exclusive options, so
 * arrow keys should move between them and a screen reader should announce "2 of 5".
 */
export function AccentPicker() {
  const [active, setActive] = useState<string | null>(null)

  // Read after mount. The inline script in <head> has already applied the attribute, so
  // this only syncs React's copy of it — reading during render would mismatch the server.
  useEffect(() => {
    const current = document.documentElement.getAttribute(ACCENT_ATTRIBUTE)
    setActive(current && ACCENTS.some((a) => a.id === current) ? current : DEFAULT_ACCENT)
  }, [])

  const choose = (id: string) => {
    document.documentElement.setAttribute(ACCENT_ATTRIBUTE, id)
    setActive(id)
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, id)
    } catch {
      // Private mode. The choice still applies for this page view.
    }
  }

  return (
    <div aria-label="Accent colour" className="accent-picker" role="radiogroup">
      {ACCENTS.map((accent) => {
        const selected = active === accent.id
        return (
          <Tooltip content={accent.label} key={accent.id}>
            <button
              aria-checked={selected}
              className="accent-picker__swatch"
              onClick={() => choose(accent.id)}
              role="radio"
              style={{ '--swatch': accent.swatch } as React.CSSProperties}
              // One tab stop for the group, arrow keys within it — the radiogroup pattern.
              // Before mount `active` is null, so nothing is focusable; the first swatch
              // takes the tab stop then, which keeps the group reachable either way.
              tabIndex={selected || (active === null && accent.id === DEFAULT_ACCENT) ? 0 : -1}
              type="button"
            >
              <span className="vk-visually-hidden">{accent.label}</span>
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
