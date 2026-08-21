import { Alert, Heading, Text, ThemeToggle } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { CodeBlock } from '../../../components/code-block'
import { PACKAGE_NAME } from '../../../lib/registry'

export const metadata: Metadata = {
  title: 'Dark mode',
  description: 'One attribute on <html>, plus a script that prevents the flash.',
}

export default function DarkModePage() {
  return (
    <>
      <header className="doc-header">
        <Heading level={1}>Dark mode</Heading>
        <Text size="lg">
          One attribute. The CSS works with JavaScript disabled, so <code>ThemeProvider</code> is
          only needed if you want a toggle.
        </Text>
      </header>

      <section>
        <Heading level={2} size="lg">
          The minimum
        </Heading>
        <CodeBlock code={`<html data-theme="dark">`} filename="html" plain />
        <Text tone="muted">
          That is the whole mechanism. The library's tokens carry a{' '}
          <code>[data-theme=&quot;dark&quot;]</code> block, so every component follows.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          With a toggle
        </Heading>
        <div className="preview">
          <ThemeToggle mode="cycle" />
        </div>
        <CodeBlock
          code={`import { ThemeProvider, ThemeToggle } from '${PACKAGE_NAME}'

<ThemeProvider>
  <ThemeToggle mode="cycle" />
  {children}
</ThemeProvider>`}
        />
        <Text tone="muted">
          <code>mode=&quot;cycle&quot;</code> steps through light, dark and system.{' '}
          <code>mode=&quot;toggle&quot;</code> flips between light and dark only, and never reaches
          system.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          Preventing the flash
        </Heading>
        <Alert title="React cannot fix this on its own" tone="warning">
          <Text size="sm">
            The server does not know which theme the visitor chose last time, and by the time an
            effect could read <code>localStorage</code> the browser has already painted. The
            attribute has to be set synchronously, before first paint.
          </Text>
        </Alert>
        <CodeBlock
          code={`import { themeScript } from '${PACKAGE_NAME}'

<head>
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
</head>`}
          filename="app/layout.tsx"
        />
        <Text tone="muted">
          <code>themeScript</code> is a build-time constant exported by the library, not user input.
          It reads storage, resolves <code>system</code> through <code>matchMedia</code>, and sets
          the attribute, all inside a try/catch, so a browser with storage disabled quietly gets the
          default. This site uses it: switch to dark, reload, and there is no flash.
        </Text>
      </section>
    </>
  )
}
