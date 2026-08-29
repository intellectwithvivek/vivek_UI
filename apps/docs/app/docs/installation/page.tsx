import {
  Alert,
  Code,
  Heading,
  Table,
  Tabs,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
  Text,
} from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import { CodeBlock } from '../../../components/code-block'
import { JsonLd } from '../../../components/json-ld'
import { pageMeta } from '../../../lib/page-meta'
import { PACKAGE_NAME } from '../../../lib/registry'
import { breadcrumbs, howTo, techArticle } from '../../../lib/structured-data'

const DESCRIPTION = `Install ${PACKAGE_NAME} with npm, pnpm or yarn, import one stylesheet at your app root, and start building. No build plugin, no Tailwind, no config.`

export const metadata: Metadata = pageMeta({
  title: 'Installation',
  description: DESCRIPTION,
  path: '/docs/installation',
  keywords: ['install vivekui', 'react component library npm install', 'vivekui getting started'],
})

/*
 * `HowTo` structured data.
 *
 * "How do I install X" is close to the most common question an answer engine gets about
 * any package, and HowTo is the schema built for it - the steps come back as an ordered
 * list rather than as a paraphrase of the page.
 */
const INSTALL_STEPS = [
  {
    name: 'Install the package',
    text: `Run npm install ${PACKAGE_NAME}. pnpm add and yarn add work identically. React 18 or 19 must already be installed, as it is a peer dependency.`,
  },
  {
    name: 'Import the stylesheet once',
    text: `Add import '${PACKAGE_NAME}/styles.css' at the root of your app - app/layout.tsx in the Next.js App Router, or main.tsx with Vite. Import it once for the whole application, not per component.`,
  },
  {
    name: 'Import charts separately, if you use them',
    text: `Charts live at ${PACKAGE_NAME}/charts with their own stylesheet at ${PACKAGE_NAME}/charts.css, so an app with no charts downloads neither.`,
  },
  {
    name: 'Use a component',
    text: `Import any component by name, for example import { Button } from '${PACKAGE_NAME}', and render it. No provider or wrapper is required.`,
  },
]

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
      <JsonLd
        data={[
          howTo({
            name: `Install ${PACKAGE_NAME} in a React app`,
            description: DESCRIPTION,
            steps: INSTALL_STEPS,
          }),
          techArticle({
            title: 'Installation',
            description: DESCRIPTION,
            path: '/docs/installation',
          }),
          breadcrumbs([
            { name: 'Docs', path: '/docs' },
            { name: 'Installation', path: '/docs/installation' },
          ]),
        ]}
      />
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
          Only the CSS you use
        </Heading>
        <Text tone="muted">
          One stylesheet is the simple answer and the right default. If you would rather ship less,
          every component also has its own file: a page built from Button, Card, Input, Navbar and
          Hero needs about 4 kB of CSS gzipped instead of 34.
        </Text>
        <CodeBlock
          code={`// Instead of the whole stylesheet…
import '${PACKAGE_NAME}/css/reset.css'
import '${PACKAGE_NAME}/css/tokens.css'
import '${PACKAGE_NAME}/css/button.css'
import '${PACKAGE_NAME}/css/card.css'
import '${PACKAGE_NAME}/css/input.css'`}
        />
        <Text size="sm" tone="muted">
          <code>reset.css</code> and <code>tokens.css</code> are the two everything else assumes;
          the rest are named after the component directory. A few components borrow another&apos;s
          look — Combobox uses the Input styles, DatePicker uses Calendar&apos;s — and say so on
          their own page. The JavaScript needs no equivalent: it already tree-shakes, so a Button
          import costs 780&nbsp;B.
        </Text>
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
          What it runs on
        </Heading>
        <Text tone="muted">
          Stated, and tested rather than assumed. The browser suite runs every route and every demo
          in Chromium at three viewports, in Firefox and in WebKit on each change; the CSS build
          targets exactly the list below, so a prefix Safari still needs is emitted rather than
          hoped for.
        </Text>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Requirement</Table.HeaderCell>
              <Table.HeaderCell>Supported</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>React</Table.Cell>
              <Table.Cell>
                18 and 19 (peer range <Code>^18 || ^19</Code>), tested on both
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Next.js</Table.Cell>
              <Table.Cell>
                App Router and Pages Router; 65 of the components are Server Components
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Node</Table.Cell>
              <Table.Cell>18 and above, tested on 18 and 20 against the built package</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Browsers</Table.Cell>
              <Table.Cell>
                The last two versions of Chrome, Edge and Firefox; Safari and iOS Safari from
                <Code>16.4</Code>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Package managers</Table.Cell>
              <Table.Cell>npm, yarn and pnpm, each installed from a real tarball in CI</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Text size="sm" tone="muted">
          Older browsers are not blocked, they are simply not tested: the library uses
          <Code>:where()</Code>, container queries, <Code>color-mix()</Code> and logical properties,
          all of which need a 2023-or-later engine.
        </Text>
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
