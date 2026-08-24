'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@the_viveksingh/vivek-ui'
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
 * token system is real.
 *
 * **One button, not five.** The first version laid the five swatches out in a row, which came
 * to roughly 150px — most of a phone's header, and still too much at 768px, where it pushed
 * the nav links into each other. Every attempt to fix that with breakpoints made it worse,
 * because the header mixes two coordinate systems: the library's `Navbar` switches its links
 * between a sheet and an inline row on a **container** query, while any rule written here is
 * a **viewport** media query. Between those two thresholds the picker ended up inline in the
 * middle of the link row.
 *
 * A control that is 32px wide at every width has no thresholds to disagree about.
 *
 * The panel is still a radiogroup: one choice among mutually exclusive options, so arrow keys
 * move between them and a screen reader announces "2 of 5".
 */
export function AccentPicker() {
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Read after mount. The inline script in <head> has already applied the attribute, so
  // this only syncs React's copy of it — reading during render would mismatch the server.
  useEffect(() => {
    const current = document.documentElement.getAttribute(ACCENT_ATTRIBUTE)
    setActive(current && ACCENTS.some((a) => a.id === current) ? current : DEFAULT_ACCENT)
  }, [])

  const choose = (id: string) => {
    document.documentElement.setAttribute(ACCENT_ATTRIBUTE, id)
    setActive(id)
    setOpen(false)
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, id)
    } catch {
      // Private mode. The choice still applies for this page view.
    }
  }

  const current = ACCENTS.find((accent) => accent.id === active)

  return (
    <Popover align="end" onOpenChange={setOpen} open={open}>
      {/*
        `PopoverTrigger` renders its own button and takes no `asChild`, unlike `Button` and
        the `Navbar` parts — so it is styled directly rather than wrapped.
      */}
      <PopoverTrigger
        aria-label={`Accent colour${current ? `: ${current.label}` : ''}`}
        className="accent-trigger"
        style={{ '--swatch': current?.swatch ?? 'var(--vk-color-primary)' } as React.CSSProperties}
      >
        <span className="accent-trigger__dot" />
      </PopoverTrigger>

      <PopoverContent>
        <div aria-label="Accent colour" className="accent-picker" role="radiogroup">
          {ACCENTS.map((accent) => {
            const selected = active === accent.id
            return (
              <button
                aria-checked={selected}
                className="accent-picker__swatch"
                key={accent.id}
                onClick={() => choose(accent.id)}
                role="radio"
                style={{ '--swatch': accent.swatch } as React.CSSProperties}
                // One tab stop for the group, arrow keys within it — the radiogroup pattern.
                // Before mount `active` is null, so nothing is focusable; the default takes
                // the tab stop then, which keeps the group reachable either way.
                tabIndex={selected || (active === null && accent.id === DEFAULT_ACCENT) ? 0 : -1}
                type="button"
              >
                <span className="vk-visually-hidden">{accent.label}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
