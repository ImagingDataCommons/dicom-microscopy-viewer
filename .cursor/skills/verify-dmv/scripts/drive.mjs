#!/usr/bin/env node
/**
 * Drive the harness in an isolated headless Chrome over raw CDP and write
 * evidence to .evidence/<timestamp>-<journey>/.
 *
 *   node drive.mjs --journey <name> [options]
 *   node drive.mjs --list
 *
 * Options:
 *   --port <n>          harness server port (default: from .run/server.json)
 *   --server <url>      DICOMweb root     (default: IDC public proxy)
 *   --study <uid>       StudyInstanceUID
 *   --series <uid>      slide SeriesInstanceUID
 *   --build <dynamic|bundle>  which dist build the harness loads (default dynamic)
 *   --seg <uid,...|auto>  SEG series for the segmentation journey
 *   --ann <uid,...|auto>  ANN series for the annotations journey
 *   --headed            show the browser window
 *   --timeout <ms>      per-wait timeout (default 90000)
 *
 * Exit code 0 only if every check passed.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import {
  DEFAULT_DATA,
  decodePNG,
  EVIDENCE_DIR,
  findChrome,
  imageDiff,
  imageStats,
  REPO_ROOT,
  RUN_DIR,
  readJSON,
  SERVER_STATE_FILE,
  serverHealth,
} from './lib.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  if (i < 0) return fallback
  const v = argv[i + 1]
  return v === undefined || v.startsWith('--') ? true : v
}

const VIEW_W = 1280
const VIEW_H = 900
const STATUS_BAR_H = 28
const VIEWPORT_RECT = { x0: 0, y0: STATUS_BAR_H, x1: VIEW_W, y1: VIEW_H }
const TIMEOUT = Number(flag('timeout', 90000))

class CDP {
  constructor(url) {
    this.url = url
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Map()
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)
      this.ws.onopen = () => resolve()
      this.ws.onerror = (e) => reject(new Error(`CDP websocket error: ${e.message || e.type}`))
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data)
        if (data.id && this.pending.has(data.id)) {
          const { resolve: ok, reject: ko, method } = this.pending.get(data.id)
          this.pending.delete(data.id)
          if (data.error) ko(new Error(`${method}: ${data.error.message}`))
          else ok(data.result)
        } else if (data.method) {
          for (const fn of this.listeners.get(data.method) || []) fn(data.params)
        }
      }
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }))
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, [])
    this.listeners.get(method).push(fn)
  }

  close() {
    try {
      this.ws?.close()
    } catch {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launchChrome(headed) {
  const chromePath = findChrome()
  if (!chromePath) throw new Error('No Chrome/Chromium found. Set CHROME_PATH.')
  const profile = mkdtempSync(join(tmpdir(), 'verify-dmv-chrome-'))
  const args = [
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    `--window-size=${VIEW_W},${VIEW_H}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--mute-audio',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    'about:blank',
  ]
  if (!headed) args.unshift('--headless=new')
  const proc = spawn(chromePath, args, { detached: true, stdio: ['ignore', 'ignore', 'pipe'] })
  mkdirSync(RUN_DIR, { recursive: true })
  const stateFile = join(RUN_DIR, `chrome-${proc.pid}.json`)
  writeFileSync(stateFile, JSON.stringify({ pid: proc.pid, profile, startedAt: new Date().toISOString() }))

  const wsUrl = await new Promise((resolve, reject) => {
    let buf = ''
    const timer = setTimeout(() => reject(new Error('Chrome did not print a DevTools URL within 20s')), 20000)
    proc.stderr.on('data', (d) => {
      buf += d
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
      if (m) {
        clearTimeout(timer)
        resolve(m[1])
      }
    })
    proc.on('exit', (code) => reject(new Error(`Chrome exited early (code ${code}): ${buf.slice(-500)}`)))
  })
  const port = new URL(wsUrl).port
  let page
  for (let i = 0; i < 50 && !page; i++) {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
    page = targets.find((t) => t.type === 'page')
    if (!page) await sleep(100)
  }
  if (!page) throw new Error('No page target in Chrome')

  const kill = async () => {
    try {
      process.kill(-proc.pid, 'SIGTERM')
    } catch {}
    for (let i = 0; i < 30; i++) {
      try {
        process.kill(proc.pid, 0)
        await sleep(100)
      } catch {
        break
      }
    }
    try {
      process.kill(-proc.pid, 'SIGKILL')
    } catch {}
    rmSync(profile, { recursive: true, force: true })
    rmSync(stateFile, { force: true })
  }
  return { wsUrl: page.webSocketDebuggerUrl, kill, chromePath, pid: proc.pid }
}

function makeContext(cdp, outDir) {
  const ctx = {
    cdp,
    outDir,
    checks: [],
    screenshots: [],
    images: {},
    console: [],
    shotIndex: 0,
  }

  ctx.eval = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) {
      const d = r.exceptionDetails
      throw new Error(`page eval failed: ${d.exception?.description || d.text}`)
    }
    return r.result.value
  }

  ctx.waitFor = async (expression, label, timeout = TIMEOUT) => {
    const start = Date.now()
    let last
    while (Date.now() - start < timeout) {
      try {
        last = await ctx.eval(expression)
        if (last) return last
      } catch (e) {
        last = e.message
      }
      await sleep(250)
    }
    throw new Error(`timed out after ${timeout}ms waiting for ${label} (last: ${JSON.stringify(last)})`)
  }

  /** Tiles settled: no in-flight frames and no viewer events for `quietMs`. */
  ctx.waitIdle = async (label, quietMs = 2000, timeout = TIMEOUT) => {
    try {
      await ctx.waitFor(
        `window.dmvHarness && dmvHarness.pendingFrames() <= 0 && dmvHarness.idleForMs() > ${quietMs}`,
        `${label}: tiles idle`,
        timeout,
      )
      return true
    } catch (e) {
      const snap = await ctx.snapshot()
      ctx.check(`${label}: tiles settled`, false, { error: e.message, frames: snap.frames })
      return false
    }
  }

  ctx.snapshot = () => ctx.eval('dmvHarness.snapshot()')

  ctx.check = (name, pass, details = {}) => {
    ctx.checks.push({ name, pass: Boolean(pass), details })
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${Object.keys(details).length ? `  ${JSON.stringify(details)}` : ''}`)
  }

  ctx.screenshot = async (name) => {
    ctx.shotIndex++
    const file = join(outDir, `${String(ctx.shotIndex).padStart(2, '0')}-${name}.png`)
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(data, 'base64')
    writeFileSync(file, buf)
    const img = decodePNG(buf)
    ctx.images[name] = img
    const stats = imageStats(img, VIEWPORT_RECT)
    ctx.screenshots.push({ name, file: relative(REPO_ROOT, file), stats })
    return { img, stats }
  }

  ctx.diff = (a, b) => imageDiff(ctx.images[a], ctx.images[b], VIEWPORT_RECT)

  ctx.viewportCenter = async () => {
    const r = await ctx.eval(
      `(() => { const b = document.getElementById('viewport').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })()`,
    )
    return r
  }

  /**
   * Densest-tissue point of a screenshot (darkest 64px block), skipping the
   * overview map in the top-left and the borders. Slide centers often land
   * on blank glass between sections, where zoom/pan changes nothing visible.
   */
  ctx.tissuePoint = (name) => {
    const img = ctx.images[name]
    const B = 64
    let best = { score: -1, x: 0, y: 0 }
    for (let by = STATUS_BAR_H + B; by + B < img.height - B; by += B / 2) {
      for (let bx = B; bx + B < img.width - B; bx += B / 2) {
        if (bx < 260 && by < 260) continue
        let sum = 0
        for (let y = by; y < by + B; y += 4) {
          for (let x = bx; x < bx + B; x += 4) {
            const i = (y * img.width + x) * 4
            sum += 255 - (0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2])
          }
        }
        if (sum > best.score) best = { score: sum, x: bx + B / 2, y: by + B / 2 }
      }
    }
    return { x: best.x, y: best.y }
  }

  ctx.mouse = (type, x, y, extra = {}) =>
    cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', pointerType: 'mouse', ...extra })

  ctx.click = async (x, y) => {
    await ctx.mouse('mouseMoved', x, y, { button: 'none' })
    await ctx.mouse('mousePressed', x, y, { buttons: 1, clickCount: 1 })
    await sleep(40)
    await ctx.mouse('mouseReleased', x, y, { buttons: 0, clickCount: 1 })
    await sleep(350)
  }

  ctx.drag = async (from, to, steps = 12) => {
    await ctx.mouse('mouseMoved', from.x, from.y, { button: 'none' })
    await ctx.mouse('mousePressed', from.x, from.y, { buttons: 1, clickCount: 1 })
    for (let i = 1; i <= steps; i++) {
      const x = from.x + ((to.x - from.x) * i) / steps
      const y = from.y + ((to.y - from.y) * i) / steps
      await ctx.mouse('mouseMoved', x, y, { buttons: 1 })
      await sleep(30)
    }
    await sleep(150)
    await ctx.mouse('mouseReleased', to.x, to.y, { buttons: 0, clickCount: 1 })
  }

  ctx.wheel = async (x, y, deltaY) => {
    await ctx.mouse('mouseMoved', x, y, { button: 'none' })
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY })
  }

  return ctx
}

function harnessUrl(port) {
  const q = new URLSearchParams()
  for (const k of ['server', 'study', 'series', 'build']) {
    const v = flag(k)
    if (typeof v === 'string') q.set(k, v)
  }
  const qs = q.toString()
  return `http://127.0.0.1:${port}/.cursor/skills/verify-dmv/harness/index.html${qs ? `?${qs}` : ''}`
}

/** Shared first leg of every journey: load the slide and let tiles settle. */
async function openSlide(ctx, url) {
  await ctx.cdp.send('Page.navigate', { url })
  const state = await ctx.waitFor(
    `window.dmvHarness && dmvHarness.state !== 'loading' && dmvHarness.state`,
    'harness ready',
  )
  if (state !== 'ready') {
    const snap = await ctx.snapshot()
    ctx.check('slide metadata loaded and viewer rendered', false, { state, error: snap.error })
    return false
  }
  await ctx.waitFor('dmvHarness.framesStarted > 0', 'first tile request')
  await ctx.waitIdle('initial render')
  const snap = await ctx.snapshot()
  const { stats } = await ctx.screenshot('slide-loaded')
  ctx.check('slide metadata loaded and viewer rendered', true, {
    container: snap.slide.containerIdentifier,
    volumeImages: snap.slide.volumeImages,
  })
  ctx.check('tiles retrieved and decoded without errors', snap.frames.ended > 0 && snap.frames.failed === 0, snap.frames)
  ctx.check('viewport shows image content (not blank)', stats.stddev > 8 && stats.contentFraction > 0.05, stats)
  return true
}

const listOf = (v, fallback) => {
  if (v === 'auto') return []
  if (typeof v === 'string') return v.split(',').filter(Boolean)
  return [fallback]
}

const JOURNEYS = {
  async render(ctx, url) {
    await openSlide(ctx, url)
  },

  async 'zoom-pan'(ctx, url) {
    if (!(await openSlide(ctx, url))) return
    const c = await ctx.viewportCenter()
    const anchor = ctx.tissuePoint('slide-loaded')
    const before = await ctx.snapshot()

    for (let i = 0; i < 3; i++) {
      await ctx.wheel(anchor.x, anchor.y, -400)
      await sleep(400)
    }
    await ctx.waitIdle('after zoom')
    const zoomed = await ctx.snapshot()
    await ctx.screenshot('zoomed-in')
    ctx.check('mouse wheel zoomed in (resolution decreased)', zoomed.view.resolution < before.view.resolution, {
      anchor,
      before: before.view.resolution,
      after: zoomed.view.resolution,
    })
    ctx.check('zoom fetched higher-resolution tiles', zoomed.frames.started > before.frames.started && zoomed.frames.failed === 0, {
      before: before.frames,
      after: zoomed.frames,
    })
    ctx.check('zoomed viewport differs from initial render', ctx.diff('slide-loaded', 'zoomed-in') > 0.1, {
      changedFraction: ctx.diff('slide-loaded', 'zoomed-in'),
    })

    await ctx.drag(c, { x: c.x - 300, y: c.y - 200 })
    await ctx.waitIdle('after pan')
    const panned = await ctx.snapshot()
    await ctx.screenshot('panned')
    const moved = Math.hypot(panned.view.center[0] - zoomed.view.center[0], panned.view.center[1] - zoomed.view.center[1])
    ctx.check('mouse drag panned the view (center moved)', moved > 0, { centerBefore: zoomed.view.center, centerAfter: panned.view.center })
    const endedBefore = zoomed.counts.dicommicroscopyviewer_move_ended || 0
    const endedAfter = panned.counts.dicommicroscopyviewer_move_ended || 0
    ctx.check('MOVE_ENDED event published for the pan', endedAfter > endedBefore, { endedBefore, endedAfter })
    ctx.check('panned viewport differs from zoomed view', ctx.diff('zoomed-in', 'panned') > 0.1, {
      changedFraction: ctx.diff('zoomed-in', 'panned'),
    })
  },

  async segmentation(ctx, url) {
    if (!(await openSlide(ctx, url))) return
    const series = listOf(flag('seg'), DEFAULT_DATA.seg)
    let uids
    try {
      uids = await ctx.eval(`dmvHarness.loadSegmentations(${JSON.stringify(series)})`)
    } catch (e) {
      ctx.check('addSegments accepted SEG metadata', false, { error: e.message })
      return
    }
    ctx.check('addSegments accepted SEG metadata', uids.length > 0, { segments: uids.length })
    const hidden = await ctx.snapshot()
    ctx.check('segments are hidden until shown', hidden.segments.every((s) => !s.visible), { segments: hidden.segments })

    await ctx.eval(`(() => { for (const uid of ${JSON.stringify(uids)}) dmvHarness.viewer.showSegment(uid) })()`)
    await ctx.waitFor('dmvHarness.pendingFrames() > 0 || dmvHarness.idleForMs() < 1000', 'segment frame requests', 15000).catch(() => {})
    await ctx.waitIdle('after showSegment')
    const shown = await ctx.snapshot()
    await ctx.screenshot('segments-shown')
    ctx.check('showSegment made every segment visible', shown.segments.every((s) => s.visible), { segments: shown.segments })
    ctx.check('segment frames loaded without errors', shown.frames.failed === 0 && shown.frames.started > hidden.frames.started, {
      before: hidden.frames,
      after: shown.frames,
    })
    const changed = ctx.diff('slide-loaded', 'segments-shown')
    ctx.check('segmentation overlay visibly changed the viewport', changed > 0.01, { changedFraction: changed })

    await ctx.eval(`(() => { for (const uid of ${JSON.stringify(uids)}) dmvHarness.viewer.hideSegment(uid) })()`)
    await ctx.waitIdle('after hideSegment', 1000)
    await ctx.screenshot('segments-hidden')
    const restored = ctx.diff('slide-loaded', 'segments-hidden')
    ctx.check('hideSegment restored the original rendering', restored < changed / 2, { changedFraction: restored })
  },

  async annotations(ctx, url) {
    if (!(await openSlide(ctx, url))) return
    const series = listOf(flag('ann'), DEFAULT_DATA.ann)
    let uids
    try {
      uids = await ctx.eval(`dmvHarness.loadAnnotations(${JSON.stringify(series)})`)
    } catch (e) {
      ctx.check('addAnnotationGroups accepted ANN metadata', false, { error: e.message })
      return
    }
    ctx.check('addAnnotationGroups accepted ANN metadata', uids.length > 0, { groups: uids.length })
    const before = await ctx.snapshot()
    const loadsBefore = (before.counts.dicommicroscopyviewer_loading_ended || 0) + (before.counts.dicommicroscopyviewer_loading_error || 0)

    await ctx.eval(`(() => { for (const uid of ${JSON.stringify(uids)}) dmvHarness.viewer.showAnnotationGroup(uid) })()`)
    try {
      await ctx.waitFor(
        `((dmvHarness.counts.dicommicroscopyviewer_loading_ended || 0) + (dmvHarness.counts.dicommicroscopyviewer_loading_error || 0)) > ${loadsBefore}`,
        'bulk annotation LOADING_ENDED/ERROR',
        Math.max(TIMEOUT, 180000),
      )
    } catch (e) {
      ctx.check('bulk annotation loading finished', false, { error: e.message })
    }
    await ctx.waitIdle('after showAnnotationGroup')
    const shown = await ctx.snapshot()
    await ctx.screenshot('annotations-shown')
    ctx.check('showAnnotationGroup made every group visible', shown.annotationGroups.every((g) => g.visible), {
      groups: shown.annotationGroups,
    })
    ctx.check('no LOADING_ERROR for bulk annotations', !shown.counts.dicommicroscopyviewer_loading_error, {
      loadingEnded: shown.counts.dicommicroscopyviewer_loading_ended || 0,
      loadingError: shown.counts.dicommicroscopyviewer_loading_error || 0,
    })
    const changed = ctx.diff('slide-loaded', 'annotations-shown')
    ctx.check('annotation overlay visibly changed the viewport', changed > 0.005, { changedFraction: changed })
  },

  async 'draw-roi'(ctx, url) {
    if (!(await openSlide(ctx, url))) return
    const c = await ctx.viewportCenter()
    await ctx.eval(`dmvHarness.viewer.activateDrawInteraction({ geometryType: 'polygon' })`)
    const pts = [
      { x: c.x - 150, y: c.y - 100 },
      { x: c.x + 150, y: c.y - 100 },
      { x: c.x + 150, y: c.y + 100 },
      { x: c.x - 150, y: c.y + 100 },
    ]
    for (const p of pts) await ctx.click(p.x, p.y)
    await ctx.click(pts[0].x, pts[0].y)
    let drawn
    try {
      drawn = await ctx.waitFor(
        `dmvHarness.events.find((e) => e.type === 'dicommicroscopyviewer_roi_drawn')`,
        'ROI_DRAWN event',
        10000,
      )
    } catch (e) {
      ctx.check('ROI_DRAWN event published after closing the polygon', false, { error: e.message })
    }
    await ctx.eval('dmvHarness.viewer.deactivateDrawInteraction()')
    await sleep(500)
    const snap = await ctx.snapshot()
    await ctx.screenshot('roi-drawn')
    if (drawn) {
      ctx.check('ROI_DRAWN event published after closing the polygon', true, { uid: drawn.payload?.uid })
      ctx.check('drawn ROI is a POLYGON in slide coordinates', drawn.payload?.graphicType === 'POLYGON' && drawn.payload.graphicData.length >= 4, {
        graphicType: drawn.payload?.graphicType,
        firstPoint: drawn.payload?.graphicData?.[0],
        points: drawn.payload?.graphicData?.length,
      })
    }
    ctx.check('getAllROIs returns the drawn ROI', snap.rois.length === 1 && snap.rois[0].graphicType === 'POLYGON', { rois: snap.rois })
    const changed = ctx.diff('slide-loaded', 'roi-drawn')
    ctx.check('ROI outline is rendered on the viewport', changed > 0.001, { changedFraction: changed })
  },
}

async function main() {
  if (flag('list')) {
    console.log(Object.keys(JOURNEYS).join('\n'))
    return
  }
  const journey = flag('journey')
  if (!JOURNEYS[journey]) {
    console.error(`--journey must be one of: ${Object.keys(JOURNEYS).join(', ')}`)
    process.exit(2)
  }
  const port = Number(flag('port', readJSON(SERVER_STATE_FILE)?.port || 0))
  const health = port ? await serverHealth(port) : null
  if (!health || health.root !== REPO_ROOT) {
    console.error(`harness server for ${REPO_ROOT} is not running${port ? ` on port ${port}` : ''}. Run: node .cursor/skills/verify-dmv/scripts/server.mjs start`)
    process.exit(2)
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outDir = join(EVIDENCE_DIR, `${stamp}-${journey}`)
  mkdirSync(outDir, { recursive: true })
  const url = harnessUrl(port)
  console.log(`journey: ${journey}\nurl:     ${url}\nout:     ${relative(REPO_ROOT, outDir)}`)

  const chrome = await launchChrome(Boolean(flag('headed')))
  const onSignal = async () => {
    await chrome.kill()
    process.exit(130)
  }
  process.on('SIGINT', onSignal)
  process.on('SIGTERM', onSignal)

  const cdp = new CDP(chrome.wsUrl)
  const ctx = makeContext(cdp, outDir)
  const started = Date.now()
  let fatal = null
  let serverMisses = []
  try {
    await cdp.connect()
    cdp.on('Runtime.consoleAPICalled', (p) =>
      ctx.console.push(`[console.${p.type}] ${p.args.map((a) => a.value ?? a.description ?? '').join(' ')}`),
    )
    cdp.on('Runtime.exceptionThrown', (p) => ctx.console.push(`[exception] ${p.exceptionDetails.exception?.description || p.exceptionDetails.text}`))
    cdp.on('Log.entryAdded', (p) => ctx.console.push(`[log.${p.entry.level}] ${p.entry.text} ${p.entry.url || ''}`))
    await cdp.send('Runtime.enable')
    await cdp.send('Log.enable')
    await cdp.send('Page.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: VIEW_W, height: VIEW_H, deviceScaleFactor: 1, mobile: false })
    await JOURNEYS[journey](ctx, url)
    const snap = await ctx.snapshot().catch(() => null)
    if (snap) ctx.check('no uncaught page errors', snap.pageErrors.length === 0, { pageErrors: snap.pageErrors.slice(0, 5) })
    const misses = await (await fetch(`http://127.0.0.1:${port}/__verify-dmv/misses?since=${started}`)).json()
    serverMisses = misses.filter((m) => m.path !== '/favicon.ico')
    ctx.check('every harness/library asset was served (no 404s)', serverMisses.length === 0, {
      missing: serverMisses.slice(0, 5).map((m) => `${m.status} ${m.path}`),
    })
  } catch (e) {
    fatal = String(e.stack || e)
    ctx.check('journey ran to completion', false, { error: e.message })
  }

  const finalSnapshot = await ctx.snapshot().catch(() => null)
  const events = await ctx.eval('dmvHarness.events').catch(() => [])
  cdp.close()
  await chrome.kill()

  const passed = ctx.checks.length > 0 && ctx.checks.every((c) => c.pass)
  const result = {
    journey,
    passed,
    url,
    chrome: chrome.chromePath,
    startedAt: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    checks: ctx.checks,
    screenshots: ctx.screenshots,
    snapshot: finalSnapshot,
    serverMisses,
    fatal,
  }
  writeFileSync(join(outDir, 'result.json'), JSON.stringify(result, null, 2))
  writeFileSync(join(outDir, 'events.json'), JSON.stringify(events, null, 2))
  writeFileSync(join(outDir, 'console.log'), ctx.console.join('\n'))
  console.log(`\n${passed ? 'PASSED' : 'FAILED'}  ${ctx.checks.filter((c) => c.pass).length}/${ctx.checks.length} checks  (${result.durationMs} ms)`)
  console.log(`evidence: ${relative(REPO_ROOT, outDir)}`)
  process.exit(passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
