---
'@the_viveksingh/vivek-ui': minor
---

Make every public claim true — and make one of them a feature.

**`FAQ` now emits FAQPage structured data.** The docs claimed it already did; it did not.
Now it does, by default: schema.org `FAQPage` JSON-LD derived 1:1 from the visible items —
the markup an answer engine reads to quote a question and its answer directly. No other
component library ships this.

- Items whose `answer` is a string are included automatically; JSX answers join via the new
  `answerText` field; items with neither are rendered but left out of the schema.
- Nothing is emitted when the `children` escape hatch replaces the layout, because
  structured data must describe what is actually visible — Google's policy is explicit.
- Opt out with `structuredData={false}`.
- The payload is `JSON.stringify` output with `<` escaped to `<`, so item content
  containing `</script>` cannot break out of the tag — the classic JSON-LD injection, and
  FAQ content routinely comes from a CMS. A test proves it with hostile content.

This is the library's one and only `dangerouslySetInnerHTML` (JSON-LD has to be a raw
script body; React escapes text children, which corrupts JSON). A new test pins the budget
to exactly that file and asserts the escaping, so a second use anywhere fails CI. README
and SECURITY.md now state the precise budget instead of a blanket "none".

**`printElement()` works now.** Its docblock required `styles/print.css` — a file that was
never bundled or exported, so the shipped feature could not function. The stylesheet ships
as `@the_viveksingh/vivek-ui/print.css`, separate from `styles.css` so an app that never
prints pays nothing, and the packaging test gates the export.

**Corrections.** The security-report email in SECURITY.md and the published package
metadata was an undeliverable typo (`gmail.comom`) — vulnerability reports bounced. The
README's accessibility section contradicted the FAQ page (contrast is machine-verified,
twice — it said "reasoned"); the Playwright suite was listed as roadmap after it shipped;
the npm/yarn/pnpm verification claim is scoped to what CI actually proves until the install
matrix lands; "no required provider" now carries its one honest caveat (toasts, theme hook).
