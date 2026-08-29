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
      title: 'Image cards',
      description:
        'padding="none" lets an Image sit flush with the card edge; the body carries its own padding. interactive adds the hover lift and a pointer cursor. The images here are generated SVGs - no photo service, no licence question.',
      name: 'image',
      code: `<Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
  {products.map((product) => (
    <Card key={product.id} interactive padding="none" variant="outline">
      <Image src={product.image} alt={product.name} ratio={4 / 3} />
      <Card.Body style={{ padding: 'var(--vk-space-4)' }}>
        <Heading level={3} size="sm">{product.name}</Heading>
        <Text weight="medium">{product.price}</Text>
        <Button size="sm" variant="outline">Add to basket</Button>
      </Card.Body>
    </Card>
  ))}
</Grid>`,
    },
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

  'qr-code': [
    {
      title: 'A URL, the defaults that scan',
      description:
        'Black on white, a four-module quiet zone, level M with a free upgrade when the version has room. It is an image with a name - role="img" and an aria-label saying what it encodes - so a screen-reader user learns the URL instead of "graphic". SVG, so any size is crisp.',
      name: 'default',
      code: `<QRCode value="https://vivek-ui.dev/docs" size={160} />

// Give it a better name than the raw URL when there is one:
<QRCode value={ticketUrl} label="Scan to open your ticket" />`,
    },
    {
      title: 'Branded: a logo, round modules, a colour',
      description:
        'image places a logo in the centre and clears the modules beneath it - use level H so the code survives the loss. moduleShape="round" and fg change the look; keep the contrast strong and the quiet zone intact, or phones stop reading it.',
      name: 'branded',
      code: `<QRCode
  value="https://vivek-ui.dev"
  level="H"
  moduleShape="round"
  fg="#1d4ed8"
  image={{ src: '/logo.png', size: 0.22 }}
  label="Scan to open the VivekUI docs"
/>`,
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

  'infinite-scroll': [
    {
      title: 'Load as the edge approaches',
      description:
        'An IntersectionObserver sentinel fires onLoadMore 256px before the edge, guards re-entry while the promise is pending, and renders endContent when hasMore goes false - an ending you can see. Where the observer API is missing, a real "Load more" button renders instead, so a keyboard user is never stranded.',
      name: 'default',
      code: `const [items, setItems] = useState(firstPage)
const [hasMore, setHasMore] = useState(true)

<InfiniteScroll
  hasMore={hasMore}
  onLoadMore={async () => {
    const next = await api.page(items.length)
    setItems((current) => [...current, ...next.items])
    setHasMore(next.hasMore)
  }}
  endContent={<Text tone="muted">You have reached the end.</Text>}
>
  {items.map((item) => <Row key={item.id} {...item} />)}
</InfiniteScroll>

// inverse puts the sentinel at the START - chat history backfills upward:
<InfiniteScroll inverse hasMore={hasOlder} onLoadMore={loadOlder}>...</InfiniteScroll>`,
    },
  ],

  form: [
    {
      title: 'The browser validates; Form makes the report usable',
      description:
        'required, minLength, type="email" and pattern all work exactly as on plain HTML. Form intercepts submit, swaps in readable messages per field per failure, focuses the first invalid control, and hands { errors, submitting } to your layout. Nothing invalid ever reaches onSubmit. No dependency, no context, no controller.',
      name: 'default',
      code: `<Form
  messages={{
    email: { valueMissing: 'We need an email to reach you' },
  }}
  validate={(v) =>
    v.password !== v.confirm ? { confirm: 'Passwords do not match' } : null
  }
  onSubmit={async (values) => api.signup(values)}
>
  {({ errors, submitting }) => (
    <>
      <Field label="Email" error={errors.email}>
        <Input name="email" type="email" required />
      </Field>
      <Field label="Password" error={errors.password}>
        <Input name="password" type="password" minLength={8} required />
      </Field>
      <Field label="Confirm" error={errors.confirm}>
        <Input name="confirm" type="password" required />
      </Field>
      <Button type="submit" loading={submitting}>Create account</Button>
    </>
  )}
</Form>

// Plain children work too - the render function is only for layouts
// that want the errors and the pending state.`,
    },
  ],

  chip: [
    {
      title: 'Three shapes, and the element changes with the job',
      description:
        'Static chips are spans. Selectable chips are real aria-pressed buttons, so a filter bar is announced correctly for free. Removable chips keep the remove control as its OWN button - never a button inside a button, which is why selectable and onRemove are mutually exclusive.',
      name: 'default',
      code: `// A filter: a real toggle button underneath.
<Chip selectable selected={on} onSelectedChange={setOn}>Mine</Chip>

// A tag: Delete or Backspace on the focused chip also removes it.
<Chip tone="primary" onRemove={() => remove(tag)} removeLabel={\`Remove \${tag}\`}>
  {tag}
</Chip>`,
    },
    {
      title: 'Tones',
      description: 'The soft washes with their AA-verified text partners.',
      name: 'tones',
      code: `<Chip tone="neutral">Draft</Chip>
<Chip tone="primary">In review</Chip>
<Chip tone="success">Shipped</Chip>
<Chip tone="warning">Blocked</Chip>
<Chip tone="danger">Failing</Chip>`,
    },
  ],

  'number-input': [
    {
      title: 'A numeric field that behaves',
      description:
        'Deliberately not type="number": no wheel-drift while scrolling, no per-browser e/- juggling, and garbage cannot read back as an empty string. The value is number | null - null is empty, NaN never escapes - and drafts commit on Enter or blur, clamped into range.',
      name: 'default',
      code: `const [qty, setQty] = useState<number | null>(2)

<NumberInput
  value={qty}
  onValueChange={setQty}
  min={1}
  max={50}
/>

// ArrowUp/Down step - Shift steps by 10 - Home/End jump to the bounds.
// The steppers are pointer-only chrome: the input itself is the spinbutton.`,
    },
    {
      title: 'Decimals, rounded on commit',
      description: 'precision fixes the decimal places; step works in fractions.',
      name: 'sizes',
      code: `<NumberInput defaultValue={4.5} step={0.25} precision={2} min={0} />

// Opt back into wheel-to-step only when you mean it:
<NumberInput allowMouseWheel defaultValue={10} />`,
    },
  ],

  segmented: [
    {
      title: 'A view switcher with real radio semantics',
      description:
        'This is not Tabs. A segmented control reveals nothing and hides nothing - it is one visible choice from a few, so it is a styled radiogroup: one tab stop, arrows move and select together, aria-checked on the active segment.',
      name: 'default',
      code: `const [view, setView] = useState('list')

<Segmented
  label="View"
  value={view}
  onValueChange={setView}
  options={[
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board' },
    { value: 'timeline', label: 'Timeline' },
  ]}
/>

// fullWidth stretches segments evenly; disabled works per option:
<Segmented fullWidth label="Range" defaultValue="30d" options={[
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time', disabled: true },
]} />`,
    },
    {
      title: 'Three sizes',
      description: 'sm, md and lg, matching every other control in the library.',
      name: 'sizes',
      code: `<Segmented size="sm" label="Zoom" defaultValue="day" options={options} />
<Segmented size="md" label="Zoom" defaultValue="day" options={options} />
<Segmented size="lg" label="Zoom" defaultValue="day" options={options} />`,
    },
  ],

  'hover-card': [
    {
      title: 'A user card on a mention',
      description:
        'Opens on hover after an intent delay, and on focus immediately - a keyboard user gets the same preview a mouse user does. Not modal, not focus-trapping: the page behind stays interactive, and everything in the card must also be reachable somewhere else.',
      name: 'default',
      code: `<HoverCard>
  <HoverCardTrigger href="/team/vivek">@vivek</HoverCardTrigger>
  <HoverCardContent>
    <Stack direction="horizontal" gap={3}>
      <Avatar name="Vivek Kumar Singh" size="lg" />
      <Stack gap={1}>
        <Text weight="semibold">Vivek Kumar Singh</Text>
        <Text size="sm" tone="muted">Author of VivekUI.</Text>
      </Stack>
    </Stack>
  </HoverCardContent>
</HoverCard>

// Delays are tunable; moving from trigger into the card never closes it.
<HoverCard openDelay={200} closeDelay={300}>...</HoverCard>`,
    },
  ],

  'kanban-board': [
    {
      title: 'A sprint board you can drive from the keyboard',
      description:
        'HTML5 drag-and-drop has no keyboard equivalent at all, which is why nearly every Kanban board is mouse-only. This has two complete input paths: dragging, and a pick-up / move / drop model announced through a live region.',
      name: 'default',
      code: `const [columns, setColumns] = useState(initial)

<KanbanBoard
  columns={columns}
  label="Sprint board"
  // Nothing is mutated for you - the board reports the intended move.
  onMove={({ cardId, fromColumnId, toColumnId, toIndex }) =>
    setColumns((current) => applyMove(current, cardId, fromColumnId, toColumnId, toIndex))
  }
/>

// Columns carry an optional work-in-progress limit, which blocks drops when reached:
const initial = [
  { id: 'backlog', title: 'Backlog', cards: [...] },
  { id: 'doing', title: 'In progress', cards: [...], limit: 2 },
  { id: 'done', title: 'Done', cards: [] },
]`,
    },
  ],

  scheduler: [
    {
      title: 'A resource timeline nobody else gives you for free',
      description:
        'Rooms, people or machines down the side and time across the top. shadcn/ui, Mantine and Radix ship nothing like it, and MUI puts theirs behind a paid licence. Overlapping bookings stack into lanes so a double-booking is visible rather than hidden underneath.',
      name: 'default',
      code: `const resources = [
  { id: 'studio-a', label: 'Studio A', sublabel: 'Ground floor - 12 seats' },
  { id: 'studio-b', label: 'Studio B' },
]

const events = [
  { id: '1', resourceId: 'studio-a', title: 'Standup', start: at(9), end: at(9, 30) },
  { id: '2', resourceId: 'studio-a', title: 'Podcast', start: at(10), end: at(12, 30), tone: 'accent' },
  // Overlaps the podcast, so it is packed into a second lane instead of being hidden.
  { id: '3', resourceId: 'studio-a', title: 'Mic check', start: at(11, 30), end: at(12) },
  { id: '4', resourceId: 'studio-b', title: 'Maintenance', start: at(13), end: at(16), tone: 'warning' },
]

<Scheduler
  resources={resources}
  events={events}
  label="Studio bookings, 12 March"
  start={at(9)}
  end={at(18)}
  // Nothing is mutated for you - the board reports, your state decides.
  onSelect={(event) => setSelected(event)}
/>`,
    },
    {
      title: 'The keyboard model, which is the whole point',
      description:
        'A timeline conveys everything through position, and position is invisible to a screen reader. So the board is one tab stop with a roving focus, and every booking carries its resource, its times and its duration in its accessible name: "Podcast. Studio A, 10:00 to 12:30, 2 hours 30 minutes."',
      name: 'keyboard',
      code: `// Left / Right  - previous / next booking for this resource, in time order
// Up / Down     - the nearest booking in time on the resource above / below
// Home / End    - first / last booking for this resource
// Enter, Space  - select

// Empty resources are skipped by Up and Down: stopping on a row with nothing
// in it reads as a dead key.

<Scheduler resources={resources} events={events} label="Bookings" />`,
    },
    {
      title: 'The current-time marker, and why it is opt-in',
      description:
        'Reading the clock during render gives the server one marker position and the browser another, which React reports as a hydration mismatch. So the component never does it: showNow reads the clock in an effect after mount, and now takes an explicit time for tests and demos.',
      name: 'now',
      code: `// Reads the clock after mount, then ticks once a minute.
<Scheduler resources={resources} events={events} label="Today" showNow />

// Or pin it, which is what the demo above does so the docs never shift.
<Scheduler resources={resources} events={events} label="Today" now={at(13, 20)} />

// Times are written by a deterministic HH:MM formatter rather than
// Intl.DateTimeFormat, whose output varies between Node builds and browsers.
// Pass your own for a 12-hour clock:
<Scheduler
  resources={resources}
  events={events}
  label="Today"
  formatTime={(d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
/>`,
    },
  ],

  'file-tree': [
    {
      title: 'A project tree',
      description:
        'The full WAI-ARIA treeview keyboard model: arrows navigate across folder boundaries, Right opens and steps in, Left collapses or moves to the parent, * expands the level, and typing jumps to a match.',
      name: 'default',
      code: `const tree = [
  {
    id: 'src',
    label: 'src',
    // The presence of a children array is what makes a node a folder.
    children: [
      { id: 'index', label: 'index.ts' },
      { id: 'components', label: 'components', children: [...] },
    ],
  },
  { id: 'pkg', label: 'package.json' },
  { id: 'lock', label: 'pnpm-lock.yaml', disabled: true },
]

<FileTree
  nodes={tree}
  label="Project files"
  defaultExpandedIds={['src']}
  onSelect={(node) => open(node.id)}
/>`,
    },
    {
      title: 'Controlled expansion',
      description: 'Drive the open folders yourself to persist them, or to open to a path.',
      name: 'controlled',
      code: `<FileTree
  nodes={tree}
  label="Project files"
  expandedIds={open}
  onExpandedChange={setOpen}
/>`,
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
  data={rows}
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
      code: `<EditableGrid data={rows} columns={columns} label="Order lines" readOnly />`,
    },
  ],

  'video-player': [
    {
      title: 'One bar, real controls',
      description:
        'Every control is a real button or range with a name, and the shortcuts are the ones every player taught people: Space/K play, arrows seek and change volume, J/L jump ten seconds, M mutes, F goes fullscreen. Controls fade while the pointer rests and come back on any key or focus - faded, never removed.',
      name: 'default',
      code: `<VideoPlayer
  label="Product tour"
  src="/media/tour.mp4"
  poster="/media/tour-poster.jpg"
  onEnded={() => track('tour_watched')}
/>`,
    },
    {
      title: 'Sources, captions and speeds',
      description:
        'Several sources let the browser pick the first it can decode. WebVTT tracks add a Captions toggle (C); the default track starts showing. rates sets the speeds offered - an empty array hides the control. Cross-origin captions need crossOrigin on the element, which videoProps passes through.',
      name: 'sources',
      code: `<VideoPlayer
  label="Keynote"
  src={[
    { src: '/media/keynote.webm', type: 'video/webm' },
    { src: '/media/keynote.mp4', type: 'video/mp4' },
  ]}
  tracks={[
    { src: '/media/keynote.en.vtt', srclang: 'en', label: 'English', default: true },
    { src: '/media/keynote.hi.vtt', srclang: 'hi', label: 'हिन्दी' },
  ]}
  rates={[1, 1.5, 2]}
  ratio={4 / 3}
  videoProps={{ crossOrigin: 'anonymous' }}
/>`,
    },
  ],

  'audio-player': [
    {
      title: 'A track card',
      description:
        'title, subtitle and artwork make it a card; the string title names the player for assistive tech. Every control is a real button or range: the seek bar announces "1:23 of 4:56", volume a percentage. Space/K play, arrows seek and change volume, J/L jump ten seconds, M mutes.',
      name: 'default',
      code: `<AudioPlayer
  title="Episode 12: Zero dependencies"
  subtitle="The VivekUI podcast · 42 min"
  artwork="/podcast/cover.jpg"
  src="/podcast/ep12.mp3"
  onEnded={() => markListened(12)}
/>`,
    },
    {
      title: 'Bare and small',
      description:
        'Without a title it is one control row. size="sm" tightens it for a comment thread or a table cell; rates={[]} drops the speed control; several sources let the browser pick the first it can decode. Under 28rem the volume slider goes (mute stays); under 20rem the speed control goes too.',
      name: 'small',
      code: `<AudioPlayer
  size="sm"
  label="Voice note from Priya"
  rates={[]}
  src={[
    { src: '/notes/priya.ogg', type: 'audio/ogg' },
    { src: '/notes/priya.mp3', type: 'audio/mpeg' },
  ]}
/>`,
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

  lightbox: [
    {
      title: 'A gallery',
      description:
        'Built on the same dialog core as Modal: focus trapped and returned, the page inert, scroll locked, Escape and backdrop click to close. The dialog is named with the position ("Landscapes, 2 of 5") and the counter is a live region. Arrows wrap, Home/End jump, a horizontal swipe moves, thumbnails carry aria-current. alt is required: the image is the content.',
      name: 'default',
      code: `<Lightbox
  label="Landscapes"
  items={[
    { src: '/photos/ridge.jpg', thumbnail: '/photos/ridge-s.jpg', alt: 'Snow-covered ridge at dawn', caption: 'Dawn on the ridge' },
    { src: '/photos/pines.jpg', thumbnail: '/photos/pines-s.jpg', alt: 'Fog in a pine forest' },
    { src: '/photos/lake.jpg', thumbnail: '/photos/lake-s.jpg', alt: 'A still lake at golden hour' },
  ]}
  open={open}
  onOpenChange={setOpen}
  index={index}
  onIndexChange={setIndex}
/>`,
    },
    {
      title: 'One image, no wrap',
      description:
        'A single image shows no arrows or thumbnails. With more than one and loop={false}, the arrows at either end are announced aria-disabled instead of vanishing, so focus never jumps. thumbnails={false} hides the strip; closeOnOverlayClick={false} keeps a backdrop tap from closing.',
      name: 'single',
      code: `<Lightbox
  items={[{ src: '/diagrams/architecture.png', alt: 'System architecture diagram' }]}
  defaultOpen
  onOpenChange={(open) => !open && router.back()}
/>

<Lightbox items={steps} loop={false} thumbnails={false} open={open} onOpenChange={setOpen} />`,
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
