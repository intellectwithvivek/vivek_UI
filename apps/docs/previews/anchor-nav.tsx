'use client'

import { AnchorNav, Heading, Text } from '@the_viveksingh/vivek-ui'

const SECTIONS = [
  { id: 'toc-overview', label: 'Overview' },
  {
    id: 'toc-install',
    label: 'Installation',
    children: [
      { id: 'toc-install-npm', label: 'With npm' },
      { id: 'toc-install-pnpm', label: 'With pnpm' },
    ],
  },
  { id: 'toc-usage', label: 'Usage' },
  { id: 'toc-theming', label: 'Theming' },
]

const PARA =
  'Scroll this column. The list on the left follows the heading nearest the top and marks it aria-current="location". Every entry is a real hash link, so it works before JavaScript and copies as a link.'

export default function AnchorNavPreview() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(9rem, 12rem) 1fr', gap: '1.5rem' }}>
      <AnchorNav
        items={SECTIONS}
        title="On this page"
        offset={8}
        style={{ position: 'sticky', top: 0, alignSelf: 'start' }}
      />
      <div style={{ maxHeight: '18rem', overflowY: 'auto', paddingInlineEnd: '0.5rem' }}>
        {SECTIONS.flatMap((s) => [s, ...(s.children ?? [])]).map((section) => (
          <section key={section.id} style={{ paddingBlockEnd: '1.5rem' }}>
            <Heading level={3} size="sm" id={section.id}>
              {section.label}
            </Heading>
            <Text size="sm" tone="muted">
              {PARA}
            </Text>
            <Text size="sm" tone="muted">
              {PARA}
            </Text>
          </section>
        ))}
      </div>
    </div>
  )
}
