# VivekUI — Working Agreement

> Source of truth: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (v0.2). Read it before changing
> anything structural. If this file and that document ever conflict, **stop and ask** — do not improvise.

## Identity

| Thing | Value |
|---|---|
| Published package | `@the_viveksingh/vivek-ui` (the **only** published package) |
| Class prefix | `vk-` (e.g. `.vk-button`) — **public API** |
| Token prefix | `--vk-` (e.g. `--vk-color-primary`) — **public API** |
| License | MIT |
| Peer range | `react` / `react-dom` `^18.0.0 || ^19.0.0` |
| Node / pnpm | Node >= 20, pnpm >= 9 |

## Non-Negotiable Constraints

Violating any of these is wrong — redo it.

1. **Zero runtime dependencies.** `packages/ui/package.json` has NO `dependencies` field at all.
   `react`/`react-dom` live in `peerDependencies` (and `devDependencies` for local dev/tests) only.
   Never install `clsx`, `classnames`, `styled-components`, `emotion`, `tailwind`, `radix`, or any
   other runtime package into the library. Utilities we need (`cx`, `Slot`, `mergeRefs`, focus trap,
   positioning) are written in-house.
2. **Styling = static CSS + CSS custom properties + data-attributes.** No CSS-in-JS, no Tailwind,
   no CSS Modules. Variants map to `data-variant` / `data-size` / `data-*` attributes. Every library
   selector is wrapped in `:where()` for zero specificity, so user CSS always wins (§3.2).
3. **CSS is decoupled from JS.** Component `.tsx` files never import CSS. All CSS is bundled at build
   time into a single `dist/styles.css` from `src/styles/entry.css`, which `@import`s reset, tokens,
   and each component's `.css` (§3.4).
4. **Per-file (unbundled) JS build.** tsup with `bundle: false`, emitting ESM + CJS + `.d.ts` while
   preserving module structure, so each file keeps its own `'use client'` directive (§5, §8.2).
   Test files must never appear in `dist`.
5. **Naming is public API.** Renaming a `vk-` class or a `--vk-` token is a MAJOR bump (§10.1).
6. **Component contract (§4.1).** Merge incoming `className`/`style` (never replace); spread `...rest`
   onto the root element; forward refs via `forwardRef`; render sensibly with zero props;
   TypeScript `strict`.
7. **Tooling.** pnpm workspaces · TypeScript strict · Biome (lint + format) · Vitest +
   @testing-library/react + vitest-axe · Changesets.
8. **`sideEffects: false`** and a correct `exports` map. Only add an `exports` entry once the file it
   points at actually exists — a dangling subpath breaks consumers. (M0 ships `"."` and
   `"./styles.css"` only; `./icons` lands with the icon generator, `./charts` at v1.3.)
9. **Server-safe by default.** No `window`/`document` at module scope. `'use client'` only on files
   that genuinely need state, effects, or event handlers.
10. **Never publish from an agent session.** Prepare the release, then hand Vivek the exact commands.

## Definition of Done (§9)

A component is not done until **all** of these hold:

- [ ] Types exported (component + its `Props` interface)
- [ ] Zero-props render works
- [ ] Tests pass, including a `vitest-axe` a11y assertion
- [ ] Keyboard map implemented (if interactive), per WAI-ARIA Authoring Practices
- [ ] Docs page with a live example + props table
- [ ] Changeset added

Repo-wide gates (CI blocks merge on red): `typecheck` -> `lint` -> `test` -> `build` -> `size-limit`.

## Milestones (§14)

| Milestone | Deliverable |
|---|---|
| **M0 · Prove the pipe** | Monorepo scaffold, tokens, build pipeline, CI, Changesets, docs skeleton, one perfect Button — published as `0.1.0-next.0` |
| M1 · Primitives | Phase 1 (Box/Stack/Grid/Heading/Text/Badge/Card/Avatar/Spinner/Skeleton/Alert…) + core icon set (~60) + playground |
| M2 · Forms | Phase 2 (Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, FileInput) + `useControllableState` |
| M3 · Sections + docs | Phase 3 (Navbar, Hero, Footer, Pricing, FAQ, CTA, Stats, Sidebar…), docs site live, **public 0.8 launch** |
| M4 · Overlays & a11y | Phase 4 (Tabs, Accordion, Tooltip, Popover, DropdownMenu, Modal, Drawer, Toast…) + the six a11y utilities (§6) |
| M5 · Polish | **v1.0.0** — full docs, size budgets green, migration notes |
| M6 · v1.1 | Icon set to 150+, Combobox, CommandPalette, OTPInput, Rating, Carousel |
| M7 · v1.2 | **DataTable** (sort/search/paginate/select, responsive stack mode) |
| M8 · v1.3 | **`@the_viveksingh/vivek-ui/charts`** — Sparkline, Line, Area, Bar, Pie/Donut, ProgressRing |

**Do not scaffold beyond the current milestone.** Sequencing is what gets this shipped instead of
abandoned at thirty half-finished components (§1.3).

## Commands

```bash
pnpm install
pnpm -r typecheck        # tsc --noEmit per package
pnpm lint               # biome check .
pnpm -r test            # vitest run
pnpm -r build           # tsup + lightningcss + directive check
pnpm --filter @the_viveksingh/vivek-ui size   # size-limit budgets
pnpm changeset          # required on every PR that touches packages/ui
```

## Conventions

- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`).
- One component per directory: `component.tsx`, `component.css`, `component.test.tsx`, `index.ts`.
- Every new component `.css` gets an `@import` line in `src/styles/entry.css`.
- Internal `hooks/` and `utils/` are **not** exported from `src/index.ts` — they stay refactorable.
