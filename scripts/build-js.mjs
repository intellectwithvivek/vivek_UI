#!/usr/bin/env node
/**
 * Run tsup with a raised heap.
 *
 * The per-file build (`bundle: false`) means tsup hands ~250 entry points to its
 * declaration worker, which rollups each one. That exhausts the default ~2 GB heap and
 * dies with ERR_WORKER_OUT_OF_MEMORY partway through, after the JS has been written —
 * so the build "half succeeds", which is worse than failing outright.
 *
 * `NODE_OPTIONS` rather than a `--max-old-space-size` flag on this process, because the
 * limit has to reach tsup's worker thread, and NODE_OPTIONS is inherited where a
 * command-line flag on the parent is not. Done in a script rather than inline in
 * package.json so it works the same in cmd.exe, PowerShell and sh.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const HEAP_MB = Number(process.env.VK_BUILD_HEAP_MB ?? 8192)

// Resolve from the CWD (packages/ui), not from this file: pnpm keeps tsup in the
// package's own node_modules, and this script lives at the repo root where it is absent.
const require = createRequire(pathToFileURL(join(process.cwd(), 'package.json')))
let tsupCli
try {
  tsupCli = require.resolve('tsup/dist/cli-default.js')
} catch {
  try {
    tsupCli = require.resolve('tsup/dist/cli-node.js')
  } catch {
    console.error(
      `build-js: cannot resolve tsup from ${process.cwd()}. Run \`pnpm install\` first.`,
    )
    process.exit(1)
  }
}

const existing = process.env.NODE_OPTIONS ?? ''
const nodeOptions = /--max-old-space-size/.test(existing)
  ? existing
  : `${existing} --max-old-space-size=${HEAP_MB}`.trim()

const child = spawn(process.execPath, [tsupCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`build-js: tsup terminated by ${signal}.`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(`build-js: failed to start tsup - ${error.message}`)
  process.exit(1)
})
