'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

export type Theme = 'light' | 'dark' | 'system'
/** `'system'` has already been resolved against `prefers-color-scheme`. */
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** What the user chose, including `'system'`. */
  theme: Theme
  /** What is actually applied — never `'system'`. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const DEFAULT_STORAGE_KEY = 'vk-theme'
export const DEFAULT_THEME_ATTRIBUTE = 'data-theme'
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * The stored theme has to be adopted BEFORE the browser paints, or a `ThemeToggle`
 * renders its sun icon for one frame on a dark page. `typeof window` is a guard, not an
 * access: it cannot throw in Node, which is what keeps this module importable there.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * Every storage access is wrapped: `localStorage` is not merely empty in Safari private
 * mode and under a blocked-cookies policy, it *throws* on access. An unguarded read here
 * takes the whole page down.
 */
function readStoredTheme(key: string): Theme | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(key)
    return isTheme(raw) ? raw : null
  } catch {
    return null
  }
}

function writeStoredTheme(key: string, theme: Theme): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, theme)
  } catch {
    // Private mode, a full quota, a blocking policy. The theme still applies for this
    // page load; it just will not be remembered.
  }
}

function currentSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light'
}

const FALLBACK_CONTEXT: ThemeContextValue = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {
    /* No provider mounted: nothing owns the theme, so there is nothing to set. */
  },
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * `{ theme, resolvedTheme, setTheme }`.
 *
 * Outside a `ThemeProvider` this returns a safe, inert value rather than throwing: a
 * `ThemeToggle` in a Storybook story, a test, or a page that forgot the provider should
 * render and be inspectable, not crash the tree. `setTheme` is a no-op there — the
 * provider is what owns the attribute and the storage.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? FALLBACK_CONTEXT
}

export interface ThemeScriptOptions {
  /** `localStorage` key. Defaults to `'vk-theme'`. */
  storageKey?: string
  /** Used when nothing is stored. Defaults to `'system'`. */
  defaultTheme?: Theme
  /** Attribute set on `<html>`. Defaults to `'data-theme'`. */
  attribute?: string
}

/**
 * A JS string literal that cannot terminate the `<script>` element it is inlined into.
 */
function jsString(value: string): string {
  // Angle brackets are stripped rather than escaped. A storage key, attribute name or
  // theme value containing one is a bug, not a use case, and removing them makes a
  // `</script>` breakout impossible without relying on an escape sequence surviving every
  // build step between here and the HTML. `JSON.stringify` handles quotes and newlines.
  return JSON.stringify(value.replace(/[<>]/g, ''))
}

/**
 * The anti-flash snippet, parameterised.
 *
 * ```tsx
 * // app/layout.tsx
 * <head>
 *   <script dangerouslySetInnerHTML={{ __html: createThemeScript({ storageKey: 'acme-theme' }) }} />
 * </head>
 * ```
 */
export function createThemeScript({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultTheme = 'system',
  attribute = DEFAULT_THEME_ATTRIBUTE,
}: ThemeScriptOptions = {}): string {
  return (
    `!function(){try{var s=localStorage.getItem(${jsString(storageKey)}),` +
    `t=s==="light"||s==="dark"||s==="system"?s:${jsString(defaultTheme)},` +
    `r=t==="system"?(window.matchMedia("${COLOR_SCHEME_QUERY}").matches?"dark":"light"):t,` +
    `e=document.documentElement;e.setAttribute(${jsString(attribute)},r);` +
    `e.style.colorScheme=r}catch(_){}}()`
  )
}

/**
 * The anti-flash snippet with the default key and attribute — inline it in `<head>`:
 *
 * ```tsx
 * <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 * ```
 *
 * Why it exists: React cannot help here. The server has no idea what this visitor chose,
 * so the HTML ships with whatever the default is, and by the time hydration runs and an
 * effect could read `localStorage`, the browser has already painted a white page to
 * someone who asked for dark. This snippet is synchronous and blocking in `<head>`, so it
 * sets `data-theme` (and `color-scheme`, for native scrollbars and form controls) before
 * the first paint. That is the whole trick, and it is why no amount of React can replace
 * a plain script tag.
 *
 * It is `try/catch`-wrapped end to end and falls silent on any failure, so a browser with
 * storage disabled just gets the default theme.
 */
export const themeScript: string = createThemeScript()

export interface ThemeProviderProps {
  children?: ReactNode
  /** Used when nothing is stored. Defaults to `'system'`. */
  defaultTheme?: Theme
  /** `localStorage` key. Defaults to `'vk-theme'`. Must match the one in `themeScript`. */
  storageKey?: string
  /** Attribute set on `<html>`. Defaults to `'data-theme'`, which is what tokens.css reads. */
  attribute?: string
  /** Set to `false` to reject a stored `'system'` and stay on an explicit theme. */
  enableSystem?: boolean
}

/**
 * Owns the theme: resolves it, applies it to `<html>`, persists it, and follows the OS.
 *
 * Renders no DOM of its own — it is a context provider and three effects, so it can wrap
 * a whole app without adding a wrapper element to the layout.
 *
 * Hydration discipline: the first render uses `defaultTheme`, never `localStorage`, so
 * server and client agree. Storage is adopted in a layout effect, which runs after commit
 * but before paint, so nothing wrong is ever shown — and `themeScript` has already set the
 * attribute anyway, which is what stops the flash on the very first load.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
  attribute = DEFAULT_THEME_ATTRIBUTE,
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')

  // Adopt what the visitor chose last time, before the first paint.
  useIsomorphicLayoutEffect(() => {
    setSystemTheme(currentSystemTheme())
    const stored = readStoredTheme(storageKey)
    if (stored === null) return
    if (stored === 'system' && !enableSystem) return
    setThemeState(stored)
  }, [storageKey, enableSystem])

  // Follow the OS while it is being followed.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(COLOR_SCHEME_QUERY)
    if (typeof query.addEventListener !== 'function') return
    const onChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // `system` follows the OS; anything else is already resolved. With `enableSystem`
  // switched off there is nothing to follow, so it falls back to light.
  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (enableSystem ? systemTheme : 'light') : theme

  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.setAttribute(attribute, resolvedTheme)
    // Native scrollbars, form controls and `<input type="date">` pickers follow this, and
    // nothing else can tell them what palette they are in.
    root.style.colorScheme = resolvedTheme
  }, [attribute, resolvedTheme])

  // A change in another tab is still this user changing their mind.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      if (!isTheme(event.newValue)) return
      if (event.newValue === 'system' && !enableSystem) return
      setThemeState(event.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey, enableSystem])

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next === 'system' && !enableSystem ? 'light' : next)
      writeStoredTheme(storageKey, next)
    },
    [storageKey, enableSystem],
  )

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
