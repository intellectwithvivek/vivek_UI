---
'@the_viveksingh/vivek-ui': major
---

**1.0.0** — the stable release. One package, 109 components, 10 charts, zero runtime
dependencies, and an API that will not move for the next two years of minors.

This is the release the pre-1.0 line was working towards, and it lands as one version rather
than a trail of deprecations: everything below the fold of this changelog — the API canon
(`value` / `defaultValue` / `onValueChange`, `size`, `tone`, `invalid`, required labels on
unlabelled widgets, `asChild` everywhere a child can be the element), the twenty-two new
components since 0.5, the section variants, the four charts, the hardening gates — ships
together and is what 1.x is measured against.

**What "stable" means here**

- Every `vk-` class and `--vk-` token is public API; renaming one is a 2.0.
- Every exported prop is documented in the props table generated from the declarations, and
  every component page has a live example.
- Every component has a `vitest-axe` assertion, a keyboard map from the WAI-ARIA Authoring
  Practices where it is interactive, and is hydrated in the SSR sweep.
- Gates that fail the build, not a checklist: §4.1 contract, leaks, hydration, logical
  properties, reduced motion, dangerouslySetInnerHTML budget, packaging, install matrix
  (npm / yarn / pnpm), Node 18 and 20, React 18 and 19, three-viewport browser axe.

**Migrating from 0.x**: see `/docs/migration`. Renames are listed one per line with the
before and after; nothing was removed without a replacement.
