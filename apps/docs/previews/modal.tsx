'use client'

import { Button, Modal, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function ModalPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal onOpenChange={setOpen} open={open} title="Delete project">
        <Modal.Body>
          <Text>This cannot be undone. Try Escape, or clicking the backdrop.</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
