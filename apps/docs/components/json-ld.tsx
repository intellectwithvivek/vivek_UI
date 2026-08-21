/**
 * Renders JSON-LD into the document.
 *
 * A Server Component, so the structured data is in the HTML the crawler receives rather
 * than being injected after hydration — several crawlers, including some answer engines,
 * do not run JavaScript at all, and one that does may still snapshot before it runs.
 */

/**
 * `<` is escaped because a string inside the data containing `</script>` would otherwise
 * close the tag early — the classic JSON-LD injection. Everything here is authored, but
 * component descriptions come from JSDoc in the library, so it is not worth relying on
 * that staying true.
 */
function serialise(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data : [data]
  return (
    <>
      {blocks.map((block, i) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has to be a raw script body; the payload is serialised with `<` escaped above
          dangerouslySetInnerHTML={{ __html: serialise(block) }}
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed, ordered list of static blocks per page
          key={i}
          type="application/ld+json"
        />
      ))}
    </>
  )
}
