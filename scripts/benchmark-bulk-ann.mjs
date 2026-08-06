#!/usr/bin/env node
/**
 * Browser CDP benchmark: master (OL Feature path) vs feat/bulk-ann-deckgl.
 *
 * Prerequisites:
 *   - Slim running with REACT_APP_CONFIG=example against the same study/series
 *   - Chrome/Chromium with remote debugging, OR puppeteer installed
 *
 * Usage:
 *   node scripts/benchmark-bulk-ann.mjs --url "http://localhost:3000/studies/.../series/..."
 *
 * Emits a markdown table of heap / timing metrics. When the master path OOMs,
 * that is recorded as a failure with the last heap sample.
 */

import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const urlIdx = args.indexOf('--url')
const url = urlIdx >= 0 ? args[urlIdx + 1] : null
const outIdx = args.indexOf('--out')
const outPath =
  outIdx >= 0 ? args[outIdx + 1] : 'benchmark-bulk-ann-results.md'

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

async function runOnce(browser, pageUrl, label) {
  const page = await browser.newPage()
  const client = await page.target().createCDPSession()
  await client.send('Performance.enable')
  await client.send('HeapProfiler.enable')

  const samples = []
  const t0 = Date.now()
  let oom = false
  let errorMessage = null

  page.on('pageerror', (err) => {
    errorMessage = err.message
    if (/out of memory|allocation failed|OOM/i.test(err.message)) {
      oom = true
    }
  })

  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 120_000 })
    /** Wait for annotation group panel / viewer. */
    await page.waitForTimeout(3000)

    /** Try to click the first annotation-group visibility toggle if present. */
    await page.evaluate(() => {
      const switches = Array.from(
        document.querySelectorAll('.ant-switch, button, [role="switch"]'),
      )
      for (const el of switches) {
        const text = (el.closest('li') || el.parentElement)?.textContent || ''
        if (/annotation|group|cell/i.test(text)) {
          el.click()
          return
        }
      }
    })

    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(2000)
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
    headless: 'new',
    args: ['--disable-dev-shm-usage', '--js-flags=--max-old-space-size=8192'],
  })

  const result = await runOnce(browser, url, 'current-build')
  await browser.close()

  const md = `# Bulk annotation benchmark

URL: \`${url}\`

| Build | Peak JS heap | Duration | OOM? | Notes |
|-------|--------------|----------|------|-------|
| ${result.label} | ${formatMb(result.peakJsHeap)} | ${(result.durationMs / 1000).toFixed(1)}s | ${result.oom ? 'YES' : 'no'} | ${result.errorMessage || ''} |

Samples: ${JSON.stringify(result.samples, null, 2)}
`
  writeFileSync(outPath, md)
  console.log(md)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
