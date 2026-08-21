# Changesets

This folder holds pending changesets — one Markdown file per unreleased change.

Every PR that touches `packages/ui` must add one:

```bash
pnpm changeset
```

Pick the bump type using the SemVer policy in [CONTRIBUTING.md](../CONTRIBUTING.md). On merge to
`main`, the Changesets action opens a **"Version Packages"** PR that applies the bumps and writes
`CHANGELOG.md`; merging that PR publishes to npm.

Full docs: <https://github.com/changesets/changesets>
