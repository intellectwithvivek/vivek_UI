import type { ExampleSet } from '../example-types'

/** Layout primitives and structural components. */
export const LAYOUT_EXAMPLES: ExampleSet = {
  box: [
    {
      title: 'A div that behaves',
      description:
        'Box adds no styling of its own. It exists so the contract - merged className, merged style, spread rest props, forwarded ref - is available on a plain element.',
      name: 'basic',
      code: `<Box className="panel">
  <Text>A Box is an unstyled div that merges className and style.</Text>
</Box>

<Box className="panel" style={{ borderStyle: 'dashed' }}>
  <Text tone="muted">Your style wins: the library adds no specificity.</Text>
</Box>`,
    },
    {
      title: 'Change the element',
      description: 'as retags the element without changing anything else.',
      name: 'as',
      code: `<Box as="section" className="panel">
  <Text>Rendered as a section, not a div.</Text>
</Box>`,
    },
  ],

  stack: [
    {
      title: 'Vertical by default',
      description:
        'Stack is flexbox with a gap on the token scale. Gap rather than margin means no collapsing and no last-child exceptions.',
      name: 'vertical',
      code: `<Stack gap={3}>
  <Box className="tile">Vertical by default</Box>
  <Box className="tile">Gap sits on the --vk-space scale</Box>
  <Box className="tile">No margins to collapse</Box>
</Stack>`,
    },
    {
      title: 'Horizontal, wrapping',
      name: 'horizontal',
      code: `<Stack direction="horizontal" gap={3} wrap>
  <Box className="tile">One</Box>
  <Box className="tile">Two</Box>
  <Box className="tile">Three</Box>
</Stack>`,
    },
    {
      title: 'Push items apart',
      description: 'The row every summary line needs: label on the left, value on the right.',
      name: 'justify',
      code: `<Stack direction="horizontal" justify="between" align="center" gap={3}>
  <Text weight="semibold">Total</Text>
  <Text>$4,280.00</Text>
</Stack>`,
    },
  ],

  grid: [
    {
      title: 'Auto-fitting grid',
      description:
        'Omit cols and the grid fits as many minItemWidth tracks as the container allows. It reflows at every width with no breakpoints to maintain.',
      name: 'autofit',
      code: `<Grid minItemWidth="10rem" gap={3}>
  {items.map((item) => (
    <Box key={item} className="tile">
      {item}
    </Box>
  ))}
</Grid>`,
    },
    {
      title: 'Responsive column counts',
      description:
        'An object maps breakpoints to counts. The values become inline custom properties that the static stylesheet reads, so no CSS is generated at runtime.',
      name: 'responsive',
      code: `<Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={3}>
  {items.map((item) => (
    <Box key={item} className="tile">
      {item}
    </Box>
  ))}
</Grid>`,
    },
  ],

  container: [
    {
      title: 'Centre a column of content',
      name: 'basic',
      code: `<Container>
  <Text>Centred, max-width capped, with responsive side padding.</Text>
</Container>`,
    },
    {
      title: 'Widths',
      description: 'Five widths, from sm to full. Pair with Section, which accepts the same sizes.',
      name: 'sizes',
      code: `<Container size="sm">Narrow, good for prose</Container>
<Container size="md">The default</Container>
<Container size="lg">Wide, good for dashboards</Container>`,
    },
  ],

  section: [
    {
      title: 'A page section',
      description:
        'Section owns the vertical rhythm and the inner Container, so a landing page becomes a list of sections instead of a pile of wrapper divs.',
      name: 'basic',
      code: `<Section padding="lg" background="muted">
  <Stack gap={3} align="start">
    <Text size="lg" weight="semibold">A page section</Text>
    <Text tone="muted">Section owns the vertical rhythm and the inner Container.</Text>
    <Button size="sm">Call to action</Button>
  </Stack>
</Section>`,
    },
    {
      title: 'Section.Header',
      description:
        'The eyebrow, title and description trio every marketing section repeats. headingLevel keeps the document outline correct wherever the section sits.',
      name: 'header',
      code: `<Section padding="lg" background="muted">
  <Section.Header
    eyebrow="Pricing"
    title="Simple, predictable billing"
    description="No seat minimums and no annual lock-in."
    align="center"
  />
</Section>`,
    },
  ],

  'aspect-ratio': [
    {
      title: 'Reserve the space before the media loads',
      description:
        'The box takes its height from its own width, so an image or iframe dropping in causes no layout shift.',
      name: 'basic',
      code: `<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</AspectRatio>`,
    },
    {
      title: 'Square',
      name: 'square',
      code: `<AspectRatio ratio={1}>
  <img src="/avatar.jpg" alt="" />
</AspectRatio>`,
    },
  ],

  divider: [
    {
      title: 'A horizontal rule',
      name: 'basic',
      code: `<Stack gap={4}>
  <Text>Above the rule</Text>
  <Divider />
  <Text>Below the rule</Text>
</Stack>`,
    },
    {
      title: 'With a label',
      description:
        'The label sits in the rule rather than on top of it, so the line breaks around the text instead of running behind it.',
      name: 'label',
      code: `<Divider label="or" />`,
    },
    {
      title: 'Vertical',
      description: 'Needs a parent with a height, which a flex row gives it.',
      name: 'vertical',
      code: `<Stack direction="horizontal" gap={3} align="center" style={{ height: '2rem' }}>
  <Text>Docs</Text>
  <Divider orientation="vertical" />
  <Text>Components</Text>
  <Divider orientation="vertical" />
  <Text>Charts</Text>
</Stack>`,
    },
  ],

  'bento-grid': [
    {
      title: 'Feature mosaic',
      description:
        'Cells claim column and row spans, so one grid produces the uneven layout a feature section wants. Spans are responsive objects, same as Grid cols.',
      name: 'basic',
      code: `<BentoGrid cols={{ base: 1, sm: 2, lg: 4 }} gap={3} rowHeight="7rem">
  <BentoGrid.Item colSpan={{ base: 1, lg: 2 }} rowSpan={2}>
    <Cell title="One install" body="Components, charts and tokens in a single package." />
  </BentoGrid.Item>
  <BentoGrid.Item colSpan={{ base: 1, sm: 2 }}>
    <Cell title="40.5 kB" body="The whole library, minified and gzipped." />
  </BentoGrid.Item>
  <BentoGrid.Item>
    <Cell title="1268 tests" body="Every component has an axe assertion." />
  </BentoGrid.Item>
  <BentoGrid.Item>
    <Cell title="ESM + CJS" body="Correct types in all three resolution modes." />
  </BentoGrid.Item>
</BentoGrid>`,
    },
    {
      title: 'Dense packing',
      description:
        'dense turns on grid-auto-flow: dense, which backfills the gaps a wide cell leaves behind. Visual order then diverges from DOM order, so keep it for decorative tiles.',
      name: 'dense',
      code: `<BentoGrid cols={4} gap={3} rowHeight="6rem" dense>
  <BentoGrid.Item colSpan={2}>Zero dependencies</BentoGrid.Item>
  <BentoGrid.Item>88 components</BentoGrid.Item>
  <BentoGrid.Item>MIT</BentoGrid.Item>
  <BentoGrid.Item colSpan={3}>Server-safe</BentoGrid.Item>
</BentoGrid>`,
    },
  ],

  'scroll-area': [
    {
      title: 'A scrolling region',
      description:
        'Styles the scrollbar without replacing it, so native momentum, keyboard scrolling and the OS accessibility settings all still work.',
      name: 'basic',
      code: `<ScrollArea style={{ height: '10rem' }}>
  <Stack gap={2}>
    {rows.map((row) => (
      <Text key={row}>{row}</Text>
    ))}
  </Stack>
</ScrollArea>`,
    },
    {
      title: 'Horizontal',
      name: 'horizontal',
      code: `<ScrollArea orientation="horizontal">
  <Stack direction="horizontal" gap={3} style={{ width: 'max-content' }}>
    {items.map((item) => (
      <Text key={item} className="tile">{item}</Text>
    ))}
  </Stack>
</ScrollArea>`,
    },
  ],

  portal: [
    {
      title: 'Render outside the tree',
      description:
        'Escapes an ancestor overflow: hidden or transform, which is what breaks a positioned element inside a scrolling panel. Overlays use it internally.',
      name: 'basic',
      code: `<Portal>
  <div style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
    Portalled to document.body
  </div>
</Portal>`,
    },
  ],

  marquee: [
    {
      title: 'A scrolling strip',
      description:
        'Children are duplicated so the loop has no visible seam. pauseOnHover stops it on hover and on keyboard focus, and reduced-motion users get a static row.',
      name: 'basic',
      code: `<Marquee speed={40} gap={4} gradient pauseOnHover>
  {items.map((item) => (
    <Text key={item} className="tile">{item}</Text>
  ))}
</Marquee>`,
    },
    {
      title: 'Reverse direction',
      name: 'reverse',
      code: `<Marquee direction="right" speed={30} pauseOnHover>
  {items.map((item) => (
    <Text key={item} className="tile">{item}</Text>
  ))}
</Marquee>`,
    },
  ],
}
