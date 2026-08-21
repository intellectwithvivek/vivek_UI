import type { ExampleSet } from '../example-types'
import { LIBRARY_VERSION_LABEL } from '../version'

/** Marketing page sections and the chat surface. */
export const SECTION_EXAMPLES: ExampleSet = {
  hero: [
    {
      title: 'A centred hero',
      description:
        'eyebrow, title, description and actions are the four slots every hero has. Each one takes a node, so a Badge in the eyebrow or two buttons in actions needs no extra prop.',
      name: 'basic',
      code: `<Hero
  eyebrow="Free and MIT licensed"
  title="Build the whole interface with one install"
  description="Components, charts and design tokens with zero runtime dependencies."
  actions={
    <Stack direction="horizontal" gap={3} wrap justify="center">
      <Button>Get started</Button>
      <Button variant="outline">View on npm</Button>
    </Stack>
  }
/>`,
    },
    {
      title: 'Split, with media',
      description:
        'layout="split" puts media beside the copy. It stacks below the text on narrow screens without you writing a breakpoint.',
      name: 'split',
      code: `<Hero
  layout="split"
  eyebrow={<Badge tone="primary">${LIBRARY_VERSION_LABEL}</Badge>}
  title="One package. No dependencies."
  description="83 components, 6 charts and a token system your CSS can always override."
  actions={<Button>Get started</Button>}
  media={<img src="/screenshot.png" alt="" />}
/>`,
    },
  ],

  cta: [
    {
      title: 'A closing call to action',
      description: 'Hero without the media slot: the band that ends a landing page.',
      name: 'basic',
      code: `<CTA
  title="Ready to try it?"
  description="One npm install and one stylesheet import is the whole setup."
  actions={
    <Stack direction="horizontal" gap={3} wrap justify="center">
      <Button>Get started</Button>
      <Button variant="ghost">Star on GitHub</Button>
    </Stack>
  }
/>`,
    },
    {
      title: 'On the brand colour',
      description:
        'variant="primary" flips the whole band, including the text and border tokens, so contrast holds without you restating colours.',
      name: 'primary',
      code: `<CTA
  variant="primary"
  eyebrow="Open source"
  title="Ship your next interface this week"
  description="Install once, style with tokens, override with a single class."
  actions={<Button variant="outline">Read the docs</Button>}
/>`,
    },
  ],

  pricing: [
    {
      title: 'Plan comparison',
      description:
        'highlighted lifts one plan and badge flags it. cta takes a node, so each plan can link wherever it needs to. Give every plan a stable id once the data is dynamic.',
      name: 'basic',
      code: `<Pricing
  eyebrow="Pricing"
  title="Every plan is the same plan"
  plans={[
    {
      id: 'hobby',
      name: 'Hobby',
      price: 'Free',
      description: 'For side projects and prototypes.',
      features: ['All 83 components', 'All 6 charts', 'Design tokens'],
      cta: <Button variant="outline">Start building</Button>,
    },
    {
      id: 'team',
      name: 'Team',
      price: 'Free',
      period: '/forever',
      features: ['Everything in Hobby', 'Commercial use under MIT', 'No seat limits'],
      cta: <Button>Install it</Button>,
      highlighted: true,
      badge: 'Most popular',
    },
  ]}
  columns={{ base: 1, md: 3 }}
/>`,
    },
  ],

  faq: [
    {
      title: 'Questions and answers',
      description:
        'Wraps Accordion in a Section, so the whole block is one component. answer takes a node when the answer needs a link or a list.',
      name: 'basic',
      code: `<FAQ
  eyebrow="FAQ"
  title="Questions people actually ask"
  defaultOpen={0}
  items={[
    {
      id: 'deps',
      question: 'Does it really have zero runtime dependencies?',
      answer: 'Yes. There is no dependencies field in package.json.',
    },
    {
      id: 'override',
      question: 'Can I override the styles?',
      answer: 'Every selector is wrapped in :where(), so one flat class of yours wins.',
    },
  ]}
/>`,
    },
  ],

  'feature-grid': [
    {
      title: 'Feature cards',
      description:
        'Omit columns for an auto-fitting grid that reflows at every width. icon takes any node, so your own SVG set drops straight in.',
      name: 'basic',
      code: `<FeatureGrid
  eyebrow="Why this one"
  title="The constraints are the product"
  columns={{ base: 1, sm: 2 }}
  features={[
    {
      id: 'deps',
      icon: <ShieldIcon />,
      title: 'Zero dependencies',
      description: 'Nothing in your lockfile but React.',
    },
    {
      id: 'css',
      icon: <BrushIcon />,
      title: 'Static CSS, one file',
      description: 'No CSS-in-JS runtime. Variants are data attributes.',
    },
  ]}
/>`,
    },
  ],

  stats: [
    {
      title: 'Headline figures',
      description:
        'value and label are announced together, so "83 components" is one fact rather than a number floating next to a word.',
      name: 'basic',
      code: `<Stats
  eyebrow="By the numbers"
  title="What one install gives you"
  columns={{ base: 2, lg: 4 }}
  items={[
    { id: 'components', value: '83', label: 'Components', description: 'Plus six chart types' },
    { id: 'deps', value: '0', label: 'Runtime dependencies', description: 'React is a peer' },
    { id: 'size', value: '40.5 kB', label: 'Whole library', description: 'Minified and gzipped' },
    { id: 'tests', value: '1268', label: 'Tests', description: 'Every component has an axe check' },
  ]}
/>`,
    },
    {
      title: 'Without a header',
      description: 'Drop the eyebrow and title to use it as a strip inside another section.',
      name: 'bare',
      code: `<Stats padding="sm" items={items} columns={3} />`,
    },
  ],

  testimonials: [
    {
      title: 'Quotes',
      description:
        'Each item renders as a real blockquote with its attribution in a figcaption, so the quote and its author stay connected outside of the visual layout.',
      name: 'basic',
      code: `<Testimonials
  eyebrow="Testimonials"
  title="What teams say"
  columns={{ base: 1, md: 3 }}
  items={[
    {
      id: 'a',
      quote: 'We replaced three UI packages with this one and the lockfile got shorter.',
      author: 'Priya Nair',
      role: 'Staff engineer',
      avatar: <Avatar name="Priya Nair" />,
    },
  ]}
/>`,
    },
  ],

  'logo-cloud': [
    {
      title: 'Customer logos',
      description:
        'alt is required on every logo. Pass src for an image, or node when the mark is inline SVG or text. A wall of undescribed images is the classic accessibility failure here.',
      name: 'basic',
      code: `<LogoCloud
  title="Trusted by teams shipping every day"
  logos={[
    { id: 'northwind', src: '/logos/northwind.svg', alt: 'Northwind' },
    { id: 'acme', src: '/logos/acme.svg', alt: 'Acme Corp' },
    { id: 'globex', alt: 'Globex', node: <GlobexMark /> },
  ]}
/>`,
    },
  ],

  footer: [
    {
      title: 'A site footer',
      description:
        'Link columns become nav landmarks with headings, which is what lets a screen reader skim the footer instead of reading forty links.',
      name: 'basic',
      code: `<Footer
  brand={
    <Stack gap={2}>
      <Text weight="semibold">VivekUI</Text>
      <Text size="sm" tone="muted">83 components, 6 charts, zero runtime dependencies.</Text>
    </Stack>
  }
  columns={[
    {
      title: 'Docs',
      links: [
        { label: 'Installation', href: '/docs/installation' },
        { label: 'Components', href: '/docs/components' },
      ],
    },
    {
      title: 'Project',
      links: [
        { label: 'npm', href: 'https://www.npmjs.com/package/@the_viveksingh/vivek-ui' },
        { label: 'GitHub', href: 'https://github.com/intellectwithvivek' },
      ],
    },
  ]}
  copyright="MIT licensed. Built by Vivek Kumar Singh."
/>`,
    },
  ],

  'chat-message': [
    {
      title: 'A conversation turn',
      description:
        'role drives the alignment and the accessible role, so user, assistant and system turns are distinguishable without reading the colours.',
      name: 'basic',
      code: `<ChatMessage role="system" content="You are chatting with the support assistant." />

<ChatMessage
  role="user"
  name="You"
  avatar={<Avatar name="Vivek Kumar Singh" size="sm" />}
  content="How do I override a component's padding?"
  timestamp={sentAt}
  status="sent"
/>

<ChatMessage
  role="assistant"
  name="Assistant"
  avatar={<Avatar fallback="AI" size="sm" />}
  content="Pass a className. Library selectors sit inside :where()."
  timestamp={repliedAt}
/>`,
    },
    {
      title: 'Flat variant',
      description: 'No bubble. Better for long answers, where a bubble becomes a wall of colour.',
      name: 'flat',
      code: `<ChatMessage variant="flat" role="user" name="You" content="Summarise this thread." />
<ChatMessage variant="flat" role="assistant" name="Assistant" content="Three open questions remain." />`,
    },
    {
      title: 'Delivery status',
      description:
        'sending, sent and error each get a visually hidden label, so a failed send is announced rather than only tinted. Use actions for the retry affordance.',
      name: 'states',
      code: `<ChatMessage role="user" content="Sending this one now" status="sending" />
<ChatMessage role="user" content="This one landed" status="sent" />
<ChatMessage
  role="user"
  content="This one failed to send"
  status="error"
  actions={<Button size="sm" variant="ghost" onClick={retry}>Retry</Button>}
/>`,
    },
  ],

  'chat-thread': [
    {
      title: 'A scrolling thread',
      description:
        'Sticks to the bottom as messages arrive, but stops sticking once the reader scrolls up - which is what keeps it from yanking them away from what they were reading.',
      name: 'basic',
      code: `<ChatThread
  style={{ height: '20rem' }}
  messages={messages.map((message) => ({
    id: message.id,
    role: message.role,
    name: message.name,
    content: message.text,
    timestamp: message.at,
    status: message.status,
  }))}
/>`,
    },
    {
      title: 'While a reply streams',
      description: 'loading appends a typing indicator and announces it politely.',
      name: 'loading',
      code: `<ChatThread messages={messages} loading loadingLabel="Assistant is typing" />`,
    },
    {
      title: 'Empty',
      description:
        'Import ChatThreadEmpty by name rather than reaching for ChatThread.Empty. Dot access on a Client Component reads as undefined from a Server Component, so the named export is the one that works in both places.',
      name: 'empty',
      code: `import { ChatThread, ChatThreadEmpty } from '@the_viveksingh/vivek-ui'

<ChatThread
  emptyState={<ChatThreadEmpty>No messages yet. Ask anything.</ChatThreadEmpty>}
/>`,
    },
  ],

  'chat-input': [
    {
      title: 'A composer',
      description:
        'Enter sends, Shift+Enter adds a line, and the box grows to maxRows before it scrolls. onSubmit receives the trimmed draft and is never called while empty, disabled or busy.',
      name: 'basic',
      code: `<ChatInput
  label="Message"
  hideLabel
  placeholder="Ask anything. Enter sends, Shift+Enter adds a line."
  maxRows={6}
  onSubmit={send}
/>`,
    },
    {
      title: 'With attachments',
      description: 'The attachments slot sits above the box and takes any node.',
      name: 'attachments',
      code: `<ChatInput
  label="Message"
  hideLabel
  attachments={
    <Stack direction="horizontal" gap={2} wrap>
      {files.map((file) => (
        <Badge key={file.name} tone="neutral">{file.name}</Badge>
      ))}
    </Stack>
  }
  onSubmit={send}
/>`,
    },
    {
      title: 'While a request is in flight',
      description:
        'busy disables sending, so a second Enter cannot fire the same request twice - the same reason Button has loading.',
      name: 'busy',
      code: `<ChatInput busy label="Message" hideLabel hint="Waiting for a reply..." />`,
    },
  ],

  'chat-code-block': [
    {
      title: 'Code in a reply',
      description:
        'Copy state is announced, not just shown. highlight takes your own highlighter, so no syntax-highlighting library is bundled into the package.',
      name: 'basic',
      code: `<ChatCodeBlock
  filename="save-button.tsx"
  language="tsx"
  code={snippet}
  onCopy={(code) => track('copied', code.length)}
/>`,
    },
    {
      title: 'Wrapping long lines',
      description: 'wrap suits a shell command, where horizontal scrolling hides the end of it.',
      name: 'wrap',
      code: `<ChatCodeBlock language="bash" wrap code="npm install @the_viveksingh/vivek-ui" />`,
    },
  ],
}
