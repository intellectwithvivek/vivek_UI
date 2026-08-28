'use client'

import { Card, Masonry, Text } from '@the_viveksingh/vivek-ui'

const NOTES: { title: string; body: string[] }[] = [
  { title: 'Zero dependencies', body: ['Nothing to audit but React.'] },
  {
    title: 'Static CSS',
    body: [
      'One stylesheet, bundled at build time.',
      'No runtime, no style tags, no flash.',
      'Cacheable like any other asset.',
      'Works before hydration.',
    ],
  },
  { title: 'Every selector in :where()', body: ['Zero specificity.', 'Your CSS always wins.'] },
  {
    title: 'Logical properties only',
    body: ['No left or right anywhere.', 'RTL is free.', 'A test enforces it.'],
  },
  { title: 'Tree-shakes', body: ['Import a Button, ship a Button.'] },
  {
    title: 'Server-safe',
    body: [
      'No window at module scope.',
      'use client only where state lives.',
      'Every client component is hydrated in the suite.',
      'Portals wait for the DOM.',
      'Measurement happens in effects.',
    ],
  },
  { title: 'Keyboard maps from the APG', body: ['Documented per component.', 'Tested per key.'] },
  {
    title: 'Tokens are the API',
    body: ['--vk-* is public.', 'Renaming one is a major bump.', 'Theme by overriding them.'],
  },
]

export default function MasonryPreview() {
  return (
    <Masonry columns={3} columnWidth={180} gap={3}>
      {NOTES.map((note) => (
        <Card key={note.title} padding="md">
          <Text weight="medium">{note.title}</Text>
          {note.body.map((line) => (
            <Text key={line} size="sm" tone="muted">
              {line}
            </Text>
          ))}
        </Card>
      ))}
    </Masonry>
  )
}
