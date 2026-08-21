import { Prose } from '@the_viveksingh/vivek-ui'

export default function ProsePreview({ name }: { name: string }) {
  if (name === 'link') {
    return (
      <Prose>
        <p>
          Prose.Link refuses an unsafe href: a <code>javascript:</code> URL renders as inert text
          rather than a clickable link, so untrusted markdown cannot smuggle script through.{' '}
          <Prose.Link href="https://vivekkumarsingh.in/">A safe link still works.</Prose.Link>
        </p>
      </Prose>
    )
  }
  return (
    <Prose>
      <h3>Long-form content</h3>
      <p>
        Prose styles raw HTML you did not author - markdown output, a CMS body, a changelog -
        without needing a class on every element.
      </p>
      <ul>
        <li>Headings, lists and blockquotes pick up the type scale</li>
        <li>
          <code>code</code> and <a href="https://vivekkumarsingh.in/">links</a> inherit the tokens
        </li>
      </ul>
      <blockquote>Everything here is plain HTML inside one Prose wrapper.</blockquote>
    </Prose>
  )
}
