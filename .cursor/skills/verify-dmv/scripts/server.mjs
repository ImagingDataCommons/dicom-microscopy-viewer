#!/usr/bin/env node
/**
 * Static server for the verification harness. Serves the repo root so the
 * harness can load /dist and /node_modules exactly as a host app would.
 *
 *   node server.mjs start [--port 8765]   detached; waits until healthy
 *   node server.mjs status                prints state, exit 1 if not ours/up
 *   node server.mjs stop                  kills only the PID we recorded
 *   node server.mjs run [--port 8765]     foreground (used by start)
 */
import { spawn } from 'node:child_process'
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MARKER, REPO_ROOT, RUN_DIR, readJSON, SERVER_STATE_FILE as STATE_FILE, isAlive, serverHealth as health } from './lib.mjs'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.wasm': 'application/wasm',
  '.css': 'text/css',
  '.png': 'image/png',
}

const args = process.argv.slice(2)
const command = args[0] || 'status'
const portArg = args.indexOf('--port')
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.VERIFY_DMV_PORT || 8765)

const readState = () => readJSON(STATE_FILE)

function run() {
  /** Failed requests, so a drive can prove which assets (e.g. workers) were missing. */
  const misses = []
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    res.on('finish', () => {
      if (res.statusCode >= 400) misses.push({ at: Date.now(), status: res.statusCode, path: url.pathname })
      if (misses.length > 500) misses.shift()
    })
    if (url.pathname === '/__verify-dmv/misses') {
      const since = Number(url.searchParams.get('since') || 0)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(misses.filter((m) => m.at >= since)))
      return
    }
    if (url.pathname === '/__verify-dmv/health') {
      const bundle = join(REPO_ROOT, 'dist/dicomMicroscopyViewer.bundle.min.js')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          marker: MARKER,
          pid: process.pid,
          root: REPO_ROOT,
          bundleMtime: existsSync(bundle) ? statSync(bundle).mtimeMs : null,
        }),
      )
      return
    }
    if (url.pathname === '/' || url.pathname === '/harness') {
      res.writeHead(302, { location: '/.cursor/skills/verify-dmv/harness/index.html' })
      res.end()
      return
    }
    const filePath = normalize(join(REPO_ROOT, decodeURIComponent(url.pathname)))
    if (filePath !== REPO_ROOT && !filePath.startsWith(REPO_ROOT + sep)) {
      res.writeHead(403)
      res.end()
      return
    }
    let stat
    try {
      stat = statSync(filePath)
    } catch {
      res.writeHead(404)
      res.end('not found')
      return
    }
    if (!stat.isFile()) {
      res.writeHead(404)
      res.end('not a file')
      return
    }
    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] || 'application/octet-stream',
      'cache-control': 'no-store',
    })
    createReadStream(filePath).pipe(res)
  })
  server.on('error', (err) => {
    console.error(`[verify-dmv] server error: ${err.message}`)
    process.exit(1)
  })
  server.listen(port, '127.0.0.1', () => {
    console.log(`[verify-dmv] serving ${REPO_ROOT} at http://127.0.0.1:${port}/harness`)
  })
}

async function start() {
  const state = readState()
  if (state && isAlive(state.pid) && (await health(state.port))) {
    console.log(`already running: pid ${state.pid}, http://127.0.0.1:${state.port}/harness`)
    return
  }
  if (await health(port)) {
    console.error(`port ${port} already serves a verify-dmv instance we did not record (another checkout or agent). Use --port <other>.`)
    process.exit(1)
  }
  mkdirSync(RUN_DIR, { recursive: true })
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'run', '--port', String(port)], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  })
  child.unref()
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 100))
    const h = await health(port)
    if (h && h.pid === child.pid) {
      writeFileSync(STATE_FILE, JSON.stringify({ pid: child.pid, port, startedAt: new Date().toISOString() }, null, 2))
      console.log(`ready: pid ${child.pid}, http://127.0.0.1:${port}/harness`)
      return
    }
  }
  if (isAlive(child.pid)) process.kill(child.pid)
  console.error(`server did not become healthy on port ${port} (port in use by something else?)`)
  process.exit(1)
}

async function status() {
  const state = readState()
  if (!state) {
    console.log('not running (no state file)')
    process.exit(1)
  }
  const h = await health(state.port)
  const ok = isAlive(state.pid) && h && h.pid === state.pid && h.root === REPO_ROOT
  console.log(JSON.stringify({ ...state, alive: isAlive(state.pid), healthy: Boolean(ok), root: h?.root }, null, 2))
  process.exit(ok ? 0 : 1)
}

function stop() {
  const state = readState()
  if (!state) {
    console.log('nothing to stop')
    return
  }
  if (isAlive(state.pid)) {
    process.kill(state.pid)
    console.log(`stopped pid ${state.pid}`)
  } else {
    console.log(`pid ${state.pid} already gone`)
  }
  rmSync(STATE_FILE, { force: true })
}

if (command === 'run') run()
else if (command === 'start') await start()
else if (command === 'status') await status()
else if (command === 'stop') stop()
else {
  console.error(`unknown command "${command}"`)
  process.exit(2)
}
