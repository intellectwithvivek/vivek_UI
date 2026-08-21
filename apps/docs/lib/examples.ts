/**
 * Hand-written examples per component.
 *
 * Props tables are generated; examples are not, and should not be — a generated example
 * is a render of the default props, which teaches nothing. These are realistic uses.
 *
 * `name` keys into the preview module for the same slug, so the rendered preview and the
 * shown code cannot drift: if a preview is missing, the page says so rather than showing
 * code beside an empty box.
 */
export interface Example {
  /** Section heading. */
  title: string
  /** Optional sentence of context. */
  description?: string
  /** Key into `previews/<slug>`. */
  name: string
  /** TypeScript source. The JS tab is derived from it. */
  code: string
}

const EXAMPLES: Record<string, Example[]> = {
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

export function examplesFor(slug: string): Example[] {
  return EXAMPLES[slug] ?? []
}

/** Slugs that have at least one hand-written example, for the coverage report. */
export const documentedSlugs = Object.keys(EXAMPLES)
