import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

export const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const REPO_ROOT = resolve(SKILL_DIR, '../../..')
export const RUN_DIR = join(SKILL_DIR, '.run')
export const EVIDENCE_DIR = join(SKILL_DIR, '.evidence')
export const SERVER_STATE_FILE = join(RUN_DIR, 'server.json')
export const MARKER = 'verify-dmv'

export const DEFAULT_DATA = {
  server:
    'https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb',
  study: '2.25.6648858190181184824224753085742628317',
  series: '1.3.6.1.4.1.5962.99.1.1044659851.1751703833.1637427232395.2.0',
  /** TCGA-50-6590 DX1 "Stony Brook CNN-generated TIL Map": BINARY, 2 segments */
  seg: '1.2.826.0.1.3680043.10.511.3.4625772101077208675868393952172889',
  /** TCGA-50-6590 DX1 nuclei: 1 POLYGON group, ~898k annotations */
  ann: '1.2.826.0.1.3680043.10.511.3.94961310062320590929959059217316301',
}

export function isAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function readJSON(file) {
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

export async function serverHealth(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/__verify-dmv/health`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return null
    const body = await res.json()
    return body.marker === MARKER ? body : null
  } catch {
    return null
  }
}

export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]
  const pwCache = [join(homedir(), 'Library/Caches/ms-playwright'), join(homedir(), '.cache/ms-playwright')]
  for (const dir of pwCache) {
    if (!existsSync(dir)) continue
    const builds = readdirSync(dir)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort()
      .reverse()
    for (const b of builds) {
      candidates.push(
        join(dir, b, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
        join(dir, b, 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'),
        join(dir, b, 'chrome-linux/chrome'),
      )
    }
  }
  for (const c of candidates) if (c && existsSync(c)) return c
  for (const name of ['google-chrome', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [name], { encoding: 'utf8' }).trim()
    } catch {}
  }
  return null
}

/** Decode an 8-bit RGB/RGBA non-interlaced PNG (what Chrome screenshots emit). */
export function decodePNG(buf) {
  let pos = 8
  let width = 0
  let height = 0
  let colorType = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      if (data[8] !== 8 || data[12] !== 0) throw new Error('unsupported PNG (need 8-bit, non-interlaced)')
      colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0
  if (!bpp) throw new Error(`unsupported PNG color type ${colorType}`)
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * bpp
  const out = Buffer.alloc(width * height * 4)
  let prev = Buffer.alloc(stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0
      const b = prev[i]
      const c = i >= bpp ? prev[i - bpp] : 0
      let v = line[i]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      line[i] = v & 0xff
    }
    for (let x = 0; x < width; x++) {
      out[(y * width + x) * 4] = line[x * bpp]
      out[(y * width + x) * 4 + 1] = line[x * bpp + 1]
      out[(y * width + x) * 4 + 2] = line[x * bpp + 2]
      out[(y * width + x) * 4 + 3] = bpp === 4 ? line[x * bpp + 3] : 255
    }
    prev = line
  }
  return { width, height, data: out }
}

/**
 * Luminance spread and share of pixels that differ from the harness
 * background (#1e1e1e) inside a rectangle. A blank/failed viewport has
 * stddev near 0 and contentFraction near 0.
 */
export function imageStats(img, rect) {
  const { x0, y0, x1, y1 } = rect
  let n = 0
  let sum = 0
  let sumSq = 0
  let content = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4
      const r = img.data[i]
      const g = img.data[i + 1]
      const b = img.data[i + 2]
      const l = 0.299 * r + 0.587 * g + 0.114 * b
      sum += l
      sumSq += l * l
      n++
      if (Math.max(Math.abs(r - 30), Math.abs(g - 30), Math.abs(b - 30)) > 24) content++
    }
  }
  const mean = sum / n
  return { mean: +mean.toFixed(1), stddev: +Math.sqrt(sumSq / n - mean * mean).toFixed(1), contentFraction: +(content / n).toFixed(4) }
}

/** Share of pixels whose max channel delta exceeds `threshold`. */
export function imageDiff(a, b, rect, threshold = 32) {
  const { x0, y0, x1, y1 } = rect
  let n = 0
  let changed = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * a.width + x) * 4
      const d = Math.max(
        Math.abs(a.data[i] - b.data[i]),
        Math.abs(a.data[i + 1] - b.data[i + 1]),
        Math.abs(a.data[i + 2] - b.data[i + 2]),
      )
      if (d > threshold) changed++
      n++
    }
  }
  return +(changed / n).toFixed(4)
}
