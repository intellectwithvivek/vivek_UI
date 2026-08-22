# Deploying the docs site

## Do NOT set NEXT_PUBLIC_SITE_URL

The canonical host lives in `lib/site.ts` as `CANONICAL_SITE_URL`. Nothing needs configuring.

**If `NEXT_PUBLIC_SITE_URL` is set in the Vercel dashboard, delete it.** An earlier version of
this file told you to set it, to a subdomain that was guessed before the real one existed, and
the result was live for a while: every canonical tag, all 106 sitemap URLs and the `robots.txt`
Sitemap directive pointed at `ui.vivekkumarsingh.in`, which does not resolve. The site
looked perfect in a browser, because the dead host only appears in the machine-readable tags -
and a crawler following that sitemap gets 106 connection failures while the canonical tags tell
it the real page lives at a host that is not there. That is enough to keep a site out of the
index entirely.

An explicitly-set environment variable beats the source, so correcting the code did not fix it.
The variable is still supported for a fork or a rename, and `assertSiteUrl()` now prints a loud
warning in the build log whenever it disagrees with the constant - but for this deployment it
should simply not exist.

If the host ever changes, edit `CANONICAL_SITE_URL` in `lib/site.ts` and redeploy. One line,
one place, and it flows into every canonical link, Open Graph URL, sitemap entry, JSON-LD block
and `llms.txt` line.

Preview deployments are automatically `noindex` (`VERCEL_ENV === 'preview'`), so a branch
preview cannot compete with production for the same content.

## Vercel project settings

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | `apps/docs` |
| Build command | from `vercel.json` — leave the dashboard field empty |
| Install command | from `vercel.json` — leave the dashboard field empty |
| Node version | 22.x |

The build command deliberately runs `pnpm --filter docs build`, not `next build`, because
the package script also runs `gen-registry.mjs` (which regenerates the props tables from the
library's type declarations) and `check-examples.mjs` (which fails the build if a component
has no preview or no example). Calling `next build` directly skips both and can ship a docs
site whose props tables are stale.

## DNS

For a subdomain of an existing domain, add one record at your DNS provider:

| Type | Name | Value |
|---|---|---|
| CNAME | `ui` | `cname.vercel-dns.com` |

Then add `ui.vivekkumarsingh.in` under **Vercel → Project → Settings → Domains**.
Vercel issues the TLS certificate automatically once the record propagates.

Do **not** also point the apex domain at this project — `vivekkumarsingh.in` is your main
site, and two projects claiming the same host is the usual cause of a certificate that never
issues.

## After the first deploy

1. **Confirm the generated files resolve.** All three are prerendered, so they should be
   instant:
   - `/sitemap.xml` — 106 URLs
   - `/robots.txt` — points at the sitemap, and allows AI crawlers on purpose
   - `/llms.txt` — the plain-text index for language models
2. **Submit the sitemap** in [Google Search Console](https://search.google.com/search-console)
   and [Bing Webmaster Tools](https://www.bing.com/webmasters). Bing matters more than its
   market share suggests — it is what ChatGPT search and Copilot are grounded on.
3. **Validate the structured data** with the
   [Rich Results Test](https://search.google.com/test/rich-results). Check one component
   page (`SoftwareSourceCode` + `TechArticle` + `BreadcrumbList`), `/docs/faq` (`FAQPage`),
   and `/docs/installation` (`HowTo`).
4. **Check a social card** with the
   [OpenGraph debugger](https://www.opengraph.xyz/). Every component and chart page renders
   its own card at build time.

## A note on the AI crawler decision

`app/robots.ts` **allows** GPTBot, ClaudeBot, PerplexityBot, Google-Extended and a dozen
others by name. That is deliberate and it is a distribution decision, not a technical one:
an answer engine that cannot read these pages cannot recommend the library when a developer
asks for one. The content is MIT-licensed documentation for a free package, so there is
nothing to protect by blocking them.

To reverse it, change `allow` to `disallow` in the second rule block. One edit.
