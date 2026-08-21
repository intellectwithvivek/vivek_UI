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

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps extends Omit<DialogBaseProps, 'block' | 'panelData'> {
  /** Panel width. `full` fills the viewport. Default `md`. */
  size?: ModalSize
}

const parts = createDialogParts('vk-modal')

const ModalRoot = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { size = 'md', ...rest },
  ref,
) {
  return <DialogBase ref={ref} block="vk-modal" panelData={{ 'data-size': size }} {...rest} />
})

/**
 * A centred modal dialog.
 *
 * Implements the WAI-ARIA Authoring Practices dialog pattern: `role="dialog"` with
 * `aria-modal="true"`, focus moved in on open and returned to the trigger on close, Tab
 * kept inside, Escape and a backdrop press to dismiss, body scroll locked, and everything
 * outside the dialog made `inert` and `aria-hidden` for as long as it is open.
 *
 * Renders `null` while closed — there is no hidden DOM to trip over. `className` and
 * `...rest` land on the panel (the `role="dialog"` element); use `overlayClassName` for
 * the backdrop.
 *
 * ```tsx
 * const [open, setOpen] = useState(false)
 * <Modal open={open} onOpenChange={setOpen} title="Delete project?">
 *   <Modal.Body>This cannot be undone.</Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *     <Button onClick={remove}>Delete</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 */
export const Modal = Object.assign(ModalRoot, {
  Header: parts.Header,
  Body: parts.Body,
  Footer: parts.Footer,
  Title: parts.Title,
  CloseButton: parts.CloseButton,
})

export type {
  DialogCloseButtonProps as ModalCloseButtonProps,
  DialogFocusRef as ModalFocusRef,
  DialogSlotProps as ModalSlotProps,
  DialogTitleProps as ModalTitleProps,
}
