'use client'

import { Stack, Text, VideoPlayer } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function VideoPlayerPreview() {
  const [status, setStatus] = useState('Paused')

  return (
    <Stack gap={3}>
      <VideoPlayer
        label="Flower, a sample clip"
        src={[
          // MP4 first: every engine plays it. WebKit evaluates sources in order and, given a
          // format it cannot decode, holds the document's load event while it decides.
          { src: 'https://mdn.github.io/shared-assets/videos/flower.mp4', type: 'video/mp4' },
          { src: 'https://mdn.github.io/shared-assets/videos/flower.webm', type: 'video/webm' },
        ]}
        poster="/demo/video-poster.png"
        // The docs page should not fetch a megabyte of video before anyone presses play:
        // the poster carries the frame, and the media loads on demand.
        preload="none"
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
