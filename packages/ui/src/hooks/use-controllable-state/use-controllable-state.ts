'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** The next value, or a function deriving it from the previous one. */
export type ControllableUpdater<T> = T | ((previous: T) => T)

export interface UseControllableStateOptions<T> {
  /**
   * The controlled value. Anything other than `undefined` puts the hook in controlled
   * mode, where the prop is the single source of truth and `setState` only reports.
   */
  value?: T
  /** The value used while uncontrolled. Read once, on mount. */
  defaultValue?: T
  /**
   * Called on every `setState` with the resolved next value — in both modes, and even
   * when the value did not change. A caller that wants change-only notifications can
   * compare; a caller that wants "the user acted" cannot recover a swallowed call.
   */
  onChange?: (value: T) => void
}

/**
 * One state hook that behaves like `useState` when uncontrolled and like a pure
 * reporter when controlled.
 *
 * The two bugs this exists to avoid:
 *
 * 1. **Lost updates from functional setters.** Naive implementations resolve
 *    `setState(prev => …)` against the value captured by the current render, so two
 *    calls in one event handler both start from the same `prev` and the first one is
 *    discarded. Here the base lives in a ref that `setState` advances synchronously, so
 *    calls compose exactly like React's own updater queue.
 * 2. **Mode flapping.** A caller that starts uncontrolled and later passes `value`
 *    (or the reverse) must not snap back to `defaultValue`. Going controlled, the prop
 *    simply wins; coming back out of controlled mode, the last controlled value is
 *    carried into the internal state instead of the stale default.
 *
 * Caveat inherited from React: a `T` that is itself a function cannot be set directly,
 * because `setState` treats a function argument as an updater. Wrap it — `setState(() => fn)`.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: ControllableUpdater<T>) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue as T)
  const isControlled = value !== undefined
  const state = value !== undefined ? value : uncontrolled

  // Mirrors of this render's props/state, so `setState` can stay identity-stable and
  // still read fresh values. Assigning during render is safe: every one of these is
  // derived from the render that is happening, so a render React throws away leaves
  // nothing behind that the next render does not overwrite.
  const stateRef = useRef<T>(state)
  const onChangeRef = useRef(onChange)
  const isControlledRef = useRef(isControlled)
  const lastControlledRef = useRef<T>(state)
  stateRef.current = state
  onChangeRef.current = onChange
  isControlledRef.current = isControlled
  if (isControlled) lastControlledRef.current = state

  // Controlled -> uncontrolled: keep showing what the user last saw.
  const wasControlledRef = useRef(isControlled)
  useEffect(() => {
    if (wasControlledRef.current && !isControlled) setUncontrolled(lastControlledRef.current)
    wasControlledRef.current = isControlled
  }, [isControlled])

  const setState = useCallback((next: ControllableUpdater<T>) => {
    const resolved =
      typeof next === 'function' ? (next as (previous: T) => T)(stateRef.current) : next
    // Advance the base first: a second call in the same tick must see this result.
    stateRef.current = resolved
    if (!isControlledRef.current) setUncontrolled(resolved)
    onChangeRef.current?.(resolved)
  }, [])

  return [state, setState]
}
