#!/usr/bin/env node
/**
 * Generates a local, offline test set of avatar images for the "custom image"
 * anonymization effect — bundled in the repo so nothing is fetched over the
 * network (the app's CSP blocks outbound connections).
 *
 *  - 100 diverse pixel-art "punk" avatars  → public/custom-images/punks/
 *  -  60 abstract geometric avatars        → public/custom-images/abstract/
 *
 * Each folder also gets a manifest.json the app reads at runtime.
 *
 * Run with:  node scripts/generate-test-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'custom-images')

// ── Minimal PNG (RGBA, filter 0) encoder ───────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
/** rgba: Uint8Array length w*h*4 → PNG Buffer. */
function encodePng(rgba, w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type RGBA
  // raw scanlines, each prefixed with a 0 (no filter) byte
  const raw = Buffer.alloc(h * (w * 4 + 1))
  for (let y = 0; y < h; y += 1) {
    raw[y * (w * 4 + 1)] = 0
    rgba.subarray(y * w * 4, (y + 1) * w * 4)
      .forEach((v, i) => { raw[y * (w * 4 + 1) + 1 + i] = v })
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

// ── Tiny deterministic RNG ─────────────────────────────────────────────
function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17
    s ^= s << 5; s >>>= 0
    return s / 0xffffffff
  }
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

// ── Pixel-art punk generator (24×24 grid, upscaled) ────────────────────
const GRID = 24
const SCALE = 8 // → 192×192
const SKIN = ['#ead9c0', '#d8b894', '#c69472', '#a06a45', '#7a4a2b', '#86d97a', '#7ec8e3', '#c9b6e8']
const HAIR = ['#1a1a1a', '#3a2a16', '#6b4423', '#b06a2c', '#d8c34a', '#e8e8e8', '#7a2f2f', '#2f5f7a', '#9b59b6', '#16a085']
const BG = ['#638596', '#7d6b9e', '#9e6b7d', '#6b9e7d', '#9e926b', '#5a5a72', '#3a3a3a', '#2a3a4a', '#4a3a2a']
const ACCENT = ['#ffcc00', '#ff4d4d', '#4dd2ff', '#ffffff', '#00ff78']

function genPunk(seed) {
  const rng = makeRng(seed * 2654435761 + 12345)
  const px = new Array(GRID * GRID).fill(null)
  const set = (x, y, c) => { if (x >= 0 && x < GRID && y >= 0 && y < GRID) px[y * GRID + x] = c }
  const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) set(x, y, c) }

  const bg = pick(rng, BG)
  rect(0, 0, GRID - 1, GRID - 1, bg)

  const skin = pick(rng, SKIN)
  // head + neck
  rect(7, 5, 16, 19, skin)
  rect(6, 7, 6, 17, skin)
  rect(17, 7, 17, 17, skin)
  rect(10, 20, 13, 22, skin) // neck
  // shadow on one cheek
  const shade = '#00000022'
  rect(15, 8, 16, 18, shade)

  // eyes
  const eyeY = 11
  const eyeColor = '#1b1b1b'
  set(9, eyeY, '#ffffff'); set(10, eyeY, eyeColor)
  set(13, eyeY, '#ffffff'); set(14, eyeY, eyeColor)

  // mouth
  const mouthY = 16
  if (rng() < 0.5) { rect(10, mouthY, 13, mouthY, '#7a3b3b') } else { rect(11, mouthY, 13, mouthY, '#000000') }

  // hair / hat
  const hair = pick(rng, HAIR)
  const style = Math.floor(rng() * 6)
  if (style === 0) { rect(6, 3, 17, 5, hair); rect(6, 6, 6, 9, hair); rect(17, 6, 17, 9, hair) } // cap + sideburns
  else if (style === 1) { rect(11, 1, 12, 5, hair) } // mohawk
  else if (style === 2) { rect(5, 4, 18, 5, pick(rng, ACCENT)); rect(6, 3, 17, 3, '#1a1a1a') } // hat band
  else if (style === 3) { /* bald */ }
  else if (style === 4) { rect(6, 3, 17, 4, hair); rect(5, 5, 6, 16, hair); rect(17, 5, 18, 16, hair) } // long hair
  else { rect(6, 4, 17, 6, hair) } // short

  // accessories
  if (rng() < 0.35) { rect(8, eyeY, 15, eyeY, '#101014'); set(11, eyeY, bg); set(12, eyeY, bg) } // shades
  if (rng() < 0.25) set(17, 14, pick(rng, ACCENT)) // earring
  if (rng() < 0.2) { rect(13, mouthY + 1, 18, mouthY + 1, '#caa') ; set(18, mouthY, '#f55') } // pipe

  // upscale to RGBA
  const W = GRID * SCALE
  const H = GRID * SCALE
  const out = new Uint8Array(W * H * 4)
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const c = px[Math.floor(y / SCALE) * GRID + Math.floor(x / SCALE)] || bg
      const [r, g, b, a] = hexToRgba(c)
      const i = (y * W + x) * 4
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = a
    }
  }
  return encodePng(out, W, H)
}

function hexToRgba(hex) {
  if (hex.length === 9) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(7, 9), 16)]
  }
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255]
}

// ── Abstract geometric generator (direct raster) ───────────────────────
function genAbstract(seed) {
  const rng = makeRng(seed * 40503 + 99)
  const S = 192
  const out = new Uint8Array(S * S * 4)
  const c0 = hslToRgb(rng() * 360, 55 + rng() * 25, 18 + rng() * 12)
  const c1 = hslToRgb(rng() * 360, 60 + rng() * 30, 50 + rng() * 20)
  const c2 = hslToRgb(rng() * 360, 70 + rng() * 25, 55 + rng() * 20)
  const shapes = []
  const n = 2 + Math.floor(rng() * 3)
  for (let i = 0; i < n; i += 1) {
    shapes.push({
      kind: Math.floor(rng() * 3),
      cx: rng() * S, cy: rng() * S, r: 30 + rng() * 70,
      col: i % 2 ? c1 : c2,
      ang: rng() * Math.PI,
    })
  }
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      let [r, g, b] = c0
      for (const sh of shapes) {
        let inside = false
        if (sh.kind === 0) inside = Math.hypot(x - sh.cx, y - sh.cy) < sh.r
        else if (sh.kind === 1) inside = Math.abs(x - sh.cx) < sh.r && Math.abs(y - sh.cy) < sh.r
        else inside = Math.abs((x - sh.cx) * Math.cos(sh.ang) + (y - sh.cy) * Math.sin(sh.ang)) < sh.r * 0.4
        if (inside) { [r, g, b] = sh.col }
      }
      const i = (y * S + x) * 4
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255
    }
  }
  return encodePng(out, S, S)
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// ── Generate ───────────────────────────────────────────────────────────
function generateSet(name, count, fn) {
  const dir = join(OUT, name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const files = []
  for (let i = 1; i <= count; i += 1) {
    const file = `${name}-${String(i).padStart(3, '0')}.png`
    writeFileSync(join(dir, file), fn(i))
    files.push(file)
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ name, count, files }, null, 2))
  console.log(`✓ ${count} ${name} icons → public/custom-images/${name}/`)
}

mkdirSync(OUT, { recursive: true })
generateSet('punks', 100, genPunk)
generateSet('abstract', 60, genAbstract)
console.log('Done.')
