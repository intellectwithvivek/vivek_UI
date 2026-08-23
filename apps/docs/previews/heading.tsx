import { Heading, Stack } from '@the_viveksingh/vivek-ui'

/*
 * Levels 3 to 6, not 1 to 4.
 *
 * `Heading level={1}` renders a real `<h1>`, so the original version of this preview gave
 * this page two of them and skipped from the section's `<h2>` straight to an `<h4>`. A
 * second `<h1>` splits the page's topic signal for a search engine and breaks the outline a
 * screen-reader user navigates by. The mapping from `level` to tag is just as visible from
 * three onwards, and the docs page keeps a valid outline.
 */
export default function HeadingPreview({ name }: { name: string }) {
  if (name === 'sizeVsLevel') {
    return (
      <Stack gap={3}>
        <Heading level={3} size="md">
          An h3 that looks small
        </Heading>
        <Heading level={4} size="2xl">
          An h4 that looks large
        </Heading>
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Heading level={3}>Level 3</Heading>
      <Heading level={4}>Level 4</Heading>
      <Heading level={5}>Level 5</Heading>
      <Heading level={6}>Level 6</Heading>
    </Stack>
  )
}
