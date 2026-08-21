# Docs site

**Lands in M3.**

This will be a Next.js + MDX site (deployed on Vercel) that consumes `vivek-ui` through the
workspace, so writing docs continuously exercises the real public API — the docs site is the
library's first production consumer.

Every component page will carry a live example, copyable code, a props table, theming notes, and —
for interactive components — its keyboard map and ARIA notes.

Until then, `apps/playground` is where components are developed and eyeballed:

```bash
pnpm --filter vivek-ui build
pnpm --filter playground dev
```

See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §11.
