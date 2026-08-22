import { Container, Heading, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { pageMeta } from '../../lib/page-meta'
import { PlaygroundEditor } from './playground-editor'

export const metadata: Metadata = pageMeta({
  title: 'Playground',
  description:
    'Edit and run VivekUI React components live in your browser. Every component and chart export is already in scope - no setup, no install, TypeScript supported.',
  path: '/playground',
  keywords: ['react component playground', 'try react components online', 'react ui sandbox'],
})

export default function PlaygroundPage() {
  return (
    <Container size="full" className="playground-page">
      <header className="doc-header">
        <Heading level={1}>Playground</Heading>
        <Text tone="muted">
          Every export from the library and its charts is already in scope. Edit the code and it
          renders as you type. Your draft is kept in this browser, and the URL is shareable.
        </Text>
      </header>
      <PlaygroundEditor />
    </Container>
  )
}
