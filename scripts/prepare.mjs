#!/usr/bin/env node
/**
 * pnpm/npm prepare hook:
 * - install husky when developing inside a git checkout
 * - build dist/ when missing (git dependency installs / CI consumers)
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distEntry = join(root, 'dist', 'dicomMicroscopyViewer.bundle.min.js')

if (existsSync(join(root, '.git'))) {
  spawnSync('pnpm', ['exec', 'husky'], { cwd: root, stdio: 'inherit' })
}

if (!existsSync(distEntry)) {
  console.info('[prepare] dist/ missing — running webpack build')
  const result = spawnSync('pnpm', ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
