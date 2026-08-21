'use client'

import { useId } from 'react'

/**
 * A stable id for `aria-*` wiring, or the caller's own id when they passed one.
 *
 * `React.useId` is already isomorphic — it produces the same string on the server and
 * during hydration, which is the whole reason components must never reach for
 * `Math.random()` here. What it cannot do is step aside, and every component that
 * accepts an `id` prop needs exactly that: honour the caller's id, generate one
 * otherwise. Doing it in a hook keeps the rule (and the "call hooks unconditionally"
 * part of it) in one place instead of repeated at every call site.
 *
 * `useId` is always called, even when `override` is given, because skipping it would
 * change the hook order between renders.
 */
export function useIsomorphicId(override?: string): string {
  const generated = useId()
  return override ?? generated
}
