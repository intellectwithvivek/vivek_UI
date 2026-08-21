import { Container, Heading, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { PlaygroundEditor } from './playground-editor'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Edit and run any example, with every export already in scope.',
}

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
