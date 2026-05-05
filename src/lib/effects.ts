import type { AnonymizeEffectId, ColorAdjustments, EffectDefinition, GlitchSubEffect } from '../types'

export const EMOJI_POOL = [
  // Cats
  '🐱','🐈','🐈‍⬛','😺','😸','😹','😻','😼','😽','🙀','😿','😾',
  // Animals
  '🐶','🐕','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵',
  '🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝',
  '🐛','🦋','🐌','🐞','🐙','🦑','🐠','🐟','🐡','🐬','🐳','🦈',
  // Faces & characters
  '🙂','😶','🤖','😎','🙈','🫥','👾','🥸','🤡','👽','💀','🎃',
  '😈','🤠','🥷','🦸','🧛','🧟','🧞','🧑‍🚀',
  // Objects
  '🛰️','🎭','🎪','🔮','🪬','🗿','🎯','🧩',
]

export const EFFECTS: EffectDefinition[] = [
  { id: 'blur',       label: 'Blur',        description: 'Gaussian blur',                         icon: 'blur_on' },
  { id: 'pixelate',  label: 'Pixelate',    description: 'Mosaic (low-res) effect',               icon: 'grid_on' },
  { id: 'zoom-blur', label: 'Zoom Blur',   description: 'Radial zoom blur — destroys face shape', icon: 'motion_blur' },
  { id: 'blackout',  label: 'Blackout',    description: 'Solid black fill',                       icon: 'square' },
  { id: 'emoji',     label: 'Emoji',       description: 'Replace with random emoji',              icon: 'mood' },
  { id: 'noise',     label: 'Noise',       description: 'Noise anonymization',                    icon: 'grain' },
  { id: 'glitch',    label: 'Glitch',      description: 'RGB chroma-shift',                       icon: 'auto_fix_high' },
  { id: 'silhouette',label: 'Silhouette',  description: 'Solid black silhouette',                 icon: 'person' },
  { id: 'contour',   label: 'Contour',     description: 'Edge detection (Sobel)',                 icon: 'pentagon' },
  { id: 'thermal',   label: 'Thermal',     description: 'Falsecolor thermal map',                 icon: 'thermostat' },
  { id: 'static',    label: 'Static TV',   description: 'TV static noise',                        icon: 'tv' },
]

const scratchA = document.createElement('canvas')
const scratchB = document.createElement('canvas')

const getContext2d = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d', {
    willReadFrequently: true,
  })
  if (!context) {
    throw new Error('Canvas 2D context is not available.')
  }
  return context
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const normalizeRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) => {
  if (maxWidth < 1 || maxHeight < 1) return { x: 0, y: 0, width: 1, height: 1 }
  const rx = clamp(Math.floor(x), 0, maxWidth - 1)
  const ry = clamp(Math.floor(y), 0, maxHeight - 1)
  const rw = clamp(Math.ceil(width), 1, maxWidth - rx)
  const rh = clamp(Math.ceil(height), 1, maxHeight - ry)
  return { x: rx, y: ry, width: rw, height: rh }
}

const applyBlurRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x,
    y,
    width,
    height,
    ctx.canvas.width,
    ctx.canvas.height,
  )

  scratchA.width = rw
  scratchA.height = rh
  const sctx = getContext2d(scratchA)
  sctx.clearRect(0, 0, rw, rh)
  sctx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, rw, rh)

  ctx.save()
  ctx.filter = `blur(${Math.max(2, strength * 18)}px)`
  ctx.drawImage(scratchA, 0, 0, rw, rh, rx, ry, rw, rh)
  ctx.restore()
}

/**
 * Radial zoom blur applied to a single zone rectangle.
 * Accumulates pixels sampled at progressively zoomed-in positions toward the
 * centre of the zone and averages them — destroys facial geometry while keeping
 * a recognisable "motion" artefact.
 */
const applyZoomBlurRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x, y, width, height, ctx.canvas.width, ctx.canvas.height,
  )
  const imageData = ctx.getImageData(rx, ry, rw, rh)
  const src = new Uint8ClampedArray(imageData.data)
  const dst = imageData.data

  const s = Number.isFinite(strength) ? clamp(strength, 0, 1) : 0.5
  const samples = Math.max(2, Math.round(8 + s * 12))
  const maxZoom = 0.15 + s * 0.65
  const cx = (rw - 1) / 2
  const cy = (rh - 1) / 2

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let s = 0; s < samples; s++) {
        const t = s / (samples - 1)          // 0 → 1 along zoom streak
        const zoom = t * maxZoom             // 0 → maxZoom
        // Pull pixel toward centre proportionally
        const sx = clamp(Math.round(cx + (px - cx) * (1 - zoom)), 0, rw - 1)
        const sy = clamp(Math.round(cy + (py - cy) * (1 - zoom)), 0, rh - 1)
        const i = (sy * rw + sx) * 4
        r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3]
      }
      const j = (py * rw + px) * 4
      dst[j]     = r / samples
      dst[j + 1] = g / samples
      dst[j + 2] = b / samples
      dst[j + 3] = a / samples
    }
  }
  ctx.putImageData(imageData, rx, ry)
}

const applyPixelateRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x,
    y,
    width,
    height,
    ctx.canvas.width,
    ctx.canvas.height,
  )

  const blockSize = Math.max(4, Math.round(6 + strength * 26))
  const scaledW = Math.max(1, Math.round(rw / blockSize))
  const scaledH = Math.max(1, Math.round(rh / blockSize))

  scratchB.width = scaledW
  scratchB.height = scaledH
  const sctx = getContext2d(scratchB)
  sctx.imageSmoothingEnabled = false
  sctx.clearRect(0, 0, scaledW, scaledH)
  sctx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, scaledW, scaledH)

  ctx.save()
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(scratchB, 0, 0, scaledW, scaledH, rx, ry, rw, rh)
  ctx.restore()
}

const applyBlackoutRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x,
    y,
    width,
    height,
    ctx.canvas.width,
    ctx.canvas.height,
  )
  ctx.save()
  ctx.fillStyle = `rgba(0, 0, 0, ${0.6 + strength * 0.4})`
  ctx.fillRect(rx, ry, rw, rh)
  ctx.restore()
}

const applyNoiseRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x,
    y,
    width,
    height,
    ctx.canvas.width,
    ctx.canvas.height,
  )

  const imageData = ctx.getImageData(rx, ry, rw, rh)
  const { data } = imageData
  const mix = 0.25 + strength * 0.7

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255
    data[i] = clamp(data[i] * (1 - mix) + (128 + noise) * mix, 0, 255)
    data[i + 1] = clamp(
      data[i + 1] * (1 - mix) + (128 + noise * 0.6) * mix,
      0,
      255,
    )
    data[i + 2] = clamp(
      data[i + 2] * (1 - mix) + (128 - noise * 0.8) * mix,
      0,
      255,
    )
  }

  ctx.putImageData(imageData, rx, ry)
}

const applyGlitchRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x,
    y,
    width,
    height,
    ctx.canvas.width,
    ctx.canvas.height,
  )

  const source = ctx.getImageData(rx, ry, rw, rh)
  const shifted = ctx.createImageData(rw, rh)
  const shift = Math.max(1, Math.round(strength * 12))

  for (let py = 0; py < rh; py += 1) {
    for (let px = 0; px < rw; px += 1) {
      const to = (py * rw + px) * 4
      const redX = clamp(px + shift, 0, rw - 1)
      const blueX = clamp(px - shift, 0, rw - 1)
      const greenY = clamp(py + Math.round(shift / 2), 0, rh - 1)

      const redFrom = (py * rw + redX) * 4
      const greenFrom = (greenY * rw + px) * 4
      const blueFrom = (py * rw + blueX) * 4

      shifted.data[to] = source.data[redFrom]
      shifted.data[to + 1] = source.data[greenFrom + 1]
      shifted.data[to + 2] = source.data[blueFrom + 2]
      shifted.data[to + 3] = 255
    }
  }

  ctx.putImageData(shifted, rx, ry)
}

const drawEmojiBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  emoji: string,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(
    x,
    y,
    width,
    height,
    ctx.canvas.width,
    ctx.canvas.height,
  )

  // Single emoji centered in the rectangle, sized to rect height (may overflow bounds)
  const size = Math.round(Math.max(rw, rh) * 1.05)
  const cx = rx + rw / 2
  const cy = ry + rh / 2

  ctx.save()
  ctx.font = `${size}px system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(emoji, cx, cy)
  ctx.restore()
}

export const pickRandomEmoji = () =>
  EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]

/**
 * Returns N unique emoji from the pool (no repeats until pool is exhausted).
 * Falls back to random picks if N > pool size.
 */
export const pickUniqueEmojis = (count: number): string[] => {
  const shuffled = [...EMOJI_POOL].sort(() => Math.random() - 0.5)
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(i < shuffled.length ? shuffled[i] : pickRandomEmoji())
  }
  return result
}

// ── Silueta ──────────────────────────────────────────────────────
const applySilhouetteRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(x, y, width, height, ctx.canvas.width, ctx.canvas.height)
  const imageData = ctx.getImageData(rx, ry, rw, rh)
  const { data } = imageData
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const v = luma < 128 ? 0 : 0   // force black silhouette
    data[i] = v; data[i + 1] = v; data[i + 2] = v
    // keep alpha
  }
  // fill whole region black
  ctx.save()
  ctx.fillStyle = '#000'
  ctx.fillRect(rx, ry, rw, rh)
  ctx.restore()
}

// ── Kontury (Sobel edge detection) ───────────────────────────────
const applyContourRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(x, y, width, height, ctx.canvas.width, ctx.canvas.height)
  const src = ctx.getImageData(rx, ry, rw, rh)
  const out = ctx.createImageData(rw, rh)
  const sd = src.data; const od = out.data
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      let sx = 0, sy = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nx = clamp(px + kx, 0, rw - 1)
          const ny = clamp(py + ky, 0, rh - 1)
          const idx = (ny * rw + nx) * 4
          const luma = 0.299 * sd[idx] + 0.587 * sd[idx + 1] + 0.114 * sd[idx + 2]
          const ki = (ky + 1) * 3 + (kx + 1)
          sx += luma * gx[ki]; sy += luma * gy[ki]
        }
      }
      const mag = clamp(Math.sqrt(sx * sx + sy * sy), 0, 255)
      const oi = (py * rw + px) * 4
      od[oi] = mag; od[oi + 1] = mag; od[oi + 2] = mag; od[oi + 3] = 255
    }
  }
  ctx.putImageData(out, rx, ry)
}

// ── Thermal (falsecolor heatmap) ──────────────────────────────────
const THERMAL_COLORS: [number, number, number][] = [
  [0, 0, 128], [0, 0, 255], [0, 128, 255], [0, 255, 255],
  [0, 255, 128], [0, 255, 0], [128, 255, 0], [255, 255, 0],
  [255, 128, 0], [255, 0, 0], [255, 0, 128],
]
const thermalColor = (t: number): [number, number, number] => {
  const n = THERMAL_COLORS.length - 1
  const i = clamp(Math.floor(t * n), 0, n - 1)
  const f = t * n - i
  const [r1, g1, b1] = THERMAL_COLORS[i]
  const [r2, g2, b2] = THERMAL_COLORS[Math.min(i + 1, n)]
  return [r1 + (r2 - r1) * f, g1 + (g2 - g1) * f, b1 + (b2 - b1) * f]
}
const applyThermalRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(x, y, width, height, ctx.canvas.width, ctx.canvas.height)
  const imageData = ctx.getImageData(rx, ry, rw, rh)
  const { data } = imageData
  for (let i = 0; i < data.length; i += 4) {
    const luma = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
    const [r, g, b] = thermalColor(luma)
    data[i] = r; data[i + 1] = g; data[i + 2] = b
  }
  ctx.putImageData(imageData, rx, ry)
}

// ── Static TV noise ───────────────────────────────────────────────
const applyStaticRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number, strength: number,
) => {
  const { x: rx, y: ry, width: rw, height: rh } = normalizeRect(x, y, width, height, ctx.canvas.width, ctx.canvas.height)
  const imageData = ctx.getImageData(rx, ry, rw, rh)
  const { data } = imageData
  const mix = 0.4 + strength * 0.6
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() > 0.5 ? 255 : 0
    data[i]     = clamp(data[i]     * (1 - mix) + v * mix, 0, 255)
    data[i + 1] = clamp(data[i + 1] * (1 - mix) + v * mix, 0, 255)
    data[i + 2] = clamp(data[i + 2] * (1 - mix) + v * mix, 0, 255)
  }
  ctx.putImageData(imageData, rx, ry)
}

// ── Color adjustments — LUT-based for maximum performance ────────
//
// Strategy: pre-compute a 256-entry lookup table (brightness + contrast +
// shadows + highlights) applied identically per channel, then handle
// saturation/threshold in the inner loop with integer arithmetic only.
// This is ~5-8× faster than floating-point math per-pixel.

export const buildColorLUT = (adj: ColorAdjustments): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256)
  const br = adj.brightness / 100
  const co = adj.contrast / 100
  const sh = adj.shadows / 100
  const hl = adj.highlights / 100
  // Contrast factor: positive → amplify, negative → compress
  const cf = co >= 0 ? 1 + co * 2 : 1 + co

  for (let v = 0; v < 256; v++) {
    let f = v / 255

    f += br

    if (cf !== 1) f = (f - 0.5) * cf + 0.5

    // Shadows lift: darker pixels get more lift
    if (sh !== 0) f += sh * 0.3 * (1 - f)

    // Highlights pull: lighter pixels get more effect
    if (hl !== 0) f += hl * 0.3 * f

    lut[v] = Math.round(clamp(f, 0, 1) * 255)
  }
  return lut
}

export const applyColorAdjustments = (
  ctx: CanvasRenderingContext2D,
  adj: ColorAdjustments,
  srcCanvas: HTMLCanvasElement,
) => {
  const w = srcCanvas.width; const h = srcCanvas.height
  if (w === 0 || h === 0) return

  const isNoop =
    adj.brightness === 0 && adj.contrast === 0 && adj.saturation === 0 &&
    adj.shadows === 0 && adj.highlights === 0 && adj.preset === 'none'
  if (isNoop) return

  const imageData = ctx.getImageData(0, 0, w, h)
  const { data } = imageData

  const lut = buildColorLUT(adj)
  const sa = adj.saturation / 100
  const isThreshold = adj.preset === 'threshold'
  const doSat = sa !== 0 || isThreshold

  // Integer luma weights × 1024 (Rec. 601)
  const WR = 306; const WG = 601; const WB = 117

  // Pre-scale saturation factor to integer space
  const scale1024 = doSat && sa !== 0 ? Math.round((1 + sa) * 1024) : 0

  for (let i = 0; i < data.length; i += 4) {
    let r = lut[data[i]]
    let g = lut[data[i + 1]]
    let b = lut[data[i + 2]]

    if (doSat) {
      const luma = (WR * r + WG * g + WB * b) >> 10

      if (isThreshold) {
        const v = luma >= 128 ? 255 : 0
        data[i] = v; data[i + 1] = v; data[i + 2] = v
        continue
      }

      r = clamp(luma + (((r - luma) * scale1024) >> 10), 0, 255)
      g = clamp(luma + (((g - luma) * scale1024) >> 10), 0, 255)
      b = clamp(luma + (((b - luma) * scale1024) >> 10), 0, 255)
    }

    data[i] = r; data[i + 1] = g; data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
}

export const applyEffectRect = (
  ctx: CanvasRenderingContext2D,
  effect: AnonymizeEffectId,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number,
  emoji: string,
) => {
  switch (effect) {
    case 'blur':
      applyBlurRect(ctx, x, y, width, height, strength)
      return
    case 'zoom-blur':
      applyZoomBlurRect(ctx, x, y, width, height, strength)
      return
    case 'pixelate':
      applyPixelateRect(ctx, x, y, width, height, strength)
      return
    case 'blackout':
      applyBlackoutRect(ctx, x, y, width, height, strength)
      return
    case 'emoji':
      drawEmojiBlock(ctx, x, y, width, height, emoji)
      return
    case 'noise':
      applyNoiseRect(ctx, x, y, width, height, strength)
      return
    case 'glitch':
      applyGlitchRect(ctx, x, y, width, height, strength)
      return
    case 'silhouette':
      applySilhouetteRect(ctx, x, y, width, height)
      return
    case 'contour':
      applyContourRect(ctx, x, y, width, height)
      return
    case 'thermal':
      applyThermalRect(ctx, x, y, width, height)
      return
    case 'static':
      applyStaticRect(ctx, x, y, width, height, strength)
      return
    default:
      return
  }
}

// Feather ratio: inner solid core = featherCore of radius, then fades to 0 at edge
const FEATHER_CORE = 0.55   // 55% of radius is fully opaque, then soft falloff

// Dedicated canvases for brush compositing — isolated from scratchA/B used by applyEffectRect
// so that effects like pixelate (which clobber scratchB internally) don't trash our patch.
const brushSrc = document.createElement('canvas')   // holds original source pixels
const brushDst = document.createElement('canvas')   // holds processed pixels + feather mask

const getBrushCtx = (canvas: HTMLCanvasElement) =>
  canvas.getContext('2d', { willReadFrequently: true })!

/**
 * Apply an anonymization effect in a circle with a soft feathered edge.
 * Uses dedicated canvases (brushSrc/brushDst) that are never touched by applyEffectRect,
 * so all effects including pixelate work correctly.
 */
export const applyEffectBrush = (
  ctx: CanvasRenderingContext2D,
  effect: AnonymizeEffectId,
  centerX: number,
  centerY: number,
  radius: number,
  strength: number,
  emoji: string,
) => {
  const r = Math.max(4, Math.round(radius))
  const diameter = r * 2

  const cw = ctx.canvas.width
  const ch = ctx.canvas.height
  const bx = Math.round(centerX - r)
  const by = Math.round(centerY - r)
  const x0 = Math.max(0, bx)
  const y0 = Math.max(0, by)
  const x1 = Math.min(cw, bx + diameter)
  const y1 = Math.min(ch, by + diameter)
  if (x1 <= x0 || y1 <= y0) return

  const pw = x1 - x0
  const ph = y1 - y0
  const lcx = centerX - x0
  const lcy = centerY - y0

  // ── 1. Copy source patch into brushSrc ────────────────────────
  brushSrc.width = pw; brushSrc.height = ph
  const bsCtx = getBrushCtx(brushSrc)
  bsCtx.clearRect(0, 0, pw, ph)
  bsCtx.drawImage(ctx.canvas, x0, y0, pw, ph, 0, 0, pw, ph)

  // ── 2. Copy source into brushDst, then apply effect ───────────
  brushDst.width = pw; brushDst.height = ph
  const bdCtx = getBrushCtx(brushDst)
  bdCtx.clearRect(0, 0, pw, ph)
  bdCtx.drawImage(brushSrc, 0, 0)

  if (effect === 'blackout') {
    bdCtx.fillStyle = '#000'
    bdCtx.beginPath()
    bdCtx.arc(lcx, lcy, r, 0, Math.PI * 2)
    bdCtx.fill()
  } else if (effect === 'emoji') {
    const size = Math.max(20, r * 1.35)
    bdCtx.font = `${Math.round(size)}px system-ui, sans-serif`
    bdCtx.textAlign = 'center'
    bdCtx.textBaseline = 'middle'
    bdCtx.fillText(emoji, lcx, lcy)
  } else {
    // applyEffectRect may clobber scratchA/scratchB internally (e.g. pixelate uses scratchB).
    // That is fine — brushSrc/brushDst are separate and unaffected.
    applyEffectRect(bdCtx, effect, 0, 0, pw, ph, strength, emoji)
  }

  // ── 3. Feathered circle mask on brushDst (destination-in) ─────
  const innerR = r * FEATHER_CORE
  const grad = bdCtx.createRadialGradient(lcx, lcy, innerR, lcx, lcy, r)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  bdCtx.globalCompositeOperation = 'destination-in'
  bdCtx.fillStyle = grad
  bdCtx.fillRect(0, 0, pw, ph)
  bdCtx.globalCompositeOperation = 'source-over'

  // ── 4. Composite brushDst back onto the work canvas ──────────
  ctx.save()
  ctx.globalAlpha = effect === 'blackout' ? 0.55 + strength * 0.45 : 1.0
  ctx.drawImage(brushDst, 0, 0, pw, ph, x0, y0, pw, ph)
  ctx.restore()
}

/**
 * Draw a semi-transparent preview of what applyEffectBrush would produce,
 * onto `overlayCtx` (which sits on top of the display canvas).
 * The work canvas is NOT modified.
 *
 * overlayCtx is expected to be a full-canvas 2D context that is cleared each frame.
 * srcCanvas is the work canvas (source pixels for the effect).
 */
export const previewEffectBrush = (
  overlayCtx: CanvasRenderingContext2D,
  srcCanvas: HTMLCanvasElement,
  effect: AnonymizeEffectId,
  // These are *display-canvas* coordinates (already scaled)
  canvasCenterX: number,
  canvasCenterY: number,
  canvasRadius: number,
  strength: number,
  emoji: string,
  // Transform: maps display-canvas pixel → srcCanvas pixel
  scale: number,
  drawX: number,
  drawY: number,
) => {
  // Convert display coords to srcCanvas coords
  const imgCX = (canvasCenterX - drawX) / scale
  const imgCY = (canvasCenterY - drawY) / scale
  const imgR  = canvasRadius / scale

  // Render onto a tiny offscreen using the real brush logic,
  // then composite onto the overlay at the display position with reduced opacity
  const r = Math.max(4, Math.round(imgR))
  const diameter = r * 2
  const cw = srcCanvas.width; const ch = srcCanvas.height
  const bx = Math.round(imgCX - r); const by = Math.round(imgCY - r)
  const x0 = Math.max(0, bx); const y0 = Math.max(0, by)
  const x1 = Math.min(cw, bx + diameter); const y1 = Math.min(ch, by + diameter)
  if (x1 <= x0 || y1 <= y0) return

  const pw = x1 - x0; const ph = y1 - y0

  // Grab source pixels
  const tmp = document.createElement('canvas')
  tmp.width = pw; tmp.height = ph
  const tCtx = tmp.getContext('2d', { willReadFrequently: true })!
  tCtx.drawImage(srcCanvas, x0, y0, pw, ph, 0, 0, pw, ph)

  // Apply effect on tmp (same as brush but no feather — we'll feather at composite)
  const lcx = imgCX - x0; const lcy = imgCY - y0
  if (effect === 'blackout') {
    tCtx.fillStyle = '#000'; tCtx.beginPath(); tCtx.arc(lcx, lcy, r, 0, Math.PI * 2); tCtx.fill()
  } else if (effect === 'emoji') {
    const size = Math.max(20, r * 1.35)
    tCtx.font = `${Math.round(size)}px system-ui, sans-serif`
    tCtx.textAlign = 'center'; tCtx.textBaseline = 'middle'
    tCtx.fillText(emoji, lcx, lcy)
  } else {
    // Use local patch coords (0,0,pw,ph) to avoid clamping to a tiny area
    applyEffectRect(tCtx, effect, 0, 0, pw, ph, strength, emoji)
  }

  // Feather mask
  const innerR = r * FEATHER_CORE
  const grad = tCtx.createRadialGradient(lcx, lcy, innerR, lcx, lcy, r)
  grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(1, 'rgba(0,0,0,0)')
  tCtx.globalCompositeOperation = 'destination-in'
  tCtx.fillStyle = grad; tCtx.fillRect(0, 0, pw, ph)
  tCtx.globalCompositeOperation = 'source-over'

  // Draw to overlay at 70% opacity so original is still visible
  const dx = drawX + x0 * scale; const dy = drawY + y0 * scale
  const dw = pw * scale; const dh = ph * scale
  overlayCtx.save()
  overlayCtx.globalAlpha = 0.72
  overlayCtx.drawImage(tmp, dx, dy, dw, dh)
  overlayCtx.restore()
}

// ── Glitch & Transform effects (batch) ────────────────────────────────────────

export type PixelShiftType = 'wave' | 'shear' | 'ripple' | 'mirror'

export interface GlitchParams {
  subEffect: GlitchSubEffect
  amount: number          // 1–100 overall intensity
  seed: number            // 1–200 randomness seed
  halftoneDotSize: number
  halftoneShape: 'circle' | 'square' | 'triangle'
  // Extended per-effect params (all optional — fall back to amount-derived defaults)
  halftoneContrast?: number   // 0–100
  halftoneAngle?: number      // 0–360 degrees
  glitchShift?: number        // 1–40  horizontal phase-shift magnitude
  glitchColorSplit?: number   // 0–30  chromatic aberration width
  pixelShiftX?: number        // 1–60
  pixelShiftY?: number        // 1–60
  pixelShiftType?: PixelShiftType
  colorShiftHue?: number      // 0–360 hue rotation degrees
  colorShiftSat?: number      // 0–100 saturation boost %
}

/**
 * Apply a glitch/halftone/pixel-shift/color-shift effect to the entire canvas.
 * Returns a new canvas with the effect applied (non-destructive).
 */
export async function applyGlitchEffect(
  srcCanvas: HTMLCanvasElement,
  params: GlitchParams,
): Promise<HTMLCanvasElement> {
  const { subEffect, amount, halftoneDotSize, halftoneShape } = params
  const w = srcCanvas.width
  const h = srcCanvas.height
  const out = document.createElement('canvas')
  out.width = w; out.height = h
  const ctx = out.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(srcCanvas, 0, 0)

  if (subEffect === 'halftone') {
    await applyHalftoneEffect(ctx, out, halftoneDotSize, halftoneShape, params.halftoneContrast, params.halftoneAngle)
  } else if (subEffect === 'pixel-shift') {
    applyPixelShiftEffect(ctx, out, amount, params.pixelShiftX, params.pixelShiftY, params.pixelShiftType)
  } else if (subEffect === 'color-shift') {
    applyColorShiftEffect(ctx, out, amount, params.colorShiftHue, params.colorShiftSat)
  } else if (subEffect === 'glitch') {
    applyPhaseGlitchEffect(ctx, out, amount, params.glitchShift, params.glitchColorSplit)
  }

  return out
}

// ── Pure-canvas glitch/shift implementations ─────────────────────────────────

/**
 * Phase-shift glitch: converts to greyscale, then cuts image into horizontal bands
 * and shifts each band left/right by a large random amount (wrapping).
 * Some bands are inverted for a harsh digital-corruption look.
 * No chromatic aberration — clean B&W block-slice aesthetic.
 */
function applyPhaseGlitchEffect(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  amount: number,
  glitchShift?: number,
  _colorSplit?: number,   // kept for API compat but not used
) {
  const w = canvas.width; const h = canvas.height
  const original = ctx.getImageData(0, 0, w, h)
  const origData = new Uint8ClampedArray(original.data)

  // Convert to greyscale first
  const grey = new Uint8ClampedArray(origData.length)
  for (let i = 0; i < origData.length; i += 4) {
    const luma = Math.round(0.299 * origData[i] + 0.587 * origData[i + 1] + 0.114 * origData[i + 2])
    grey[i] = grey[i + 1] = grey[i + 2] = luma
    grey[i + 3] = origData[i + 3]
  }

  const maxShift = glitchShift != null
    ? Math.max(2, Math.floor((glitchShift / 40) * w * 0.35))
    : Math.max(4, Math.floor((amount / 100) * w * 0.25))
  const numBands = Math.max(5, Math.floor((amount / 100) * 24) + 4)
  const invertChance = (amount / 100) * 0.35   // up to 35% of bands get inverted

  // Build per-row shifts
  const bandShifts = new Int32Array(h)
  const bandInvert = new Uint8Array(h)
  let row = 0
  while (row < h) {
    const bandH = Math.max(1, Math.floor(h / numBands * (0.3 + Math.random() * 1.4)))
    const dx = (Math.random() > 0.45 ? 1 : -1) * Math.floor(Math.random() * maxShift)
    const inv = Math.random() < invertChance ? 1 : 0
    for (let r = row; r < Math.min(h, row + bandH); r++) {
      bandShifts[r] = dx
      bandInvert[r] = inv
    }
    row += bandH
  }

  const out = new Uint8ClampedArray(origData.length)
  for (let r = 0; r < h; r++) {
    const dx = bandShifts[r]
    const inv = bandInvert[r]
    for (let x = 0; x < w; x++) {
      const di = (r * w + x) * 4
      const sx = ((x + dx) % w + w) % w
      const si = (r * w + sx) * 4
      let v = grey[si]
      if (inv) v = 255 - v
      out[di] = out[di + 1] = out[di + 2] = v
      out[di + 3] = 255
    }
  }

  const outData = ctx.createImageData(w, h)
  outData.data.set(out)
  ctx.putImageData(outData, 0, 0)
}

function applyPixelShiftEffect(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  amount: number,
  pixelShiftX?: number,
  pixelShiftY?: number,
  shiftType?: PixelShiftType,
) {
  const w = canvas.width; const h = canvas.height
  const imageData = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(imageData.data)
  const d = imageData.data
  const maxX = pixelShiftX != null ? pixelShiftX : Math.max(1, Math.floor((amount / 100) * 40))
  const maxY = pixelShiftY != null ? pixelShiftY : 0
  const type = shiftType ?? 'wave'
  const cx = w / 2; const cy = h / 2

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let srcX: number; let srcY: number

      if (type === 'wave') {
        const xShift = Math.floor(Math.sin(y * 0.08) * maxX)
        const yShift = maxY > 0 ? Math.floor(Math.cos(y * 0.05) * maxY) : 0
        srcX = Math.max(0, Math.min(w - 1, x + xShift))
        srcY = Math.max(0, Math.min(h - 1, y + yShift))
      } else if (type === 'shear') {
        const xShift = Math.floor((y / h - 0.5) * maxX * 2)
        const yShift = maxY > 0 ? Math.floor((x / w - 0.5) * maxY * 2) : 0
        srcX = Math.max(0, Math.min(w - 1, x + xShift))
        srcY = Math.max(0, Math.min(h - 1, y + yShift))
      } else if (type === 'ripple') {
        const dx = x - cx; const dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.sin(dist * 0.12) * (maxX / (w || 1)) * Math.PI
        const cosA = Math.cos(angle); const sinA = Math.sin(angle)
        srcX = Math.max(0, Math.min(w - 1, Math.round(cx + dx * cosA - dy * sinA)))
        srcY = Math.max(0, Math.min(h - 1, Math.round(cy + dx * sinA + dy * cosA)))
      } else if (type === 'mirror') {
        const xShift = Math.floor(Math.sin(x * 0.04) * maxX)
        const yShift = maxY > 0 ? Math.floor(Math.sin(x * 0.04) * maxY) : 0
        srcX = Math.max(0, Math.min(w - 1, x + xShift))
        srcY = Math.max(0, Math.min(h - 1, y + yShift))
      } else {
        srcX = x; srcY = y
      }

      const dst = (y * w + x) * 4
      const s = (srcY * w + srcX) * 4
      d[dst] = src[s]; d[dst + 1] = src[s + 1]; d[dst + 2] = src[s + 2]; d[dst + 3] = src[s + 3]
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyColorShiftEffect(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  amount: number,
  hueRotation?: number,
  satBoost?: number,
) {
  const w = canvas.width; const h = canvas.height
  const imageData = ctx.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(imageData.data)
  const d = imageData.data
  // Chromatic aberration shift
  const shift = Math.max(1, Math.floor((amount / 100) * 20))

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const rx = Math.min(w - 1, x + shift)
      const bx = Math.max(0, x - shift)
      const ri = (y * w + rx) * 4
      const bi = (y * w + bx) * 4
      let r = src[ri]
      let g = src[i + 1]
      let b = src[bi + 2]
      // Apply hue rotation and saturation boost if requested
      if (hueRotation || satBoost) {
        ;[r, g, b] = rotateHueSat(r, g, b, hueRotation ?? 0, (satBoost ?? 0) / 100)
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = src[i + 3]
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

/** Rotate hue and boost saturation of an RGB pixel. Returns new [r, g, b]. */
function rotateHueSat(r: number, g: number, b: number, hueDeg: number, satAdd: number): [number, number, number] {
  // RGB → HSL
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d2 = max - min
    s = l > 0.5 ? d2 / (2 - max - min) : d2 / (max + min)
    if (max === rn) h = (gn - bn) / d2 + (gn < bn ? 6 : 0)
    else if (max === gn) h = (bn - rn) / d2 + 2
    else h = (rn - gn) / d2 + 4
    h /= 6
  }
  h = (h + hueDeg / 360) % 1
  s = Math.min(1, Math.max(0, s + satAdd))
  // HSL → RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p2 = 2 * l - q2
  return [
    Math.round(hue2rgb(p2, q2, h + 1/3) * 255),
    Math.round(hue2rgb(p2, q2, h) * 255),
    Math.round(hue2rgb(p2, q2, h - 1/3) * 255),
  ]
}

async function applyHalftoneEffect(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dotSize: number,
  shape: 'circle' | 'square' | 'triangle',
  contrast?: number,
  angle?: number,
) {
  // Try to use @9am/img-halftone if available, else pure-canvas fallback
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — @9am/img-halftone package.json exports field causes resolution issue
    const halftoneModule = await import('@9am/img-halftone')
    const halftone = halftoneModule.default ?? halftoneModule
    if (typeof halftone === 'function') {
      // Apply contrast pre-pass before halftone if requested
      if (contrast && contrast !== 50) {
        applyContrastPrepass(ctx, canvas, contrast)
      }
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => b ? res(b) : rej(new Error('toBlob failed')), 'image/png'))
      const url = URL.createObjectURL(blob)
      try {
        const result: HTMLCanvasElement | null = await halftone(url, { size: dotSize, shape, angle: (angle ?? 45) % 360 })
        if (result) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(result, 0, 0)
        }
      } finally {
        URL.revokeObjectURL(url)
      }
      return
    }
  } catch { /* fallback */ }
  // Pure-canvas halftone fallback
  applyPureHalftone(ctx, canvas, dotSize, shape, contrast, angle)
}

/** Boost contrast as a pre-pass before halftone rendering */
function applyContrastPrepass(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  contrast: number,
) {
  const factor = (contrast - 50) / 50  // -1 to +1
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = imageData.data
  const adjust = Math.floor(factor * 80)  // ±80 pixel value shift
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.max(0, Math.min(255, d[i]     + (d[i]     > 128 ? adjust : -adjust)))
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + (d[i + 1] > 128 ? adjust : -adjust)))
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + (d[i + 2] > 128 ? adjust : -adjust)))
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyPureHalftone(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dotSize: number,
  shape: 'circle' | 'square' | 'triangle',
  contrast?: number,
  angle?: number,
) {
  const w = canvas.width; const h = canvas.height
  if (contrast && contrast !== 50) applyContrastPrepass(ctx, canvas, contrast)
  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)

  const step = Math.max(2, dotSize)
  const rad = ((angle ?? 45) * Math.PI) / 180
  const cosA = Math.cos(rad); const sinA = Math.sin(rad)
  // Rotate grid around canvas center so the pattern always covers the full image
  const ox = w / 2; const oy = h / 2
  // Expand iteration range to diagonal length so rotated grid fully covers all canvas edges
  const diag = Math.ceil(Math.sqrt(w * w + h * h))
  ctx.fillStyle = '#000'

  for (let v = -diag; v < diag; v += step) {
    for (let u = -diag; u < diag; u += step) {
      // Map grid (u, v) to canvas coordinates by rotating around center
      const rx = Math.round(ox + u * cosA - v * sinA)
      const ry = Math.round(oy + u * sinA + v * cosA)
      if (rx < 0 || rx >= w || ry < 0 || ry >= h) continue
      const px = (ry * w + rx) * 4
      const luma = 0.299 * d[px] + 0.587 * d[px + 1] + 0.114 * d[px + 2]
      const r = ((255 - luma) / 255) * (step / 2) * 0.85
      if (r < 0.5) continue
      ctx.beginPath()
      if (shape === 'square') {
        ctx.rect(rx - r, ry - r, r * 2, r * 2)
      } else if (shape === 'triangle') {
        ctx.moveTo(rx, ry - r)
        ctx.lineTo(rx + r, ry + r)
        ctx.lineTo(rx - r, ry + r)
        ctx.closePath()
      } else {
        ctx.arc(rx, ry, r, 0, Math.PI * 2)
      }
      ctx.fill()
    }
  }
}
