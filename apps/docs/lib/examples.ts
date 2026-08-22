/**
 * Hand-written examples per component.
 *
 * Props tables are generated; examples are not, and should not be — a generated example
 * is a render of the default props, which teaches nothing. These are realistic uses.
 *
 * `name` keys into the preview module for the same slug, so the rendered preview and the
 * shown code cannot drift: if a preview is missing, the page says so rather than showing
 * code beside an empty box.
 *
 * The sets are split by domain purely for file size. This module is the only entry point;
 * a slug appearing in two sets is a bug the coverage check below catches.
 */

import { FORM_EXAMPLES } from './example-sets/forms'
import { LAYOUT_EXAMPLES } from './example-sets/layout'
import { OVERLAY_EXAMPLES } from './example-sets/overlays'
import { SECTION_EXAMPLES } from './example-sets/sections'
import { TYPOGRAPHY_EXAMPLES } from './example-sets/typography'
import type { Example, ExampleSet } from './example-types'

export type { Example }

const CORE_EXAMPLES: ExampleSet = {
  button: [
    {
      title: 'Variants',
      description: 'Four variants, mapped to a data attribute rather than a class-name string.',
      name: 'variants',
      code: `<Button>Solid</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
    },
    {
      title: 'Sizes and full width',
      name: 'sizes',
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button fullWidth>Full width</Button>`,
    },
    {
      title: 'Loading',
      description:
        'loading also disables the button, so a submit cannot fire twice while a request is in flight.',
      name: 'loading',
      code: `<Button loading>Saving changes</Button>
<Button loading variant="outline">Loading</Button>
<Button disabled>Disabled</Button>`,
    },
    {
      title: 'As a link',
      description:
        'asChild renders your element instead of a <button>. A link that looks like a button must be an anchor — otherwise middle-click, cmd-click and "open in new tab" all break, and a screen reader announces the wrong role.',
      name: 'asChild',
      code: `import Link from 'next/link'

<Button asChild>
  <Link href="/docs/installation">Get started</Link>
</Button>`,
    },
    {
      title: 'Overriding styles',
      description:
        'Every library selector is wrapped in :where(), which has specificity zero — so one flat class of your own wins, with no !important.',
      name: 'override',
      code: `/* your stylesheet */
.my-cta { background: #db2777; border-radius: 999px; }

<Button className="my-cta">Beats the library</Button>`,
    },
  ],

  'icon-button': [
    {
      title: 'Sizes and states',
      description:
        'aria-label is required at the type level, not by convention. An icon-only control has no text for a screen reader to announce, so the type system refuses it rather than leaving it to code review.',
      name: 'sizes',
      code: `<IconButton size="sm" aria-label="Add item"><PlusIcon /></IconButton>
<IconButton size="md" aria-label="Add item"><PlusIcon /></IconButton>
<IconButton size="lg" aria-label="Add item"><PlusIcon /></IconButton>
<IconButton loading aria-label="Adding item"><PlusIcon /></IconButton>
<IconButton disabled aria-label="Add item"><PlusIcon /></IconButton>`,
    },
    {
      title: 'Variants',
      description: 'round swaps the rounded rectangle for a circle.',
      name: 'variants',
      code: `<IconButton aria-label="Add item"><PlusIcon /></IconButton>
<IconButton variant="outline" aria-label="Add item"><PlusIcon /></IconButton>
<IconButton variant="ghost" aria-label="Add item"><PlusIcon /></IconButton>
<IconButton round variant="outline" aria-label="Add item"><PlusIcon /></IconButton>`,
    },
  ],

  card: [
    {
      title: 'Compound parts',
      description: 'Card.Header, Card.Body and Card.Footer, so structure comes from markup.',
      name: 'basic',
      code: `<Card variant="elevated" padding="lg">
  <Card.Header>
    <Badge tone="success" pill>Most popular</Badge>
    <Heading level={3}>Pro</Heading>
  </Card.Header>
  <Card.Body>
    <Text tone="muted">Everything you need to ship.</Text>
  </Card.Body>
  <Card.Footer>
    <Button fullWidth>Choose Pro</Button>
  </Card.Footer>
</Card>`,
    },
    {
      title: 'Variants',
      name: 'variants',
      code: `<Card variant="outline">Outline</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="ghost">Ghost</Card>`,
    },
  ],

  alert: [
    {
      title: 'Tones',
      description:
        'danger and warning use role="alert" so a screen reader interrupts; info and success use role="status", which waits for a pause rather than talking over the user.',
      name: 'tones',
      code: `<Alert tone="info" title="Heads up">Deploys take about a minute.</Alert>
<Alert tone="success" title="Saved">Your changes are live.</Alert>
<Alert tone="warning" title="Check this">Your trial ends tomorrow.</Alert>
<Alert tone="danger" title="Payment failed">Try another card.</Alert>`,
    },
  ],

  badge: [
    {
      title: 'Tones and variants',
      name: 'tones',
      code: `<Badge tone="primary">Primary</Badge>
<Badge tone="success" variant="solid">Live</Badge>
<Badge tone="warning" variant="outline">Beta</Badge>
<Badge tone="danger" pill>Deprecated</Badge>`,
    },
  ],

  field: [
    {
      title: 'Label, hint and error',
      description:
        'Field derives every id and ARIA relationship from one place. aria-describedby points at the error when there is one and the hint when there is not, because a screen-reader user needs the reason their input was rejected, not the tip.',
      name: 'states',
      code: `<Field label="Email" help="We will never share it." required>
  <Input type="email" autoComplete="email" />
</Field>

<Field label="Email" error="That is not an email address.">
  <Input type="email" defaultValue="not-an-email" />
</Field>`,
    },
    {
      title: 'Works with any control',
      name: 'controls',
      code: `<Field label="Bio" help="Markdown is not supported.">
  <Textarea rows={3} />
</Field>

<Field label="Role">
  <Select placeholder="Choose one" options={[
    { value: 'dev', label: 'Developer' },
    { value: 'des', label: 'Designer' },
  ]} />
</Field>`,
    },
  ],

  'editable-grid': [
    {
      title: 'An editable order table',
      description:
        'Click a cell and use the arrow keys. Enter or F2 edits, typing replaces, Escape cancels. The whole grid is one tab stop, not one per cell.',
      name: 'default',
      code: `const [rows, setRows] = useState(lines)

<EditableGrid
  rows={rows}
  label="Order lines"
  getRowKey={(row) => row.id}
  columns={[
    { key: 'sku', header: 'SKU', width: '7rem' },
    { key: 'product', header: 'Product', editable: true },
    {
      key: 'qty',
      header: 'Qty',
      editable: true,
      numeric: true,
      // Returning undefined rejects the edit - that is the whole validation API.
      parse: (input) => (Number(input) >= 0 ? Number(input) : undefined),
    },
    {
      key: 'price',
      header: 'Unit price',
      editable: true,
      numeric: true,
      // Displays formatted, edits raw. Conflating the two corrupts the value.
      render: (row) => money(row.price),
      format: (row) => String(row.price),
      parse: (input) => Number(input.replace(/[^0-9.]/g, '')),
    },
  ]}
  // Nothing is mutated for you: the grid reports, your state decides.
  onCellChange={({ rowIndex, columnKey, value }) =>
    setRows((rows) =>
      rows.map((row, i) => (i === rowIndex ? { ...row, [columnKey]: value } : row)),
    )
  }
/>\``,
    },
    {
      title: 'Read only',
      description: 'readOnly overrides the columns, for a permissions-gated view.',
      name: 'readOnly',
      code: `<EditableGrid rows={rows} columns={columns} label="Order lines" readOnly />`,
    },
  ],

  image: [
    {
      title: 'Ratios and shapes',
      description:
        'ratio reserves the box before the file arrives, which is what stops the page jumping as images load.',
      name: 'default',
      code: `<Image src="/hero.jpg" alt="A wide landscape" ratio={16 / 9} />
<Image src="/team.jpg" alt="The team" ratio={1} />
<Image src="/avatar.jpg" alt="Vivek" ratio={1} rounded="full" />`,
    },
    {
      title: 'When the image fails',
      description:
        'A dead URL renders the fallback rather than the browser broken-image icon, and the alt text stays reachable.',
      name: 'failure',
      code: `<Image
  src="/missing.jpg"
  alt="A photograph of the Bengaluru office"
  ratio={4 / 3}
  fallback="Image unavailable"
/>`,
    },
    {
      title: 'With a caption',
      description: 'A caption renders a real figure and figcaption.',
      name: 'caption',
      code: `<Image
  src="/artwork.jpg"
  alt="Abstract gradient artwork"
  ratio={16 / 9}
  caption="Photo: Vivek Kumar Singh"
/>`,
    },
  ],

  newsletter: [
    {
      title: 'Inline signup',
      description:
        'Return a promise and the button stays busy until it settles, so a slow signup cannot be submitted twice. The result is announced in a live region.',
      name: 'default',
      code: `<Newsletter
  title="Stay in the loop"
  description="New components, release notes, and the occasional deep dive."
  note="No spam. Unsubscribe any time."
  onSubscribe={async (email) => {
    await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
  }}
/>`,
    },
    {
      title: 'Stacked, for a sidebar',
      name: 'stacked',
      code: `<Newsletter layout="stacked" title="Product updates" onSubscribe={subscribe} />`,
    },
  ],

  'map-embed': [
    {
      title: 'OpenStreetMap',
      description:
        'The default provider. It sets no cookies and runs no analytics, so it loads immediately with nothing to consent to.',
      name: 'default',
      code: `<MapEmbed lat={12.9716} lon={77.5946} zoom={13} title="Our Bengaluru office" />`,
    },
    {
      title: 'Google, behind a consent gate',
      description:
        'A Google Maps iframe contacts Google and sets cookies the moment it renders — before the visitor has agreed to anything. It is gated by default.',
      name: 'google',
      code: `<MapEmbed provider="google" query="Bengaluru, India" title="Our Bengaluru office" />

// Once your consent banner has already handled it:
<MapEmbed provider="google" query="Bengaluru, India" title="Office" requireConsent={false} />`,
    },
  ],

  'virtual-list': [
    {
      title: 'Fifty thousand rows',
      description:
        'Only the visible rows exist in the DOM. onRangeChange reports the window, which is also the hook for loading more data as the user scrolls.',
      name: 'default',
      code: `const rows = useMemo(
  () => Array.from({ length: 50_000 }, (_, i) => ({ id: i, name: \`Customer \${i}\` })),
  [],
)

<VirtualList
  items={rows}
  itemHeight={56}
  getKey={(row) => row.id}
  label="All customers"
  onRangeChange={({ start, end }) => console.log(start, end)}
  style={{ height: '20rem' }}
>
  {(row) => <div>{row.name}</div>}
</VirtualList>`,
    },
    {
      title: 'Variable row heights',
      description:
        'Pass a function instead of a number and it becomes an estimate. Rows are measured as they render and the estimate is replaced, so nothing has to be computed up front.',
      name: 'variable',
      code: `<VirtualList
  items={rows}
  // An estimate, corrected by measurement once the row renders.
  itemHeight={(index) => (index % 3 === 0 ? 88 : 52)}
  getKey={(row) => row.id}
  label="Customers"
  style={{ height: '20rem' }}
>
  {(row, index) => (
    <div>
      <Text weight="medium">{row.name}</Text>
      {index % 3 === 0 ? <Text size="sm" tone="muted">{row.email}</Text> : null}
    </div>
  )}
</VirtualList>`,
    },
  ],

  tabs: [
    {
      title: 'Automatic vs manual activation',
      description:
        'automatic selects a tab as arrow keys move focus; manual moves focus only and waits for Enter or Space. Both are in the ARIA spec, and which one is right depends on how expensive showing a panel is.',
      name: 'basic',
      code: `<Tabs defaultValue="account">
  <Tabs.List>
    <Tabs.Tab value="account">Account</Tabs.Tab>
    <Tabs.Tab value="billing">Billing</Tabs.Tab>
    <Tabs.Tab value="team" disabled>Team</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel value="account">Account settings.</Tabs.Panel>
    <Tabs.Panel value="billing">Billing settings.</Tabs.Panel>
    <Tabs.Panel value="team">Team settings.</Tabs.Panel>
  </Tabs.Panels>
</Tabs>`,
    },
  ],

  modal: [
    {
      title: 'Focus, scroll lock and inert',
      description:
        'Opening traps focus, locks body scroll without layout shift, makes the rest of the page inert, and returns focus to the trigger on close.',
      name: 'basic',
      code: `const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Open dialog</Button>

<Modal open={open} onOpenChange={setOpen} title="Delete project">
  <Modal.Body>This cannot be undone.</Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={() => setOpen(false)}>Delete</Button>
  </Modal.Footer>
</Modal>`,
    },
  ],

  'data-table': [
    {
      title: 'Sort, search, paginate, select',
      description:
        'render and sortAccessor mean raw API rows go straight in — nested objects and nulls included — with no pre-transform.',
      name: 'basic',
      code: `interface Row { id: string; name: string; team: { name: string } | null; joined: string }

<DataTable
  data={users}
  rowKey="id"
  pageSize={5}
  searchable
  selectable
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'team',
      header: 'Team',
      render: (row: Row) => row.team?.name ?? '—',
      sortAccessor: (row: Row) => row.team?.name ?? '',
      sortable: true,
    },
    { key: 'joined', header: 'Joined', align: 'end', sortable: true },
  ]}
  caption="Team members"
/>`,
    },
  ],

  'line-chart': [
    {
      title: 'A line chart with no chart library',
      description:
        'Pure SVG. It renders a real <table> fallback so screen-reader users get the numbers, and encodes each series by dash pattern and marker shape as well as colour.',
      name: 'basic',
      code: `import { LineChart } from '@the_viveksingh/vivek-ui/charts'
import '@the_viveksingh/vivek-ui/charts.css'

<LineChart
  data={[
    { x: 'Jan', y: 1200 },
    { x: 'Feb', y: 2600 },
    { x: 'Mar', y: 2450 },
    { x: 'Apr', y: 3800 },
  ]}
  title="Revenue"
  height={240}
  showGrid
/>`,
    },
  ],
}

const EXAMPLES: ExampleSet = {
  ...CORE_EXAMPLES,
  ...LAYOUT_EXAMPLES,
  ...TYPOGRAPHY_EXAMPLES,
  ...FORM_EXAMPLES,
  ...OVERLAY_EXAMPLES,
  ...SECTION_EXAMPLES,
}

export function examplesFor(slug: string): Example[] {
  return EXAMPLES[slug] ?? []
}

/** Slugs that have at least one hand-written example, for the coverage report. */
export const documentedSlugs = Object.keys(EXAMPLES)
