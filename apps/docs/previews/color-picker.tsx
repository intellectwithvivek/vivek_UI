'use client'

import { ColorPicker, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const PRESETS = ['#0f766e', '#1d4ed8', '#7c3aed', '#db2777', '#ea580c', '#111827']

export default function ColorPickerPreview() {
  const [brand, setBrand] = useState('#1d4ed8')
  const [accent, setAccent] = useState('#f59e0b80')

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Stack gap={2}>
        <ColorPicker
          label="Brand colour"
          value={brand}
          onValueChange={setBrand}
          presets={PRESETS}
        />
        <Text size="sm" tone="muted">
          Hue, saturation and brightness are real sliders with spoken values; the hex field commits
          on Enter. Where the browser has an EyeDropper, a button offers it.
        </Text>
      </Stack>
      <Stack gap={2}>
        <ColorPicker
          label="Accent"
          variant="popover"
          alpha
          size="sm"
          value={accent}
          onValueChange={setAccent}
        />
        <div
          aria-hidden="true"
          style={{
            inlineSize: '12rem',
            blockSize: '3rem',
            borderRadius: 'var(--vk-radius-md)',
            background: `linear-gradient(90deg, ${brand}, ${accent})`,
          }}
        />
        <Text size="sm" tone="muted">
          The popover variant keeps the panel behind a swatch; alpha adds a slider and eight-digit
          hex.
        </Text>
      </Stack>
    </div>
  )
}
