#!/usr/bin/env node
/**
 * Tear down what this skill started: the recorded harness server and any
 * Chrome process groups a crashed drive left behind (plus their temp
 * profiles). Never kills by process name. Never touches .evidence/.
 */
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { EVIDENCE_DIR, isAlive, RUN_DIR, readJSON, SERVER_STATE_FILE } from './lib.mjs'

const server = readJSON(SERVER_STATE_FILE)
if (server) {
  if (isAlive(server.pid)) {
    process.kill(server.pid)
    console.log(`stopped harness server pid ${server.pid}`)
  }
  rmSync(SERVER_STATE_FILE, { force: true })
}

if (existsSync(RUN_DIR)) {
  for (const f of readdirSync(RUN_DIR).filter((n) => n.startsWith('chrome-'))) {
    const c = readJSON(join(RUN_DIR, f))
    if (c && isAlive(c.pid)) {
      try {
        process.kill(-c.pid, 'SIGKILL')
      } catch {
        process.kill(c.pid, 'SIGKILL')
      }
      console.log(`killed leftover chrome pid ${c.pid}`)
    }
    if (c?.profile) rmSync(c.profile, { recursive: true, force: true })
    rmSync(join(RUN_DIR, f), { force: true })
  }
  rmSync(RUN_DIR, { recursive: true, force: true })
}

console.log(`evidence kept in ${EVIDENCE_DIR}`)
