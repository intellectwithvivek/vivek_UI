'use client'

import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  Image,
  Newsletter,
  RelativeTime,
  Section,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

/** A deterministic gradient rather than a stock photo — see `product.tsx` for the reasoning. */
const swatch = (from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="1200" height="675" fill="url(%23g)"/></svg>`,
  )}`

interface Post {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  published: string
  minutes: number
  cover: string
}

const POSTS: Post[] = [
  {
    slug: 'zero-dependencies',
    title: 'What zero dependencies actually costs you',
    excerpt:
      'Writing your own focus trap is a day. Auditing someone else’s, every quarter, for the life of the project, is not.',
    category: 'Engineering',
    author: 'Priya Raman',
    published: '2026-08-18',
    minutes: 9,
    cover: swatch('#22303f', '#4a6b8a'),
  },
  {
    slug: 'contrast',
    title: 'Your warning colour probably fails WCAG',
    excerpt:
      'Amber on white is the most common contrast failure in design systems, and it survives review because it looks fine to the person reviewing it.',
    category: 'Accessibility',
    author: 'Tom Okafor',
    published: '2026-08-09',
    minutes: 6,
    cover: swatch('#4a3a12', '#b58a2a'),
  },
  {
    slug: 'drag-and-drop',
    title: 'HTML5 drag-and-drop has no keyboard story',
    excerpt:
      'There is no key that starts a drag. None. Which is why almost every board on the web is unusable without a mouse, and what to build instead.',
    category: 'Accessibility',
    author: 'Priya Raman',
    published: '2026-07-30',
    minutes: 11,
    cover: swatch('#2f2145', '#6f5aa8'),
  },
  {
    slug: 'css-variables',
    title: 'Theming with custom properties, and nothing else',
    excerpt:
      'No provider, no build step, no re-render. One attribute on the html element and the whole system moves.',
    category: 'Design',
    author: 'Elena Vasquez',
    published: '2026-07-21',
    minutes: 7,
    cover: swatch('#123a33', '#3f8f7a'),
  },
  {
    slug: 'rsc',
    title: 'Which components really need to be client components',
    excerpt:
      'Far fewer than most libraries mark. An unbundled build lets you keep the directive per file instead of per package.',
    category: 'Engineering',
    author: 'Tom Okafor',
    published: '2026-07-06',
    minutes: 8,
    cover: swatch('#3d1f22', '#96525a'),
  },
]

const CATEGORIES = ['All', 'Engineering', 'Accessibility', 'Design']

export default function BlogPage() {
  const [category, setCategory] = useState('All')
  const shown = category === 'All' ? POSTS : POSTS.filter((post) => post.category === category)
  const [featured, ...rest] = shown

  return (
    <Section padding="lg">
      <Container size="lg">
        <Stack gap={8}>
          <Stack gap={2}>
            <Heading level={1} size="2xl">
              Writing
            </Heading>
            <Text size="lg" tone="muted">
              Notes on interface engineering, accessibility, and the parts of the job that do not
              fit in a changelog.
            </Text>
          </Stack>

          <div aria-label="Filter by category" role="group">
            <Stack direction="horizontal" gap={2} wrap>
              {CATEGORIES.map((item) => (
                <Button
                  aria-pressed={category === item}
                  key={item}
                  onClick={() => setCategory(item)}
                  size="sm"
                  variant={category === item ? 'solid' : 'outline'}
                >
                  {item}
                </Button>
              ))}
            </Stack>
          </div>

          {featured ? (
            <Card padding="none" variant="outline">
              <Grid gap={1} minItemWidth="20rem">
                <Image alt="" ratio={16 / 9} src={featured.cover} />
                <Stack gap={3} style={{ padding: 'var(--vk-space-6)' }}>
                  <Badge variant="soft">{featured.category}</Badge>
                  {/*
                    The link is on the heading, not wrapped around the whole card. A card-wide
                    link puts the image, the tag and the date inside the link text, so a
                    screen reader announces a paragraph where a title should be.
                  */}
                  <Heading level={2} size="xl">
                    <a href={`#${featured.slug}`}>{featured.title}</a>
                  </Heading>
                  <Text tone="muted">{featured.excerpt}</Text>
                  <Stack align="center" direction="horizontal" gap={2}>
                    <Avatar name={featured.author} size="sm" />
                    <Text size="sm" tone="muted">
                      {featured.author} · <RelativeTime date={featured.published} /> ·{' '}
                      {featured.minutes} min read
                    </Text>
                  </Stack>
                </Stack>
              </Grid>
            </Card>
          ) : null}

          <Grid gap={6} minItemWidth="17rem">
            {rest.map((post) => (
              <Card key={post.slug} padding="none" variant="outline">
                <Image alt="" ratio={16 / 9} src={post.cover} />
                <Stack gap={2} style={{ padding: 'var(--vk-space-5)' }}>
                  <Badge size="sm" variant="soft">
                    {post.category}
                  </Badge>
                  <Heading level={2} size="md">
                    <a href={`#${post.slug}`}>{post.title}</a>
                  </Heading>
                  <Text lineClamp={3} size="sm" tone="muted">
                    {post.excerpt}
                  </Text>
                  <Text size="sm" tone="muted">
                    {post.author} · <RelativeTime date={post.published} /> · {post.minutes} min
                  </Text>
                </Stack>
              </Card>
            ))}
          </Grid>

          {shown.length === 0 ? (
            <Text tone="muted">Nothing filed under {category} yet.</Text>
          ) : null}

          <Newsletter
            description="One email a month, with what we published and what we learned building it. Unsubscribe in one click."
            note="No tracking pixels, and we never pass your address on."
            onSubscribe={() => {}}
            title="Get the next one by email"
          />
        </Stack>
      </Container>
    </Section>
  )
}
