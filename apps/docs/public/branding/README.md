# Brand assets

Drop your own files in this folder. **The filenames matter** — the site reads exactly these
names, so a file named anything else is ignored silently.

| File | Size | Used for |
|---|---|---|
| `favicon.ico` | 32×32 (16+32 multi-size ideal) | Browser tab, bookmarks. The only one older browsers reliably read. |
| `icon.svg` | any (vector) | Modern browsers. Preferred when present — sharp at every size. |
| `icon-192.png` | 192×192 | Android home screen, PWA install prompt. |
| `icon-512.png` | 512×512 | Android splash screen. |
| `apple-icon.png` | 180×180 | iOS home screen. **No transparency** — iOS composites it on black, so a transparent logo comes out unreadable. |

## What is here already

`icon.svg` is a **placeholder** — a plain "V" on the brand blue. Overwrite it with your own
file of the same name and you are done; there is no code to change. Delete it and the site
falls back to `app/icon.tsx`, which generates the same mark at build time, so the site is
never iconless either way.

Detection is automatic: `lib/branding.ts` checks this folder at build time and links only the
files that exist. Nothing to wire up, and no browser requesting an icon that is not there.

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
