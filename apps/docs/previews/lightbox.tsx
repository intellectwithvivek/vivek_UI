'use client'

import { Lightbox, type LightboxItem, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const PHOTOS: LightboxItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60',
    alt: 'Snow-covered mountain ridge under a pink dawn sky',
    caption: 'Dawn on the ridge',
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=60',
    alt: 'Fog drifting through a pine forest at sunrise',
    caption: 'Fog in the pines',
  },
  {
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&q=60',
    alt: 'A still lake reflecting mountains at golden hour',
    caption: 'Golden hour',
  },
]

export default function LightboxPreview() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => {
              setIndex(i)
              setOpen(true)
            }}
            aria-label={`Open ${photo.alt}`}
            style={{
              padding: 0,
              border: 0,
              borderRadius: 'var(--vk-radius-sm)',
              overflow: 'hidden',
              cursor: 'zoom-in',
              inlineSize: '7rem',
              blockSize: '5rem',
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: remote sample photos in a preview; next/image would need a configured loader. */}
            <img
              src={photo.thumbnail}
              alt=""
              style={{
                inlineSize: '100%',
                blockSize: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </button>
        ))}
      </div>
      <Text size="sm" tone="muted">
        Click a photo. Arrows or swipe move through the set, Home/End jump, Escape closes and
        returns focus to the thumbnail you came from.
      </Text>
      <Lightbox
        items={PHOTOS}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        label="Landscapes"
      />
    </div>
  )
}
