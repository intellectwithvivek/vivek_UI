# Brand assets

Drop your own files in this folder. **The filenames matter** — the site reads exactly these
names, so a file named anything else is ignored silently.

These are exactly the names [realfavicongenerator.net](https://realfavicongenerator.net)
produces, so its output drops in unrenamed. The second column lists alternatives that also
work if you are generating them some other way.

| File | Also accepted | Size | Used for |
|---|---|---|---|
| `favicon.ico` | — | 32×32 (16+32 multi-size ideal) | Browser tab, bookmarks. The only one older browsers reliably read. |
| `favicon.svg` | `icon.svg` | vector | Modern browsers. **Preferred over the others when present**, so it must be a real vector — see the size limits below. |
| `favicon-96x96.png` | `icon-96.png` | 96×96 | Higher-resolution tab icon. |
| `web-app-manifest-192x192.png` | `icon-192.png` | 192×192 | Android home screen, install prompt. |
| `web-app-manifest-512x512.png` | `icon-512.png` | 512×512 | Android splash screen. |
| `apple-touch-icon.png` | `apple-icon.png` | 180×180 | iOS home screen. **No transparency** — iOS composites on black, so a transparent logo comes out unreadable. |

## Size limits, and why they differ

`lib/branding.test.ts` enforces these, because an oversized icon is invisible on the site and
expensive for every visitor.

| Fetched | Files | Limit each | Total |
|---|---|---|---|
| Every page load | `.ico`, `.svg`, `96x96` | 100 KB | 150 KB |
| Only on install | `192`, `512`, `apple-touch` | 600 KB | — |

The tight budget on the first group is not theoretical. The SVG originally added here was a
1528×1592 PNG base64-embedded inside an `<svg>` wrapper: **4.8 MB, and no vector geometry at
all**. Because browsers prefer an SVG when one is offered, that was the favicon being
downloaded on every single page view. It was removed, and there is now a test that fails on
an `<svg>` containing an embedded raster and no `<path>`.

If you want a genuine vector icon, it has to be exported *as* vector from the design tool —
"Save as SVG" on a bitmap just wraps the bitmap. Without one, the `.ico` and the PNGs cover
every browser perfectly well.

## What is here already

A real icon set: `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png` and the two
manifest PNGs. Replace any of them by overwriting the file — there is no code to change.

Detection is automatic: `lib/branding.ts` checks this folder at build time and links only the
files that exist. If you emptied the folder entirely the site would still have an icon, from
`app/icon.tsx`, which generates one from the brand colour.

## Getting the files

One source SVG is enough. https://realfavicongenerator.net takes an SVG and emits every size
above. Two things to check on the way out:

- **Draw for 16×16 first.** A logo with fine detail turns to mud in a tab. If the mark has
  thin strokes or small text, make a simplified version for the icon rather than shrinking
  the full logo.
- **Give `apple-icon.png` an opaque background.** This is the single most common mistake, and
  it only shows up once someone adds the site to an iPhone home screen.

## Checking it worked

```bash
pnpm --filter docs build
```

`lib/branding.test.ts` asserts that every file present here is wired into the metadata, and
that anything the metadata references actually exists — so a typo in a filename fails the
build instead of shipping a broken icon link.
