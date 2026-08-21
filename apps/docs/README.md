# Docs site

The public documentation for `@the_viveksingh/vivek-ui`, and the library's first real
consumer. It imports the package **by name** through the workspace, never by a relative path
into `packages/ui/src` — which is the point: building this site is what exercises the exports
map, the `'use client'` boundaries and the server-safety claims for real.

That has paid for itself. Bugs found only because this site exists:

- `Carousel` could not be rendered from a Server Component at all — it forwarded a callback
  across the client boundary.
- Compound components like `Tabs.List` read as `undefined` from a Server Component, because
  a client component arrives as a reference. The library now exports every part by name.
- `Clock` threw `TypeError: Invalid option` for any `dateStyle` or `timeStyle`.
- `.vk-calendar` collapsed to a narrow strip: `container-type` on an `inline-flex` box.
- The package did not export `./package.json`, which tooling routinely resolves.

## Running it

```bash
# From the repo root. The library must be built first - the site consumes dist/, not src/.
pnpm --filter @the_viveksingh/vivek-ui build
pnpm --filter docs dev            # http://localhost:3100

# Or in one step, rebuilding the library first:
pnpm --filter docs dev:all
```

Use `pnpm --filter @the_viveksingh/vivek-ui dev` in a second terminal to rebuild the library
on change.

## What is here

| Route | Content |
|---|---|
| `/` | Landing page, assembled entirely from the library's own section components |
| `/docs` | Guides: installation, theming, dark mode, RSC, accessibility, security, FAQ |
| `/docs/components/[slug]` | 83 pages: live preview, examples in TS and JS, generated props table |
| `/docs/charts/[slug]` | 6 chart pages, same shape |
| `/playground` | In-browser editor. Every library and chart export is already in scope |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Generated from the registry, so they cannot drift |

There is deliberately **no second app**. A separate Vite playground used to live at
`apps/playground`; it was a duplicate React toolchain maintained for coverage this site
already provides, and it is gone.

## How the pages are built

Two generated inputs, both produced by the build:

- **`registry.json`** — `scripts/gen-registry.mjs` runs the TypeScript compiler over the
  library's emitted `.d.ts` files and extracts every export, prop, type and doc comment. The
  props tables therefore cannot drift from the code. Regenerate with `pnpm gen:registry`.
- **`previews/<slug>.tsx` + `lib/example-sets/`** — hand-written, and they stay that way. A
  generated example is a render of the default props, which teaches nothing.

`scripts/check-examples.mjs` runs in the build and **fails** it if a component has no preview
module, no registry entry for its preview, or no example. That guard exists because 74 of 83
pages once silently fell back to "examples coming" with every test green.

## Conventions worth knowing before editing

- **The site is built only from the library.** No Tailwind, no second UI library, no icon
  package. If something is hard to build here, that is a finding about the library.
- **Nothing states a fact it cannot derive.** Component counts, the server-safe count and the
  version all come from the registry or the package. `lib/version.test.ts` and
  `lib/landing-facts.test.ts` fail on a hand-written version or a size claim that exceeds its
  own budget — both were wrong at one point, and a plausible-looking wrong number is invisible.
- **Colour is verified, not chosen.** `lib/accent.test.ts` checks all five accent presets in
  both themes for text contrast, foreground-on-accent, hover and active states, the subtle
  tint and the focus ring. The library has equivalent gates for its own tokens.

## Deploying

See [DEPLOY.md](./DEPLOY.md). The one thing that must be set before the first deploy is
`NEXT_PUBLIC_SITE_URL` — it is baked into every canonical URL, Open Graph tag and sitemap
entry at build time.
