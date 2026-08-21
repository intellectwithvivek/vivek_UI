'use client'

import { createContext, type ReactNode } from 'react'
import type { ToastTone } from './toast'

export interface ToastOptions {
  /**
   * Reuse an id to replace a toast in place instead of stacking a second one — the
   * "one toast per save operation" pattern. Omit it and the provider mints one.
   */
  id?: string
  title?: ReactNode
  description?: ReactNode
  /** Drives both the colour and the politeness of the announcement. Default `'info'`. */
  tone?: ToastTone
  /**
   * Milliseconds on screen. `Infinity` or `null` means "never auto-dismiss" — the
   * toast stays until something calls `dismiss`. Omit to inherit the provider's default.
   */
  duration?: number | null
  /** A control the toast offers, e.g. `<Button size="sm" onClick={undo}>Undo</Button>`. */
  action?: ReactNode
  /** `false` removes the dismiss button, for a toast that must be resolved via `action`. */
  dismissible?: boolean
}

/** A queued toast: the caller's options with the defaults the provider filled in. */
export interface ToastRecord extends ToastOptions {
  id: string
  tone: ToastTone
}

export interface ToastApi {
  /** Queue a toast (or replace the one with the same `id`). Returns its id. */
  toast: (options: ToastOptions) => string
  /** Remove one toast. Unknown or already-removed ids are a no-op. */
  dismiss: (id: string) => void
  /** Remove every toast, queued ones included. */
  dismissAll: () => void
  /** Patch a live toast's content in place. Unknown ids are a no-op. */
  update: (id: string, patch: Omit<ToastOptions, 'id'>) => void
}

/**
 * `null` when there is no provider above, which is what lets `useToast` throw a
 * useful error instead of handing back a silently inert API.
 */
export const ToastContext = createContext<ToastApi | null>(null)
