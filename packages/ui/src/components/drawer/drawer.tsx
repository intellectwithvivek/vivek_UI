'use client'

import { forwardRef } from 'react'
import {
  createDialogParts,
  DialogBase,
  type DialogBaseProps,
  type DialogCloseButtonProps,
  type DialogFocusRef,
  type DialogSlotProps,
  type DialogTitleProps,
} from '../internal/dialog-core'

/**
 * Logical, not physical: `start`/`end` follow the writing direction, so a drawer that
 * slides in from the left in English slides in from the right in Arabic without the
 * consumer changing a prop.
 */
export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface DrawerProps extends Omit<DialogBaseProps, 'block' | 'panelData'> {
  /** Edge the panel is attached to. Default `end`. */
  side?: DrawerSide
  /** Panel thickness — width for `start`/`end`, height for `top`/`bottom`. Default `md`. */
  size?: DrawerSize
}

const parts = createDialogParts('vk-drawer')

const DrawerRoot = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { side = 'end', size = 'md', ...rest },
  ref,
) {
  return (
    <DialogBase
      ref={ref}
      block="vk-drawer"
      panelData={{ 'data-side': side, 'data-size': size }}
      {...rest}
    />
  )
})

/**
 * A modal dialog attached to an edge of the viewport.
 *
 * Same dialog contract as `Modal` — `role="dialog"` + `aria-modal="true"`, focus trapped
 * and restored, Escape and backdrop dismissal, scroll lock, the rest of the page `inert`
 * — differing only in how the panel is placed and animated. It is modal, so it is not the
 * right component for a persistent navigation sidebar.
 *
 * ```tsx
 * <Drawer open={open} onOpenChange={setOpen} side="start" title="Filters">
 *   <Drawer.Body>…</Drawer.Body>
 * </Drawer>
 * ```
 */
export const Drawer = Object.assign(DrawerRoot, {
  Header: parts.Header,
  Body: parts.Body,
  Footer: parts.Footer,
  Title: parts.Title,
  CloseButton: parts.CloseButton,
})

export type {
  DialogCloseButtonProps as DrawerCloseButtonProps,
  DialogFocusRef as DrawerFocusRef,
  DialogSlotProps as DrawerSlotProps,
  DialogTitleProps as DrawerTitleProps,
}

/* Named part exports — see scripts/add-compound-exports.mjs.
 *
 * Drawer is a client component, so a Server Component receives it as a client
 * reference and `Drawer.Part` reads `undefined` off that reference. These named
 * exports are the server-usable form; the dot access still works in client components.
 */
const DrawerHeader = parts.Header
const DrawerBody = parts.Body
const DrawerFooter = parts.Footer
const DrawerTitle = parts.Title
const DrawerCloseButton = parts.CloseButton

export { DrawerBody, DrawerCloseButton, DrawerFooter, DrawerHeader, DrawerTitle }
