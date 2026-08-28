'use client'

import { Input, QRCode, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function QRCodePreview() {
  const [value, setValue] = useState('https://vivek-ui.dev')

  return (
    <Stack gap={4}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <QRCode value={value} size={168} label={`QR code for ${value}`} />
        <QRCode
          value={value}
          size={168}
          level="H"
          moduleShape="round"
          fg="#1d4ed8"
          image={{ src: '/branding/vivek-ui-logo.png', size: 0.22 }}
          label={`Branded QR code for ${value}`}
        />
      </div>
      <Stack gap={1} style={{ maxWidth: '28rem' }}>
        <Input
          aria-label="Text to encode"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Text size="sm" tone="muted">
          Rendered as SVG from an in-house encoder — no dependency, no canvas. The right one uses
          level H so the logo can cover a fifth of it and still scan.
        </Text>
      </Stack>
    </Stack>
  )
}
