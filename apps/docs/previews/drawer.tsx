'use client'

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Field,
  Input,
  Select,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function DrawerPreview({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const side = name === 'bottom' ? 'bottom' : 'end'

  return (
    <Stack gap={3} align="start">
      <Button onClick={() => setOpen(true)}>
        Open drawer from the {side === 'bottom' ? 'bottom' : 'right'}
      </Button>
      <Drawer open={open} onOpenChange={setOpen} side={side} size="md" title="New invoice">
        <DrawerHeader>
          <DrawerTitle>New invoice</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <Stack gap={4}>
            <Field label="Client">
              <Input placeholder="Northwind Traders" />
            </Field>
            <Field label="Amount">
              <Input type="number" placeholder="4280" />
            </Field>
            <Field label="Currency">
              <Select
                options={[
                  { value: 'inr', label: 'INR' },
                  { value: 'usd', label: 'USD' },
                  { value: 'eur', label: 'EUR' },
                ]}
              />
            </Field>
            <Text size="sm" tone="muted">
              Focus is trapped inside the panel, Escape closes it, and the page behind is marked
              inert so a screen reader cannot wander out.
            </Text>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create invoice</Button>
        </DrawerFooter>
      </Drawer>
    </Stack>
  )
}
