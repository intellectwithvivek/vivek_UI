import {
  Alert,
  Heading,
  Tabs,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { CodeBlock } from '../../../components/code-block'
import { PACKAGE_NAME } from '../../../lib/registry'

export const metadata: Metadata = {
  title: 'Installation',
  description: 'Install, import the stylesheet once, and start using components.',
}

/*
 * Note the named part imports — `TabsList` rather than `Tabs.List`.
 *
 * `Tabs` is a client component, so a Server Component receives it as a client reference,
 * and reading `.List` off that reference gives `undefined`. Building this page is what
 * surfaced it; the library now exports every client compound's parts individually.
 */
export default function InstallationPage() {
  return (
    <>
      <header className="doc-header">
        <Heading level={1}>Installation</Heading>
        <Text size="lg">Two steps. There is no third.</Text>
      </header>

      <section>
        <Heading level={2} size="lg">
          1. Install
        </Heading>
        <Tabs defaultValue="npm">
          <TabsList>
            <TabsTab value="npm">npm</TabsTab>
            <TabsTab value="pnpm">pnpm</TabsTab>
            <TabsTab value="yarn">yarn</TabsTab>
            <TabsTab value="bun">bun</TabsTab>
          </TabsList>
          <TabsPanels>
            <TabsPanel value="npm">
              <CodeBlock code={`npm install ${PACKAGE_NAME}`} filename="terminal" plain />
            </TabsPanel>
            <TabsPanel value="pnpm">
              <CodeBlock code={`pnpm add ${PACKAGE_NAME}`} filename="terminal" plain />
            </TabsPanel>
            <TabsPanel value="yarn">
              <CodeBlock code={`yarn add ${PACKAGE_NAME}`} filename="terminal" plain />
            </TabsPanel>
            <TabsPanel value="bun">
              <CodeBlock code={`bun add ${PACKAGE_NAME}`} filename="terminal" plain />
            </TabsPanel>
          </TabsPanels>
        </Tabs>
        <Text tone="muted">
          React 18 or 19 is a peer dependency. Nothing else is installed, because the package has no
          runtime dependencies of its own. Confirm it yourself with{' '}
          <code>npm ls --omit=dev {PACKAGE_NAME}</code>.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          2. Import the stylesheet once
        </Heading>
        <Tabs defaultValue="app">
          <TabsList>
            <TabsTab value="app">Next.js App Router</TabsTab>
            <TabsTab value="pages">Next.js Pages Router</TabsTab>
            <TabsTab value="vite">Vite / CRA</TabsTab>
          </TabsList>
          <TabsPanels>
            <TabsPanel value="app">
              <CodeBlock
                code={`import '${PACKAGE_NAME}/styles.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`}
                filename="app/layout.tsx"
              />
            </TabsPanel>
            <TabsPanel value="pages">
              <CodeBlock
                code={`import '${PACKAGE_NAME}/styles.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}`}
                filename="pages/_app.tsx"
              />
            </TabsPanel>
            <TabsPanel value="vite">
              <CodeBlock
                code={`import '${PACKAGE_NAME}/styles.css'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')
if (root) createRoot(root).render(<App />)`}
                filename="src/main.tsx"
              />
            </TabsPanel>
          </TabsPanels>
        </Tabs>
      </section>

      <section>
        <Heading level={2} size="lg">
          Using charts
        </Heading>
        <Text tone="muted">
          Charts are a separate subpath with their own stylesheet, so an app that never draws one
          pays nothing for them.
        </Text>
        <CodeBlock
          code={`import { LineChart } from '${PACKAGE_NAME}/charts'
import '${PACKAGE_NAME}/charts.css'`}
        />
      </section>

      <section>
        <Heading level={2} size="lg">
          Compound components in Server Components
        </Heading>
        <Alert title="Use the named part exports on the server" tone="warning">
          <Text size="sm">
            Interactive compound components — <code>Tabs</code>, <code>Accordion</code>,{' '}
            <code>Modal</code>, <code>Drawer</code>, <code>Navbar</code>, <code>Sidebar</code> — are
            client components. From a Server Component they arrive as a client reference, and{' '}
            <code>Tabs.List</code> reads <code>undefined</code> off it. Import <code>TabsList</code>{' '}
            instead. Inside a client component either form works. Server-safe compounds like{' '}
            <code>Card</code> and <code>Table</code> are unaffected.
          </Text>
        </Alert>
        <CodeBlock
          code={`// In a Server Component
import { Tabs, TabsList, TabsTab } from '${PACKAGE_NAME}'

// In a client component, either works
import { Tabs } from '${PACKAGE_NAME}'
<Tabs.List>...</Tabs.List>`}
        />
      </section>

      <section>
        <Heading level={2} size="lg">
          That is the whole setup
        </Heading>
        <Alert icon={null} tone="success">
          <Text size="sm">
            No config file, no CLI, no Tailwind, no PostCSS plugin, no Babel plugin, and no required
            provider. If you needed a third step, that would be a bug in the library's design.
          </Text>
        </Alert>
      </section>
    </>
  )
}
