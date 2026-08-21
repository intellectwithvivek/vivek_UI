# Contributing to VivekUI

Thanks for helping out. This document covers setup, the change flow, and the bar a component has to
clear before it ships.

Read [The hard rules](#the-hard-rules) below before proposing anything structural. They are not
style preferences — they are the constraints the whole library is built on, and a change that
breaks one will be sent back.

## Setup

Requires **Node >= 22** and **pnpm >= 9**. Node 20 reached end of life in April 2026, and
several dev dependencies (jsdom, size-limit, @testing-library/jest-dom) have dropped it.

```bash
git clone https://github.com/intellectwithvivek/vivek_UI.git
cd vivek_UI
pnpm install
```

```bash
pnpm -r build          # build the library (tsup + LightningCSS + directive check)
pnpm --filter playground dev   # Vite playground at http://localhost:5173

pnpm -r test           # Vitest
pnpm -r typecheck      # tsc --noEmit
pnpm lint              # biome check .
pnpm lint:fix          # biome check --write .
pnpm --filter @the_viveksingh/vivek-ui size    # size-limit budgets
```

The playground imports `@the_viveksingh/vivek-ui` **by package name**, never by a relative path into
`packages/ui/src`. Keep it that way — it is what makes the playground a genuine test of the exports
map. Run `pnpm --filter @the_viveksingh/vivek-ui build` (or `pnpm --filter @the_viveksingh/vivek-ui dev` to watch) before it picks
up your changes.

## Repository shape

```
packages/ui/          the only published package
  src/components/     one directory per component
  src/styles/         reset.css, tokens.css, entry.css
  src/utils/          internal, NOT exported from the package entry
apps/playground/      Vite app for local development
apps/docs/            Next.js + MDX docs site (M3)
scripts/              build guards
```

Adding a component means four files plus one line:

```
src/components/thing/thing.tsx        no CSS import in here, ever
src/components/thing/thing.css        every selector :where()-wrapped
src/components/thing/thing.test.tsx
src/components/thing/index.ts
```

...then add `@import '../components/thing/thing.css';` to `src/styles/entry.css`, and export the
component and its props type from `src/index.ts`. Copy `button/` — it is the reference
implementation, and consistency across components is a feature.

## The hard rules

These are not style preferences. A PR that breaks one will be sent back.

1. **No runtime dependencies.** `packages/ui/package.json` has no `dependencies` field. Not `clsx`,
   not `radix`, not anything. We write the utility ourselves — see `src/utils/cx.ts`, five lines
   replacing a dependency.
2. **No CSS-in-JS, no Tailwind, no CSS Modules.** Static CSS, custom properties, and
   `data-*` attributes for variants.
3. **No CSS imports in `.tsx` files.** CSS reaches users only through the bundled
   `dist/styles.css`.
4. **Every selector wrapped in `:where()`.** Zero specificity is what lets consumers override us
   without an `!important` war.
5. **Every value from a `--vk-*` token.** No hard-coded colors, spacing, or radii in component CSS.
6. **`'use client'` only when earned** — real state, effects, or event handlers. Never touch
   `window` or `document` at module scope; the SSR pass must not crash.
7. **The component contract**: merge `className`/`style`, spread `...rest` onto the root, forward the
   ref, render sensibly with zero props.

## Definition of done

A component is not finished until all of these are true:

- [ ] Component and its `Props` interface are exported from `src/index.ts`
- [ ] Zero-props render works
- [ ] Tests pass, including a `vitest-axe` assertion with no violations
- [ ] Keyboard map implemented, if interactive, per the WAI-ARIA Authoring Practices pattern
- [ ] Docs page with a live example and a props table
- [ ] Changeset added

## Change flow

1. Branch off `main`.
2. Make your change. Keep commits [Conventional](https://www.conventionalcommits.org/):
   `feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`.
3. **Add a changeset** for anything touching `packages/ui`:

   ```bash
   pnpm changeset
   ```

   Pick the bump with the table below and write the summary for a *user* reading release notes, not
   for a reviewer reading the diff.
4. Make sure `pnpm lint && pnpm -r typecheck && pnpm -r test && pnpm -r build` is green.
5. Open a PR. CI runs the same gates and blocks merge on red.

Maintainers do the rest: merging to `main` opens a **"Version Packages"** PR, and merging that
publishes to npm with provenance.

## SemVer policy

Class names and CSS custom properties are public API. Users target them for overrides, so renaming
one breaks their site just as surely as renaming a prop.

| Change | Bump |
|---|---|
| Remove or rename a prop, component, `vk-` class, or `--vk-` custom property | **major** |
| Drop a supported React version | **major** |
| New component, new prop, new token (additive) | **minor** |
| Bug fix, a11y fix, docs | **patch** |
| Visual change that might break consumer overrides | patch/minor **+ an explicit release-note callout** |

Deprecate before removing: mark with a JSDoc `@deprecated`, add a dev-only `console.warn`, and keep
it working for at least one minor.

## Scope and sequencing

The [public roadmap](https://github.com/intellectwithvivek/vivek_UI/issues) is ordered on purpose,
and staying in order is what gets the full catalog shipped rather than abandoned at thirty
half-finished components. If you want to build
something from a later milestone, open an issue first — enthusiasm is welcome, but a component that
lands without its a11y utilities, docs, and tests costs more than it adds.

Requests drive priority: a Tier B or C component with real demand jumps the queue.

## Note on this file

`packages/ui/README.md` mirrors the root `README.md` (with links made absolute so they resolve on
npm). Edit the root file, then copy it across — npm always publishes the README next to the
`package.json`, so the package needs its own copy.
