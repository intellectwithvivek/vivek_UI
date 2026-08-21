# Deploying the docs site

## One thing to set before the first deploy

The base URL is baked into every canonical link, Open Graph tag, sitemap entry and JSON-LD
block at build time. It has to be right, or search engines index URLs that do not resolve.

Set this in **Vercel → Project → Settings → Environment Variables**, for Production
(and Preview, if you want preview links to be self-consistent):

```
NEXT_PUBLIC_SITE_URL = https://vivekui.vivekkumarsingh.in
```

> **Check the spelling of the host.** You wrote `vivekui-vivekkumarsingh.in`. I have used
> `vivekui.vivekkumarsingh.in` — a subdomain of your existing site — because that is what
> "sub domain" means and it is what your DNS is already set up to serve. If you genuinely
> registered the hyphenated domain `vivekui-vivekkumarsingh.in` as a separate name, set the
> variable to that instead. Nothing else in the codebase needs changing: the value flows
> from `lib/site.ts` to everything else.

If the variable is unset the build falls back to `https://vivekui.vivekkumarsingh.in`, so a
local build still produces absolute URLs. It is not a substitute for setting it.

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
| CNAME | `vivekui` | `cname.vercel-dns.com` |

Then add `vivekui.vivekkumarsingh.in` under **Vercel → Project → Settings → Domains**.
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
