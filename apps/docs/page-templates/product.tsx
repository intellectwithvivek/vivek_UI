'use client'

import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Heading,
  Image,
  Rating,
  Section,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/**
 * A deterministic gradient, as an inline SVG data URI.
 *
 * Product pages in a gallery are exactly where a stock-photo URL gets pasted in, and it is a
 * bad trade: a third-party image host is a request your visitors make to someone else, it
 * can start logging, rate-limiting, or 404ing at any point, and the licence is rarely as
 * clear as it looks. This has no network dependency and no licence question at all.
 */
const swatch = (from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="800" height="800" fill="url(%23g)"/></svg>`,
  )}`

const VIEWS = [
  { id: 'front', alt: 'The bag from the front, upright', src: swatch('#2b3a55', '#5c7aa8') },
  {
    id: 'side',
    alt: 'The bag from the side, showing its depth',
    src: swatch('#3d4f3c', '#8aa87f'),
  },
  { id: 'open', alt: 'The bag open, showing the laptop sleeve', src: swatch('#5a3d55', '#a87f9e') },
  { id: 'detail', alt: 'Close-up of the strap hardware', src: swatch('#5a4a2b', '#b39a6a') },
]

const SIZES = [
  { id: '18', label: '18L', detail: 'Day bag' },
  { id: '24', label: '24L', detail: 'Overnight' },
  { id: '32', label: '32L', detail: 'Carry-on' },
]

const COLOURS = [
  { id: 'slate', label: 'Slate', swatch: '#2b3a55' },
  { id: 'moss', label: 'Moss', swatch: '#3d4f3c' },
  { id: 'plum', label: 'Plum', swatch: '#5a3d55' },
]

export default function ProductPage() {
  const [view, setView] = useState(0)
  const [size, setSize] = useState('24')
  const [colour, setColour] = useState('slate')

  const current = VIEWS[view] ?? VIEWS[0]
  if (!current) return null

  return (
    <Section padding="lg">
      <Container size="lg">
        <Stack gap={6}>
          <Breadcrumb
            items={[
              { label: 'Home', href: '#' },
              { label: 'Bags', href: '#' },
              { label: 'Meridian 24L' },
            ]}
          />

          <Grid gap={8} minItemWidth="20rem">
            <Stack gap={3}>
              <Image alt={current.alt} ratio={1} rounded="lg" src={current.src} />

              {/*
                Real buttons in a labelled group, not clickable divs. A gallery built from
                divs cannot be reached by keyboard at all, and the selected state is
                invisible to a screen reader unless `aria-pressed` says so.
              */}
              <div aria-label="Choose a view" role="group">
                <Stack direction="horizontal" gap={2}>
                  {VIEWS.map((item, index) => (
                    <button
                      aria-label={item.alt}
                      aria-pressed={index === view}
                      key={item.id}
                      onClick={() => setView(index)}
                      style={{
                        padding: 0,
                        border:
                          index === view
                            ? '2px solid var(--vk-color-primary)'
                            : '2px solid var(--vk-color-border)',
                        borderRadius: 'var(--vk-radius-md)',
                        background: 'none',
                        cursor: 'pointer',
                        lineHeight: 0,
                        width: '4.5rem',
                      }}
                      type="button"
                    >
                      <Image alt="" ratio={1} rounded="sm" src={item.src} />
                    </button>
                  ))}
                </Stack>
              </div>
            </Stack>

            <Stack gap={6}>
              <Stack gap={2}>
                <Badge tone="success" variant="soft">
                  In stock
                </Badge>
                <Heading level={1} size="2xl">
                  Meridian travel pack
                </Heading>
                <Stack align="center" direction="horizontal" gap={2}>
                  <Rating readOnly value={4.5} />
                  <Text size="sm" tone="muted">
                    4.5 out of 5 · 218 reviews
                  </Text>
                </Stack>
                <Heading level={2} size="xl">
                  £189
                </Heading>
                <Text tone="muted">
                  A carry-on that opens flat, with a padded sleeve that takes a 16-inch laptop and a
                  base that does not sag when the bag is half empty.
                </Text>
              </Stack>

              <Divider />

              <Stack gap={2}>
                <Text weight="medium">Size</Text>
                <div aria-label="Choose a size" role="group">
                  <Stack direction="horizontal" gap={2} wrap>
                    {SIZES.map((option) => (
                      <Button
                        aria-pressed={size === option.id}
                        key={option.id}
                        onClick={() => setSize(option.id)}
                        variant={size === option.id ? 'solid' : 'outline'}
                      >
                        {option.label} · {option.detail}
                      </Button>
                    ))}
                  </Stack>
                </div>
              </Stack>

              <Stack gap={2}>
                <Text weight="medium">Colour</Text>
                <div aria-label="Choose a colour" role="group">
                  <Stack direction="horizontal" gap={2} wrap>
                    {COLOURS.map((option) => (
                      <Button
                        aria-pressed={colour === option.id}
                        key={option.id}
                        onClick={() => setColour(option.id)}
                        variant={colour === option.id ? 'solid' : 'outline'}
                      >
                        {/* The name is the label. Colour alone is never the only cue. */}
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-block',
                            width: '0.75rem',
                            height: '0.75rem',
                            marginInlineEnd: '0.5rem',
                            borderRadius: '50%',
                            background: option.swatch,
                          }}
                        />
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
                </div>
              </Stack>

              <Stack direction="horizontal" gap={3}>
                <Button size="lg" style={{ flex: 1 }}>
                  Add to basket
                </Button>
                <Button size="lg" variant="outline">
                  Save
                </Button>
              </Stack>

              <Alert tone="info" variant="soft">
                <Text size="sm">
                  Free delivery over £75, and 60 days to change your mind — used, packed and scuffed
                  is fine.
                </Text>
              </Alert>
            </Stack>
          </Grid>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTab value="details">Details</TabsTab>
              <TabsTab value="spec">Specification</TabsTab>
              <TabsTab value="reviews">Reviews</TabsTab>
            </TabsList>
            <TabsPanels>
              <TabsPanel value="details">
                <Card padding="lg">
                  <Stack gap={3}>
                    <Text>
                      The Meridian opens flat like a suitcase, which is the difference between
                      packing it and stuffing it. The laptop sleeve is suspended, so a drop onto the
                      base does not reach the machine.
                    </Text>
                    <Text>
                      Made from recycled 420D ripstop with a DWR finish. The hardware is replaceable
                      — every buckle and slider is a standard part, and we will post you one for
                      nothing.
                    </Text>
                  </Stack>
                </Card>
              </TabsPanel>
              <TabsPanel value="spec">
                <Card padding="lg">
                  <Stack gap={2}>
                    {[
                      ['Capacity', `${size}L`],
                      ['Weight', '1.24 kg'],
                      ['Dimensions', '54 × 34 × 21 cm'],
                      ['Laptop', 'Up to 16 inches'],
                      ['Material', 'Recycled 420D ripstop'],
                      ['Warranty', 'Lifetime, including hardware'],
                    ].map(([label, value]) => (
                      <Stack direction="horizontal" justify="between" key={label}>
                        <Text size="sm" tone="muted">
                          {label}
                        </Text>
                        <Text size="sm">{value}</Text>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </TabsPanel>
              <TabsPanel value="reviews">
                <Stack gap={3}>
                  {[
                    {
                      name: 'Sam O.',
                      stars: 5,
                      text: 'Flew with it for three weeks. It still looks new and the flat opening is the whole point.',
                    },
                    {
                      name: 'Devi K.',
                      stars: 4,
                      text: 'Excellent bag. The water bottle pocket is slightly too shallow for a 1L bottle.',
                    },
                  ].map((review) => (
                    <Card key={review.name} padding="md">
                      <Stack gap={2}>
                        <Stack align="center" direction="horizontal" gap={2}>
                          <Rating readOnly size="sm" value={review.stars} />
                          <Text size="sm" weight="medium">
                            {review.name}
                          </Text>
                        </Stack>
                        <Text size="sm">{review.text}</Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </TabsPanel>
            </TabsPanels>
          </Tabs>
        </Stack>
      </Container>
    </Section>
  )
}
