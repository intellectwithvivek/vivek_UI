'use client'

import { AudioPlayer, Stack } from '@the_viveksingh/vivek-ui'

export default function AudioPlayerPreview() {
  return (
    <Stack gap={4}>
      <AudioPlayer
        title="T. rex roar"
        subtitle="CC0 sample · 2 seconds"
        src="https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3"
        style={{ maxWidth: '36rem' }}
      />
      <AudioPlayer
        size="sm"
        label="Voice note"
        src="https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3"
        rates={[]}
        style={{ maxWidth: '28rem' }}
      />
    </Stack>
  )
}
