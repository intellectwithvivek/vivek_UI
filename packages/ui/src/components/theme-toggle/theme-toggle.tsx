'use client'

import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { IconButton, type IconButtonProps } from '../icon-button'
import type { Theme } from '../theme-provider'
import { useTheme } from '../theme-provider'

/** `toggle` flips light and dark. `cycle` walks light → dark → system → light. */
export type ThemeToggleMode = 'toggle' | 'cycle'

const CYCLE: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }

const NEXT_LABEL: Record<Theme, string> = {
  light: 'Switch to light theme',
  dark: 'Switch to dark theme',
  system: 'Use the system theme',
}

export interface ThemeToggleProps extends Omit<IconButtonProps, 'aria-label' | 'children'> {
  mode?: ThemeToggleMode
  /** Override the announced label for the theme the press would move TO. */
  labels?: Partial<Record<Theme, string>>
  /** Overrides the derived label entirely. */
  'aria-label'?: string
}

/**
 * The theme switch every consumer asks for.
 *
 * The accessible name describes what the press will DO ("Switch to dark theme"), not what
 * is currently on. An icon-only control named after its current state is the classic
 * confusion here — the user cannot tell whether the moon means "it is dark" or "make it
 * dark", and only the action reading is unambiguous.
 *
 * The icon shows the CHOICE, including the monitor for `'system'`, so a user who opted into
 * following the OS can see that they did. It is a plain button, not `aria-pressed`: there
 * are three states, and a toggle button only has two.
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { mode = 'toggle', labels, className, onClick, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const next: Theme = mode === 'cycle' ? CYCLE[theme] : resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <IconButton
      ref={ref}
      className={cx('vk-theme-toggle', className)}
      aria-label={ariaLabel ?? labels?.[next] ?? NEXT_LABEL[next]}
      data-theme-choice={theme}
      data-theme-resolved={resolvedTheme}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        setTheme(next)
      }}
      {...rest}
    >
      <ThemeGlyph theme={theme} />
    </IconButton>
  )
})

/** Sun, moon, monitor. Decorative: the button's `aria-label` carries the meaning. */
function ThemeGlyph({ theme }: { theme: Theme }) {
  return (
    <svg
      className="vk-theme-toggle__glyph"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {theme === 'light' ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </>
      ) : null}
      {theme === 'dark' ? <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /> : null}
      {theme === 'system' ? (
        <>
          <rect x="2.5" y="4" width="19" height="12" rx="2" />
          <path d="M9 20h6M12 16v4" />
        </>
      ) : null}
    </svg>
  )
}
