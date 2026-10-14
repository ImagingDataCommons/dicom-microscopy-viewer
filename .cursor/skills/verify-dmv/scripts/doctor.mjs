#!/usr/bin/env node
/**
 * Read-only: is this checkout + harness worth driving?
 *   node doctor.mjs [--server <url>] [--study <uid>] [--series <uid>]
 * Exit 1 on any FAIL. WARN lines say what to run next.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_DATA, findChrome, isAlive, REPO_ROOT, RUN_DIR, readJSON, SERVER_STATE_FILE, serverHealth } from './lib.mjs'

const argv = process.argv.slice(2)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : DEFAULT_DATA[name]
}

let failed = false
const report = (level, msg) => {
  if (level === 'FAIL') failed = true
  console.log(`${level.padEnd(4)}  ${msg}`)
}

function newestMtime(dir) {
  let newest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) newest = Math.max(newest, newestMtime(p))
    else if (!entry.name.endsWith('.test.js')) newest = Math.max(newest, statSync(p).mtimeMs)
  }
  return newest
}

const srcMtime = newestMtime(join(REPO_ROOT, 'src'))
for (const [label, rel] of [
  ['dynamic-import build', 'dist/dynamic-import/dicomMicroscopyViewer.min.js'],
  ['bundle build', 'dist/dicomMicroscopyViewer.bundle.min.js'],
]) {
  const file = join(REPO_ROOT, rel)
  if (!existsSync(file)) {
    report('FAIL', `${label} missing (${rel}). Run: pnpm run build`)
    continue
  }
  const mtime = statSync(file).mtimeMs
  if (srcMtime > mtime) {
    report('WARN', `${label} is older than src/ (${new Date(mtime).toISOString()} < ${new Date(srcMtime).toISOString()}). Run: pnpm run build`)
  } else {
    report('OK', `${label} is current (${new Date(mtime).toISOString()})`)
  }
}

if (!existsSync(join(REPO_ROOT, 'node_modules/dicomweb-client/build/dicomweb-client.js'))) {
  report('FAIL', 'node_modules/dicomweb-client missing. Run: pnpm install')
} else {
  report('OK', 'dicomweb-client UMD build present')
}

const chrome = findChrome()
report(chrome ? 'OK' : 'FAIL', chrome ? `chrome: ${chrome}` : 'no Chrome/Chromium found; set CHROME_PATH')

const state = readJSON(SERVER_STATE_FILE)
if (!state) {
  report('WARN', 'harness server not started. Run: node .cursor/skills/verify-dmv/scripts/server.mjs start')
} else {
  const h = await serverHealth(state.port)
  if (!isAlive(state.pid) || !h) {
    report('FAIL', `recorded server pid ${state.pid} on port ${state.port} is not healthy. Run: server.mjs stop && server.mjs start`)
  } else if (h.pid !== state.pid || h.root !== REPO_ROOT) {
    report('FAIL', `port ${state.port} is served by pid ${h.pid} for ${h.root}, not this checkout. Pick another --port.`)
  } else {
    report('OK', `harness server pid ${state.pid}: http://127.0.0.1:${state.port}/harness`)
  }
}

if (existsSync(RUN_DIR)) {
  for (const f of readdirSync(RUN_DIR).filter((n) => n.startsWith('chrome-'))) {
    const c = readJSON(join(RUN_DIR, f))
    if (c && isAlive(c.pid)) report('WARN', `chrome pid ${c.pid} from an earlier drive is still running. Run: cleanup.mjs`)
  }
}

const server = opt('server')
const study = opt('study')
const series = opt('series')
try {
  const res = await fetch(`${server}/studies/${study}/series`, {
    headers: { accept: 'application/dicom+json' },
    signal: AbortSignal.timeout(15000),
  })
  const text = await res.text()
  const list = text ? JSON.parse(text) : []
  const found = list.find((s) => s['0020000E']?.Value?.[0] === series)
  if (!res.ok) report('FAIL', `DICOMweb QIDO returned HTTP ${res.status}`)
  else if (!found) report('FAIL', `DICOMweb reachable but series ${series} not in study ${study}`)
  else {
    const modalities = [...new Set(list.map((s) => s['00080060']?.Value?.[0]))].join(',')
    report('OK', `DICOMweb: study has ${list.length} series (${modalities}); slide series found`)
  }
} catch (e) {
  report('FAIL', `DICOMweb unreachable (${server}): ${e.message}`)
}

process.exit(failed ? 1 : 0)
