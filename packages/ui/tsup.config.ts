import { defineConfig } from 'tsup'

export default defineConfig({
  // Glob every source file as its own entry. Combined with `bundle: false` this gives
  // per-file output that mirrors src/, which is what preserves each file's own
  // 'use client' directive and maximizes tree-shaking.
  entry: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.*', '!src/**/*.d.ts'],
  bundle: false,
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  sourcemap: false,
  target: 'es2022',
  // Explicit rather than inherited: ESM keeps .js (the package is type: module),
  // CJS gets .cjs so Node resolves it as CommonJS.
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.js' : '.cjs' }),
})
