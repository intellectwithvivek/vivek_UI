import { Alert, Code, Heading, Text } from '@the_viveksingh/vivek-ui'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { registry } from '../lib/registry'
import { CodeBlock } from './code-block'

/**
 * The concept guides.
 *
 * One renderer rather than eight near-identical page files: the pages differ only in
 * content, and duplicating a layout eight times is how they drift apart.
 */
const SERVER_SAFE = registry.components.filter((entry) => !entry.isClient).length

export interface Guide {
  title: string
  summary: ReactNode
  /**
   * The meta description for this page. Required, and deliberately a plain string.
   *
   * `summary` is a ReactNode for rendering and cannot be used here, which is how these
   * pages ended up with `description: undefined` - and, because the root layout declares a
   * canonical, they also inherited a canonical pointing at the HOMEPAGE. Fourteen pages were
   * telling Google they were duplicates of `/`, which is an instruction not to index them.
   *
   * Aim for 140-158 characters: Google truncates a search snippet around 160, and a
   * description that gets cut mid-sentence wastes the only copy you control in the result.
   */
  description: string
  body: ReactNode
}

const P = '@the_viveksingh/vivek-ui'

/*
 * `satisfies` rather than a `Record<string, Guide>` annotation: it still checks every
 * entry against `Guide`, but keeps the keys literal, so `GUIDES.accessibility` is provably
 * defined instead of `Guide | undefined` at every call site.
 */
export const GUIDES = {
  'quick-start': {
    title: 'Quick start',
    description:
      'Build a real React landing page from imports alone - Hero, FeatureGrid, Pricing, CTA and Footer - with one npm install, one CSS import and no configuration.',
    summary: 'A real page, from imports alone.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            A landing page in one file
          </Heading>
          <Text tone="muted">
            Sections are the differentiator: primitives are everywhere, but assembling a landing
            page usually means hand-writing the pricing table. Here it is a component.
          </Text>
          <CodeBlock
            code={`import { Hero, FeatureGrid, Pricing, CTA, Footer, Button } from '${P}'

export default function Page() {
  return (
    <>
      <Hero
        title="Ship your website in a weekend"
        description="Every section you need, one npm install away."
        actions={<Button size="lg">Start free</Button>}
      />
      <FeatureGrid
        features={[
          { id: 'a', title: 'Fast', description: 'No runtime dependencies.' },
          { id: 'b', title: 'Accessible', description: 'Tested with axe.' },
        ]}
      />
      <Pricing
        plans={[
          { id: 'free', name: 'Free', price: '$0', features: ['1 project'] },
          { id: 'pro', name: 'Pro', price: '$9', features: ['Unlimited'], highlighted: true },
        ]}
      />
      <CTA title="Get started" actions={<Button size="lg">Install</Button>} />
      <Footer copyright="2026" />
    </>
  )
}`}
          />
          <Text tone="muted">
            No <Code>'use client'</Code> anywhere in that file. It is a Server Component.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            A form that wires its own ARIA
          </Heading>
          <CodeBlock
            code={`import { Field, Input, Button } from '${P}'

<form>
  <Field label="Email" help="We will never share it." required>
    <Input type="email" autoComplete="email" />
  </Field>
  <Button type="submit">Sign up</Button>
</form>`}
          />
          <Text tone="muted">
            <Code>Field</Code> generates the id, wires <Code>htmlFor</Code>, sets{' '}
            <Code>required</Code> and <Code>aria-invalid</Code>, and points{' '}
            <Code>aria-describedby</Code> at the hint. Pass <Code>error</Code> and it repoints at
            the error instead.
          </Text>
        </section>
      </>
    ),
  },

  styling: {
    title: 'Overriding styles',
    description:
      'Override any VivekUI style with a single plain CSS class. Every selector is wrapped in :where(), so it has zero specificity and never needs !important.',
    summary: 'Why your CSS always wins, without !important.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            Zero specificity
          </Heading>
          <Text tone="muted">
            Every library selector is wrapped in <Code>:where()</Code>, which has specificity{' '}
            <strong>zero</strong>. So a single flat class of your own outranks it.
          </Text>
          <CodeBlock
            code={`/* the library ships this */
:where(.vk-button[data-variant="solid"]) { background: var(--vk-color-primary); }

/* yours wins, with one class and no !important */
.my-cta { background: #db2777; }`}
            plain
            filename="css"
          />
          <CodeBlock code={`<Button className="my-cta">Beats the library</Button>`} />
        </section>
        <section>
          <Heading level={2} size="lg">
            className and style are merged
          </Heading>
          <Text tone="muted">
            Never replaced. Every component keeps its own classes and adds yours, and forwards its
            ref to the root DOM node.
          </Text>
          <CodeBlock
            code={`<Button className="mine" style={{ marginTop: 8 }} />
// renders: class="vk-button mine" style="margin-top: 8px"`}
          />
        </section>
        <section>
          <Heading level={2} size="lg">
            Variants are data attributes
          </Heading>
          <Text tone="muted">
            There is no class-name concatenation to reverse-engineer. Target the attribute.
          </Text>
          <CodeBlock
            code={`.vk-button[data-variant="outline"][data-size="lg"] { letter-spacing: 0.02em; }`}
            plain
            filename="css"
          />
        </section>
        <section>
          <Alert icon={null} tone="warning">
            <Text size="sm">
              <Code>vk-</Code> class names and <Code>--vk-</Code> custom properties are public API.
              Renaming one is a major version bump.
            </Text>
          </Alert>
        </section>
      </>
    ),
  },

  responsive: {
    title: 'Responsive',
    description:
      'Build responsive React layouts with container queries, not viewport breakpoints, so each component adapts to the space it is given rather than the screen.',
    summary: 'Container queries, so components respond to their own width.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            Grids reflow with no props
          </Heading>
          <CodeBlock
            code={`<Grid />                                   {/* auto-fits at every width */}
<Grid minItemWidth="20rem" />              {/* auto-fit with a floor */}
<Grid cols={{ base: 1, md: 2, xl: 4 }} />  {/* explicit, when you want it */}`}
          />
          <Text tone="muted">
            Responsive <Code>cols</Code> compile to CSS custom properties that a static stylesheet
            reads inside fixed breakpoints. No runtime style computation, no CSS generated at
            render, and identical output on server and client.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Container queries, not viewport queries
          </Heading>
          <Text tone="muted">
            Sections and cards declare <Code>container-type: inline-size</Code>, so they respond to
            the space they actually occupy. A card grid inside a narrow sidebar stacks exactly as it
            would on a phone, even on a 27-inch display. That is something a viewport-media-query
            library structurally cannot do.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Breakpoints
          </Heading>
          <Text tone="muted">
            Fixed build-time constants, because CSS cannot read a custom property inside a media
            condition: <Code>sm 640</Code>, <Code>md 768</Code>, <Code>lg 1024</Code>,{' '}
            <Code>xl 1280</Code>.
          </Text>
        </section>
      </>
    ),
  },

  'data-mapping': {
    title: 'Feeding it your data',
    description:
      'Map API responses straight into VivekUI tables, charts and lists. Render props, accessors and typed columns mean raw JSON goes in without a transform step.',
    summary: 'Every data-driven component takes plain objects.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            Two tiers
          </Heading>
          <Text tone="muted">
            <Code>DataTable</Code> and the charts need <strong>no pre-transform</strong> —{' '}
            <Code>render</Code> and <Code>sortAccessor</Code> handle nested objects and nulls in
            place. Everything else is a one-line <Code>.map()</Code>.
          </Text>
          <CodeBlock
            code={`// No transform: raw snake_case rows with a nested object and a null
<DataTable
  data={users}
  rowKey="user_id"
  columns={[
    { key: 'full_name', header: 'Name', sortable: true },
    {
      key: 'team',
      header: 'Team',
      render: (row) => row.team?.name ?? '-',
      sortAccessor: (row) => row.team?.name ?? '',
    },
  ]}
/>

// One line for a section
<FeatureGrid features={api.capabilities.map((c) => ({
  id: c.id, title: c.headline, description: c.blurb,
}))} />`}
          />
        </section>
        <section>
          <Heading level={2} size="lg">
            Which prop takes the array
          </Heading>
          <Text tone="muted">
            The name is domain-specific per component, so here is the lookup: <Code>data</Code> for
            charts and <Code>DataTable</Code>; <Code>items</Code> for <Code>FAQ</Code>,{' '}
            <Code>Stats</Code>, <Code>Testimonials</Code>, <Code>Breadcrumb</Code> and{' '}
            <Code>CommandPalette</Code>; <Code>options</Code> for <Code>Select</Code>,{' '}
            <Code>RadioGroup</Code> and <Code>Combobox</Code>; <Code>columns</Code> for{' '}
            <Code>DataTable</Code> (table columns) and <Code>Footer</Code> (link groups); and{' '}
            <Code>features</Code>, <Code>plans</Code>, <Code>logos</Code>, <Code>messages</Code>,{' '}
            <Code>steps</Code> for the components named after them.
          </Text>
        </section>
        <section>
          <Alert title="Pass id on dynamic data" tone="warning">
            <Text size="sm">
              List items fall back to keying on a content field. Real API data contains two reviews
              by the same author or two metrics labelled "Users", and duplicate keys make React
              mis-attach state across a reorder. Pass <Code>id</Code> and it cannot happen.
            </Text>
          </Alert>
        </section>
      </>
    ),
  },

  'server-components': {
    title: 'Server Components',
    // Derived: both halves of this sentence went stale silently once before.
    description: `Use React Server Components with VivekUI: ${SERVER_SAFE} of ${registry.components.length} components render on the server with no client boundary, and the rest carry their own use client directive.`,
    summary: 'Most of the library needs no client boundary.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            Server safe by default
          </Heading>
          <Text tone="muted">
            A component only declares <Code>'use client'</Code> when it genuinely needs state,
            effects or event handlers. Every component page in these docs shows which it is, and the
            badge is read from the actual directive in the source, not written by hand.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Why the build is unbundled
          </Heading>
          <Text tone="muted">
            Bundlers strip or hoist directives when they merge modules, which would silently turn a
            client component into a server one. The library therefore compiles per file, so each
            emitted file keeps its own directive, and CI asserts on every build that they survive in
            both the ESM and CJS output.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Nothing touches the DOM at module scope
          </Heading>
          <Text tone="muted">
            No <Code>window</Code> or <Code>document</Code> access outside an effect or handler, so
            the SSR pass cannot crash. <Code>Portal</Code> renders nothing until it has mounted,
            which is what makes overlays safe to import from a server file.
          </Text>
        </section>
        <section>
          <Alert icon={null} tone="info">
            <Text size="sm">
              This documentation site is the proof: its landing page and most of these pages are
              Server Components rendering library components directly.
            </Text>
          </Alert>
        </section>
      </>
    ),
  },

  accessibility: {
    title: 'Accessibility',
    description:
      'How VivekUI meets WCAG 2.1 AA: automated axe assertions on every component, WAI-ARIA keyboard maps, and a colour palette verified by measurement, not by eye.',
    summary: 'What is guaranteed, and what is not.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            The API makes the accessible thing the default
          </Heading>
          <Text tone="muted">
            <Code>IconButton</Code> requires <Code>aria-label</Code> at the type level, so an
            icon-only control cannot ship nameless. <Code>Alert</Code> and <Code>Toast</Code> pick{' '}
            <Code>role="alert"</Code> for urgent tones and <Code>role="status"</Code> for the rest,
            so they do not talk over the user. <Code>RadioGroup</Code> is a real{' '}
            <Code>&lt;fieldset&gt;</Code> with a <Code>&lt;legend&gt;</Code>, which names the group
            with no ARIA at all. <Code>Divider</Code> is a real <Code>&lt;hr&gt;</Code> unless
            labelled, and <Code>FAQ</Code> is native <Code>&lt;details&gt;</Code> — no ARIA, no
            JavaScript.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Overlays
          </Heading>
          <Text tone="muted">
            <Code>Modal</Code> and <Code>Drawer</Code> trap focus, lock body scroll without layout
            shift, make the rest of the page <Code>inert</Code>, and return focus to the trigger.{' '}
            <Code>Combobox</Code> and <Code>CommandPalette</Code> move the active option with{' '}
            <Code>aria-activedescendant</Code> while DOM focus stays in the input, which is the
            pattern the ARIA spec actually prescribes.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            How it is verified
          </Heading>
          <Text tone="muted">
            Every component has automated <Code>axe</Code> assertions in its test suite, and the
            keyboard maps are covered by tests rather than described in prose.
          </Text>
        </section>
        <section>
          <Alert title="One honest gap" tone="warning">
            <Text size="sm">
              Colour contrast is <strong>reasoned, not machine-verified</strong>. The axe contrast
              rule cannot run without a real browser, so every "axe clean" claim covers structure
              and ARIA but not contrast. A Playwright pass is on the roadmap.
            </Text>
          </Alert>
        </section>
      </>
    ),
  },

  security: {
    title: 'Security',
    description:
      'Security in VivekUI: unsafe href blocking, no dangerouslySetInnerHTML, zero runtime dependencies to audit, and provenance-attested npm releases via OIDC.',
    summary: 'What the library refuses to do, and what it checks.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            No HTML injection surface
          </Heading>
          <Text tone="muted">
            There is no <Code>dangerouslySetInnerHTML</Code>, <Code>innerHTML</Code> or{' '}
            <Code>eval</Code> anywhere in the library. <Code>Prose</Code> styles markup you already
            rendered and deliberately does not parse strings, so model or CMS output cannot become
            HTML.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Link hrefs are scheme-validated
          </Heading>
          <Text tone="muted">
            React 18 renders a <Code>javascript:</Code> URL verbatim — only React 19 blocks it — and
            React 18 is inside the supported peer range. A footer built from a CMS collection would
            otherwise be a stored-XSS vector, so <Code>Footer</Code>, <Code>Navbar</Code>,{' '}
            <Code>Breadcrumb</Code>, <Code>Sidebar</Code> and <Code>Prose</Code> validate the scheme
            and drop anything unsafe. A <Code>target="_blank"</Code> link automatically gets{' '}
            <Code>rel="noopener noreferrer"</Code>.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            CSV export cannot execute
          </Heading>
          <Text tone="muted">
            <Code>toCsv</Code> neutralises a cell beginning <Code>=</Code>, <Code>+</Code>,{' '}
            <Code>-</Code>, <Code>@</Code>, tab or carriage return before quoting, so a spreadsheet
            export cannot run code on your user's machine. Real numbers are exempt, so{' '}
            <Code>-5</Code> stays a number while the string <Code>"-5"</Code> is guarded.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Content Security Policy
          </Heading>
          <Text tone="muted">
            The library needs no <Code>script-src</Code> allowance. Responsive props are inline{' '}
            <Code>style</Code> attributes carrying custom properties, so a strict{' '}
            <Code>style-src</Code> needs a nonce or hash strategy. If you inline{' '}
            <Code>themeScript</Code>, give that script tag a nonce.
          </Text>
        </section>
      </>
    ),
  },

  typescript: {
    title: 'TypeScript',
    description:
      'Full TypeScript support: every component exports its Props interface, discriminated unions reject invalid prop combos, and types resolve in all four modes.',
    summary: 'Generics, discriminated unions, and module resolution.',
    body: (
      <>
        <section>
          <Heading level={2} size="lg">
            Generic components
          </Heading>
          <Text tone="muted">
            <Code>DataTable</Code> is generic over your row type, so a wrong <Code>key</Code> is a
            compile error rather than an empty column.
          </Text>
          <CodeBlock
            code={`import { DataTable, type Column } from '${P}'

interface Row { id: string; name: string }

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  // { key: 'nmae', ... }  <- a typo here fails to compile
]

<DataTable data={rows} rowKey="id" columns={columns} />`}
          />
        </section>
        <section>
          <Heading level={2} size="lg">
            Discriminated unions
          </Heading>
          <Text tone="muted">
            Six components take a union rather than one interface, so impossible prop combinations
            do not typecheck: <Code>Slider</Code> is single or range, <Code>Calendar</Code> and{' '}
            <Code>Combobox</Code> single or multiple, <Code>Accordion</Code> single or multiple.
            Their props tables show one section per branch for exactly that reason.
          </Text>
          <CodeBlock
            code={`<Slider defaultValue={40} onValueChange={(n: number) => {}} />
<Slider range defaultValue={[20, 60]} onValueChange={(r: [number, number]) => {}} />`}
          />
        </section>
        <section>
          <Heading level={2} size="lg">
            Module resolution
          </Heading>
          <Text tone="muted">
            Verified on every release under <Code>bundler</Code>, <Code>node16</Code> and legacy{' '}
            <Code>node</Code>, in both ESM and CJS. The <Code>./charts</Code> subpath resolves under
            legacy <Code>node</Code> too, via <Code>typesVersions</Code>.
          </Text>
        </section>
        <section>
          <Heading level={2} size="lg">
            Prop types are exported
          </Heading>
          <Text tone="muted">
            Every component exports its props interface, so you can extend or reuse it.
          </Text>
          <CodeBlock
            code={`import { Button, type ButtonProps } from '${P}'

interface TrackedProps extends ButtonProps { event: string }

export function Tracked({ event, ...rest }: TrackedProps) {
  return <Button {...rest} onClick={() => track(event)} />
}`}
          />
        </section>
      </>
    ),
  },
} satisfies Record<string, Guide>

export type GuideSlug = keyof typeof GUIDES

export function GuideBody({ slug }: { slug: GuideSlug }) {
  const guide = GUIDES[slug]
  if (!guide) return null
  return (
    <>
      <header className="doc-header">
        <Heading level={1}>{guide.title}</Heading>
        <Text size="lg">{guide.summary}</Text>
      </header>
      {guide.body}
      <section>
        <Text tone="muted">
          <Link href="/docs">Back to the introduction</Link>
        </Text>
      </section>
    </>
  )
}
