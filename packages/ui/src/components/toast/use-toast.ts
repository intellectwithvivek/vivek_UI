'use client'

import { useContext } from 'react'
import { type ToastApi, ToastContext } from './toast-context'

/**
 * The imperative handle on the toast queue: `{ toast, dismiss, dismissAll, update }`.
 *
 * Every function is identity-stable for the life of the provider, so it is safe in a
 * `useEffect` dependency array and in a `useCallback` that you do not want re-created.
 *
 * ```tsx
 * const { toast, dismiss } = useToast()
 * const id = toast({ title: 'Saved', tone: 'success' })
 * // …later
 * dismiss(id)
 * ```
 *
 * Throws when there is no `<ToastProvider>` above. A hook that quietly did nothing
 * would surface as "my toasts never show up" with no clue where to look.
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (api === null) {
    throw new Error('[vivek-ui] useToast() must be called inside a <ToastProvider>.')
  }
  return api
}
