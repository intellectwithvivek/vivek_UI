import type { ExampleSet } from '../example-types'

/** Type, inline text and content-display components. */
export const TYPOGRAPHY_EXAMPLES: ExampleSet = {
  heading: [
    {
      title: 'Levels',
      description:
        'level picks the tag, h1 through h6, and each level has a default size. The demo starts at 3 on purpose: rendering an h1 here would give this page two of them and break its outline, which is exactly the mistake the next example is about.',
      name: 'levels',
      code: `<Heading level={1}>Level 1</Heading>
<Heading level={2}>Level 2</Heading>
<Heading level={3}>Level 3</Heading>
<Heading level={4}>Level 4</Heading>`,
    },
    {
      title: 'Size is independent of level',
      description:
        'This is the whole point of the component. Needing a smaller heading is never a reason to pick a deeper tag: doing that breaks the document outline every screen reader relies on.',
      name: 'sizeVsLevel',
      code: `<Heading level={3} size="md">An h3 that looks small</Heading>
<Heading level={4} size="2xl">An h4 that looks large</Heading>`,
    },
  ],

  text: [
    {
      title: 'Sizes and weights',
      name: 'sizes',
      code: `<Text size="lg" weight="semibold">Large and semibold</Text>
<Text>Default size, default weight</Text>
<Text size="sm" tone="muted">Small and muted</Text>`,
    },
    {
      title: 'Tones',
      description: 'Four tones, each drawn from a token so a theme change moves all of them.',
      name: 'tones',
      code: `<Text>Default body copy</Text>
<Text tone="muted">Muted, for secondary detail</Text>
<Text tone="primary">Primary, for emphasis on brand</Text>
<Text tone="danger">Danger, for an error message</Text>`,
    },
    {
      title: 'Overflow',
      description:
        'truncate clips to one line; lineClamp clips to N. Both keep a card grid from going ragged when one item has more to say than the rest.',
      name: 'clamp',
      code: `<Text truncate>A single line that is far too long to fit.</Text>
<Text lineClamp={2} tone="muted">
  lineClamp cuts the paragraph off after a set number of lines.
</Text>`,
    },
  ],

  code: [
    {
      title: 'Inline',
      description:
        'Inline code keeps the surrounding line height, so a paragraph containing it does not grow taller than its neighbours.',
      name: 'inline',
      code: `<Text>
  Install it with <Code>npm i @the_viveksingh/vivek-ui</Code>, then import the stylesheet.
</Text>`,
    },
    {
      title: 'Block',
      description:
        'block switches to a pre element that scrolls horizontally rather than wrapping.',
      name: 'block',
      code: `<Code block>{snippet}</Code>`,
    },
  ],

  kbd: [
    {
      title: 'Keys',
      name: 'basic',
      code: `<Kbd size="sm">Esc</Kbd>
<Kbd>Enter</Kbd>
<Kbd>Shift</Kbd>
<Kbd>Tab</Kbd>`,
    },
    {
      title: 'In a sentence',
      name: 'inline',
      code: `<Text>
  Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> to open the command palette.
</Text>`,
    },
  ],

  prose: [
    {
      title: 'Style HTML you did not author',
      description:
        'Markdown output, a CMS body, a changelog. One wrapper styles headings, lists, tables, blockquotes and code without a class on every element.',
      name: 'basic',
      code: `<Prose>
  <h3>Long-form content</h3>
  <p>Prose styles raw HTML without needing a class on every element.</p>
  <ul>
    <li>Headings, lists and blockquotes pick up the type scale</li>
  </ul>
  <blockquote>Everything here is plain HTML inside one Prose wrapper.</blockquote>
</Prose>`,
    },
    {
      title: 'Prose.Link refuses an unsafe href',
      description:
        'A javascript: or data: URL renders as inert text instead of a link. Untrusted markdown is the exact case where this matters, and React 18 will happily render such an href if you do not check it.',
      name: 'link',
      code: `<Prose.Link href="https://vivekkumarsingh.in/">A safe link works</Prose.Link>

{/* Renders as plain text, not a link */}
<Prose.Link href="javascript:alert(1)">Blocked</Prose.Link>`,
    },
  ],

  avatar: [
    {
      title: 'Photo, initials, and a photo that failed',
      description:
        'src shows the picture; name supplies the initials that render when there is no src - and when the src fails to load, because a broken image icon is never the right avatar.',
      name: 'photo',
      code: `<Avatar name="Aditi Sharma" src="/team/aditi.jpg" size="lg" />
<Avatar name="Aditi Sharma" size="lg" />
<Avatar name="Aditi Sharma" src="/does-not-exist.jpg" size="lg" />`,
    },
    {
      title: 'Sizes',
      description:
        'With no src the initials are derived from name, so a missing image is never a blank circle.',
      name: 'sizes',
      code: `<Avatar name="Vivek Kumar Singh" size="xs" />
<Avatar name="Vivek Kumar Singh" size="sm" />
<Avatar name="Vivek Kumar Singh" size="md" />
<Avatar name="Vivek Kumar Singh" size="lg" />
<Avatar name="Vivek Kumar Singh" size="xl" />`,
    },
    {
      title: 'Shapes',
      name: 'shapes',
      code: `<Avatar name="Vivek Kumar Singh" shape="circle" />
<Avatar name="Vivek Kumar Singh" shape="square" />`,
    },
    {
      title: 'Overlapping group',
      description: 'A trailing count is just another Avatar with an explicit fallback.',
      name: 'group',
      code: `<Avatar.Group>
  <Avatar name="Vivek Kumar Singh" />
  <Avatar name="Aditi Sharma" />
  <Avatar name="Rahul Verma" />
  <Avatar fallback="+4" />
</Avatar.Group>`,
    },
  ],

  skeleton: [
    {
      title: 'Placeholders',
      description:
        'lines renders a paragraph of decreasing widths. The shimmer stops entirely under prefers-reduced-motion.',
      name: 'basic',
      code: `<Skeleton variant="rect" height={120} />
<Skeleton lines={3} />`,
    },
    {
      title: 'Match the shape of what is loading',
      description:
        'A skeleton that mirrors the final layout avoids a second reflow when the content arrives.',
      name: 'shapes',
      code: `<Stack direction="horizontal" gap={4} align="center">
  <Skeleton variant="circle" width={48} height={48} />
  <Stack gap={2} style={{ flex: 1 }}>
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="text" width="70%" />
  </Stack>
</Stack>`,
    },
  ],

  spinner: [
    {
      title: 'Sizes',
      name: 'sizes',
      code: `<Spinner size="xs" />
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`,
    },
    {
      title: 'With an accessible name',
      description:
        'label is announced by assistive technology. Pass null when a nearby element already says what is loading, so it is not announced twice.',
      name: 'label',
      code: `<Spinner label="Loading your workspace" />`,
    },
  ],

  progress: [
    {
      title: 'Sizes',
      description: 'label supplies the accessible name; without one the bar is announced unnamed.',
      name: 'sizes',
      code: `<Progress value={30} size="sm" label="Small" />
<Progress value={55} size="md" label="Medium" />
<Progress value={80} size="lg" label="Large" />`,
    },
    {
      title: 'Tones',
      name: 'tones',
      code: `<Progress value={72} label="Upload progress" />
<Progress value={92} tone="success" label="Tests passed" />
<Progress value={48} tone="warning" label="Storage used" />
<Progress value={18} tone="danger" label="Budget remaining" />`,
    },
    {
      title: 'Indeterminate',
      description:
        'Omit value when you cannot know the total. aria-valuenow is left off, which is what tells a screen reader the progress is unknown.',
      name: 'indeterminate',
      code: `<Progress label="Deploying" />`,
    },
  ],

  'empty-state': [
    {
      title: 'Nothing here yet',
      description:
        'An empty state should say what will appear and how to make it appear. actions takes any node, usually one primary and one secondary button.',
      name: 'basic',
      code: `<EmptyState
  icon={<InboxIcon />}
  title="No invoices yet"
  description="Once you send your first invoice it will show up here."
  actions={
    <Stack direction="horizontal" gap={3} wrap justify="center">
      <Button>Create invoice</Button>
      <Button variant="outline">Import from CSV</Button>
    </Stack>
  }
/>`,
    },
    {
      title: 'Compact',
      description: 'For a filtered list that came back empty, where a big illustration is noise.',
      name: 'minimal',
      code: `<EmptyState size="sm" title="No results" description="Try a different search term." />`,
    },
  ],

  'animated-counter': [
    {
      title: 'Count up on scroll',
      description:
        'Starts when it enters the viewport. Under prefers-reduced-motion it renders the final number immediately rather than animating.',
      name: 'basic',
      code: `<Heading level={3} size="hero">
  <AnimatedCounter value={91} duration={1200} />
</Heading>`,
    },
    {
      title: 'Formatted',
      description:
        'format takes Intl.NumberFormat options, or your own function. Currency, percentages and fixed decimals all come from the platform rather than string maths.',
      name: 'formatted',
      code: `<AnimatedCounter
  value={4280}
  format={{ style: 'currency', currency: 'INR', maximumFractionDigits: 0 }}
  locale="en-IN"
/>

<AnimatedCounter value={99.98} suffix="%" format={{ minimumFractionDigits: 2 }} />
<AnimatedCounter value={1268} prefix="~" suffix=" tests" />`,
    },
  ],

  clock: [
    {
      title: 'A live clock',
      description:
        'Renders a placeholder on the server and hydrates to local time, so the markup never mismatches. Without that a clock is a guaranteed hydration error.',
      name: 'basic',
      code: `<Clock showSeconds />`,
    },
    {
      title: 'Other time zones',
      description: 'Any IANA zone. Formatting goes through Intl, so it is correct per locale.',
      name: 'zones',
      code: `<Clock timeZone="Asia/Kolkata" showSeconds />
<Clock timeZone="Europe/London" showSeconds />
<Clock timeZone="America/New_York" showSeconds hour12 />`,
    },
    {
      title: 'Custom format',
      name: 'format',
      code: `<Clock format={{ dateStyle: 'full', timeStyle: 'short' }} />
<Clock format={{ hour: '2-digit', minute: '2-digit' }} hour12={false} />`,
    },
  ],

  'relative-time': [
    {
      title: '"2 minutes ago"',
      description:
        'The absolute timestamp stays in the datetime and title attributes, so the exact moment is never lost - only the label is relative.',
      name: 'basic',
      code: `<RelativeTime date={comment.createdAt} />`,
    },
    {
      title: 'Words or numbers',
      description:
        'numeric="auto" prefers "yesterday"; numeric="always" keeps "1 day ago". Both come from Intl.RelativeTimeFormat, so both are localised.',
      name: 'numeric',
      code: `<RelativeTime date={date} numeric="auto" />
<RelativeTime date={date} numeric="always" />`,
    },
  ],

  countdown: [
    {
      title: 'Time until an event',
      description:
        'Pass now to pin the reference time. That is what makes a countdown testable and keeps server and client markup identical on the first paint.',
      name: 'basic',
      code: `<Countdown to={launchDate} label="Time until v1.0" />`,
    },
    {
      title: 'Pick the units',
      name: 'compact',
      code: `<Countdown to={launchDate} format={['hours', 'minutes', 'seconds']} showLabels={false} />
<Countdown to={launchDate} hideZeroUnits label="Time until launch" />`,
    },
  ],

  'copy-button': [
    {
      title: 'Copy to clipboard',
      description:
        'The state change is announced to assistive technology, not only shown, and it reverts after timeout. A failed write reports the error label rather than lying about success.',
      name: 'basic',
      code: `<CopyButton
  value="npm i @the_viveksingh/vivek-ui"
  label="Copy install command"
  copiedLabel="Copied"
/>`,
    },
    {
      title: 'Variants',
      description: 'It forwards variant and size straight to Button, so it matches its neighbours.',
      name: 'variants',
      code: `<CopyButton value="npm i @the_viveksingh/vivek-ui" />
<CopyButton value="pnpm add @the_viveksingh/vivek-ui" variant="outline" />
<CopyButton value="yarn add @the_viveksingh/vivek-ui" variant="ghost" size="sm" />`,
    },
  ],

  table: [
    {
      title: 'A semantic table',
      description:
        'Real thead, tbody, th and caption. Cell label supplies the header text the responsive stacked layout shows on narrow screens, so nothing becomes unreadable on a phone.',
      name: 'basic',
      code: `<Table hoverable>
  <Table.Caption visuallyHidden>Recent invoices</Table.Caption>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Invoice</Table.HeaderCell>
      <Table.HeaderCell>Client</Table.HeaderCell>
      <Table.HeaderCell numeric>Amount</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {invoices.map((invoice) => (
      <Table.Row key={invoice.id}>
        <Table.Cell label="Invoice">{invoice.id}</Table.Cell>
        <Table.Cell label="Client">{invoice.client}</Table.Cell>
        <Table.Cell label="Amount" numeric>{invoice.amount}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>`,
    },
    {
      title: 'Striped',
      description:
        'Zebra striping comes from a data attribute on the root, not a class on every row.',
      name: 'striped',
      code: `<Table striped hoverable>
  {/* same markup */}
</Table>`,
    },
  ],

  timeline: [
    {
      title: 'Vertical timeline',
      description:
        'An ordered list, because the order is the meaning. status drives the marker and adds a visually hidden label, so "current" is not conveyed by colour alone.',
      name: 'basic',
      code: `<Timeline>
  <Timeline.Item
    title="Pull request opened"
    description="feat: forms milestone."
    timestamp="2 days ago"
    status="complete"
  />
  <Timeline.Item title="Checks running" timestamp="Just now" status="current" />
  <Timeline.Item title="Merge to main" timestamp="Pending" status="pending" />
</Timeline>`,
    },
    {
      title: 'Horizontal',
      description: 'For a short, fixed set of stages - an order tracker rather than a history.',
      name: 'horizontal',
      code: `<Timeline orientation="horizontal">
  <Timeline.Item title="Ordered" status="complete" timestamp="Mon" />
  <Timeline.Item title="Shipped" status="current" timestamp="Wed" />
  <Timeline.Item title="Delivered" status="pending" timestamp="Fri" />
</Timeline>`,
    },
  ],

  'typing-indicator': [
    {
      title: 'Three dots',
      description:
        'active={false} stops the animation without unmounting, which keeps the row height stable instead of making the thread jump.',
      name: 'basic',
      code: `<TypingIndicator />
<TypingIndicator size="sm" />
<TypingIndicator active={false} />`,
    },
    {
      title: 'With a label',
      description:
        'showLabel makes it visible; either way label is the accessible name, so a screen reader is told someone is typing.',
      name: 'withLabel',
      code: `<TypingIndicator showLabel label="Assistant is typing" />
<TypingIndicator showLabel label="Priya is typing" size="sm" dots={4} />`,
    },
  ],
}
