'use client'

import { Field, NumberInput, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function NumberInputPreview({ name }: { name: string }) {
  const [qty, setQty] = useState<number | null>(2)

  if (name === 'sizes') {
    return (
      <Stack gap={3}>
        <Field label="Small">
          <NumberInput defaultValue={1} size="sm" />
        </Field>
        <Field label="Medium">
          <NumberInput defaultValue={1} size="md" />
        </Field>
        <Field label="Large">
          <NumberInput defaultValue={1} size="lg" />
        </Field>
      </Stack>
    )
  }

  return (
    <Stack gap={4}>
      <Field
        help="Arrows step, Shift+arrow steps by 10, Home/End jump to the bounds. Scrolling the page never changes it."
        label="Seats"
      >
        <NumberInput max={50} min={1} onValueChange={setQty} value={qty} />
      </Field>
      <Text size="sm" tone="muted">
        {qty === null
          ? 'Empty — the value is null, never NaN.'
          : `${qty} seat${qty === 1 ? '' : 's'} at $12 = $${qty * 12}`}
      </Text>
      <Field help="precision={2} rounds every commit; step works in decimals." label="Unit price">
        <NumberInput defaultValue={4.5} min={0} precision={2} step={0.25} />
      </Field>
    </Stack>
  )
}
