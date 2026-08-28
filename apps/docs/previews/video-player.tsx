'use client'

import { Stack, Text, VideoPlayer } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function VideoPlayerPreview() {
  const [status, setStatus] = useState('Paused')

  return (
    <Stack gap={3}>
      <VideoPlayer
        label="Flower, a sample clip"
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        poster="https://interactive-examples.mdn.mozilla.net/media/examples/flower-poster.jpg"
        style={{ maxWidth: '40rem' }}
        onPlayingChange={(playing) => setStatus(playing ? 'Playing' : 'Paused')}
        onEnded={() => setStatus('Ended')}
      />
      <Text size="sm" tone="muted">
        {status}. Space or K plays, arrows seek and change volume, M mutes, F goes fullscreen.
        Controls fade while the pointer rests and return on any key or focus.
      </Text>
    </Stack>
  )
}
