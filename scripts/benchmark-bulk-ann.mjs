#!/usr/bin/env node
/**
 * Browser CDP benchmark: master (OL Feature path) vs feat/bulk-ann-deckgl.
 *
 * Prerequisites:
 *   - Slim serving the DMV build to measure, opened on an ANN series link
 *     (the link shows its annotation groups, so nothing needs a click)
 *   - puppeteer importable from this script's location
 *
 * Usage:
 *   node scripts/benchmark-bulk-ann.mjs --url "http://localhost:3000/studies/.../series/..." \
 *     [--label master] [--seconds 60] [--toggle "Show Nuclei"] [--out results.md] [--append]
 *
 * Run it once per build (e.g. master, then this branch) with --append to
 * collect the rows in one table.
 *
 * Emits a markdown table of heap / timing metrics. When the master path OOMs,
 * that is recorded as a failure with the last heap sample.
 */

import { appendFileSync, existsSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const urlIdx = args.indexOf('--url')
const url = urlIdx >= 0 ? args[urlIdx + 1] : null
const outIdx = args.indexOf('--out')
const outPath =
  outIdx >= 0 ? args[outIdx + 1] : 'benchmark-bulk-ann-results.md'
const option = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}
const label = option('--label', 'current-build')
const seconds = Number(option('--seconds', '60'))
const toggleLabel = option('--toggle', null)
const append = args.includes('--append')

/** `page.waitForTimeout` was removed from puppeteer */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

if (!url) {
  console.error(
    'Usage: node scripts/benchmark-bulk-ann.mjs --url <slim-study-series-url> [--out results.md]',
  )
  console.error(
    'Tip: start slim with `REACT_APP_CONFIG=example pnpm start` and toggle annotation groups.',
  )
  process.exit(2)
}

async function withPuppeteer() {
  let puppeteer
  try {
    puppeteer = await import('puppeteer')
  } catch {
    return null
  }
  return puppeteer.default || puppeteer
}

function formatMb(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return 'n/a'
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function runOnce(browser, pageUrl) {
  const page = await browser.newPage()
  const client = await page.target().createCDPSession()
  await client.send('Performance.enable')
  await client.send('HeapProfiler.enable')

  const samples = []
  const t0 = Date.now()
  let oom = false
  let errorMessage = null

  /** dicomweb-client / DMV debug output marks when the bulk data is in */
  let bulkDoneMs = null
  page.on('console', (message) => {
    if (bulkDoneMs == null && message.text().includes('bulkStream:done')) {
      bulkDoneMs = Date.now() - t0
    }
  })
  page.on('pageerror', (err) => {
    errorMessage = err.message
    if (/out of memory|allocation failed|OOM/i.test(err.message)) {
      oom = true
    }
  })

  try {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 })

    if (toggleLabel != null) {
      /** Slim's group toggles are buttons named after the group */
      const button = await page.waitForSelector(
        `button[aria-label="${toggleLabel}"]`,
        { timeout: 120_000 },
      )
      await button.click()
    }

    for (let i = 0; i < seconds / 2; i++) {
      await sleep(2000)
      const metrics = await client.send('Performance.getMetrics')
      const jsHeap = metrics.metrics.find((m) => m.name === 'JSHeapUsedSize')
      samples.push({
        t: Date.now() - t0,
        jsHeapUsed: jsHeap?.value ?? null,
      })
      if (oom) break
    }
  } catch (error) {
    errorMessage = error.message
    if (/out of memory|Target closed|Protocol error/i.test(error.message)) {
      oom = true
    }
  }

  const peak = samples.reduce(
    (max, s) => Math.max(max, s.jsHeapUsed || 0),
    0,
  )
  await page.close().catch(() => {})
  return {
    label,
    bulkDoneMs,
    durationMs: Date.now() - t0,
    peakJsHeap: peak,
    samples,
    oom,
    errorMessage,
  }
}

async function main() {
  const puppeteer = await withPuppeteer()
  if (!puppeteer) {
    const stub = `# Bulk annotation benchmark

Puppeteer is not installed in this environment. Install it and re-run:

\`\`\`bash
pnpm add -D puppeteer
node scripts/benchmark-bulk-ann.mjs --url "${url}"
\`\`\`

Manual protocol (Chrome DevTools → Performance / Memory):
1. Open \`${url}\` on **master** (OpenLayers Feature path) and toggle a large POLYGON group.
2. Record JS heap peak and time-to-first-paint of annotations; note OOM if the tab crashes.
3. Repeat on **feat/bulk-ann-deckgl** (deck.gl overlay).
4. Fill the table:

| Build | Peak JS heap | Time to interactive after toggle | OOM? |
|-------|--------------|----------------------------------|------|
| master (OL Features) | | | |
| feat/bulk-ann-deckgl | | | |
`
    writeFileSync(outPath, stub)
    console.log(`Wrote manual benchmark stub to ${outPath}`)
    return
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--js-flags=--max-old-space-size=8192',
      /** WebGL for OpenLayers and deck.gl without a GPU */
      '--enable-unsafe-swiftshader',
    ],
  })

  const result = await runOnce(browser, url)
  await browser.close()

  const final = result.samples.at(-1)?.jsHeapUsed
  const row = `| ${result.label} | ${formatMb(result.peakJsHeap)} | ${formatMb(final)} | ${result.bulkDoneMs == null ? 'n/a' : `${(result.bulkDoneMs / 1000).toFixed(1)}s`} | ${(result.durationMs / 1000).toFixed(1)}s | ${result.oom ? 'YES' : 'no'} | ${result.errorMessage || ''} |`
  const header = `# Bulk annotation benchmark

URL: \`${url}\`

| Build | Peak JS heap | Final JS heap | Bulk data in | Run | OOM? | Notes |
|-------|--------------|---------------|--------------|-----|------|-------|
`
  if (append && existsSync(outPath)) {
    appendFileSync(outPath, `${row}\n`)
  } else {
    writeFileSync(outPath, `${header}${row}\n`)
  }
  console.log(row)
  console.log(JSON.stringify(result.samples))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
