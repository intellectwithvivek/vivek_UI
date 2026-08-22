---
'@the_viveksingh/vivek-ui': patch
---

Fix TypeScript types resolving incorrectly for CommonJS consumers.

The `exports` map pointed both the `import` and `require` conditions at the same
`dist/index.d.ts`. Because the package is `"type": "module"`, that declaration file is
ESM-flavoured — so a project doing `require('@the_viveksingh/vivek-ui')` under
`moduleResolution: node16`/`nodenext` got **ESM type declarations for a file Node actually
loads as CommonJS**. `@arethetypeswrong/cli` calls this `FalseESM`, "Masquerading as ESM".

In practice that meant a CJS TypeScript consumer could see spurious type errors, or types
that only worked via a dynamic `import()`. The runtime code was always correct; only the
declarations were mis-mapped.

Both entrypoints now declare types per condition, pointing `require` at the `.d.cts` files
the build was already emitting:

```json
".": {
  "import": { "types": "./dist/index.d.ts",  "default": "./dist/index.js" },
  "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
}
```

`@arethetypeswrong/cli` is now fully green across node10, node16 (from CJS), node16 (from
ESM) and bundler for both `.` and `./charts`, and `publint` reports no issues. Both tools run
in CI, so this class of defect cannot return — every existing test passed while it was
broken, because the tests only ever import the ESM build.

Also adds `engines.node: ">=18"`, which `publint` was flagging as missing. It is deliberately
permissive: the published code is browser JavaScript plus type declarations and uses no Node
API, so a tighter floor would only produce spurious install warnings.
