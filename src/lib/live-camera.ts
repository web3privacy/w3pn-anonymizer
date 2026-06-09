import { expandNormBox } from './face-offset'
import { detectFaces } from './detector'
import { applyColorAdjustments, applyEffectRect, pickRandomEmoji } from './effects'
import type { EffectRenderOptions } from '../types'
import { applyDistortPipeline, distortPipelineKey } from './distort-effects'
import {
  livePipelineHasWork,
  smoothPipelineMs,
} from './live-pipeline-timing'
import { type LiveTransformOpts } from './live-transform'
import { computeSourceCrop, type LiveAspectRatio } from './live-camera-viewport'
import type { AnonymizeEffectId, ColorAdjustments, CustomImageAsset, CustomImageSource, Zone } from '../types'

const DETECT_INTERVAL_MS = 160
// When the frame is moving fast we detect much more often so coverage keeps up.
const DETECT_INTERVAL_FAST_MS = 70
const ZONE_LERP = 0.78
const ZONE_PAD = 0.1
// Safety floor so a face can't slip out between detections even at offset 0.
// The user's "face offset" usually sits above this; motion adds more on top.
const SAFETY_PAD_MIN = 0.1
const SAFETY_PAD_MAX = 0.7
// How far ahead (ms) we extrapolate a moving face so the cover leads the motion.
const ZONE_LOOKAHEAD_MS = 130
const MOTION_SAMPLE_W = 48
const TRANSFORM_INTERVAL_MS = 66
const PREVIEW_MAX_WIDTH = 640
const DETECT_MAX_WIDTH = 480
// The live preview loop detects on a smaller frame than photo capture so the
// per-frame inference stays cheap (single-thread WASM) and framerate is smooth.
const DETECT_MAX_WIDTH_LIVE = 320
const TRANSFORM_MAX_WIDTH = 640
const CAPTURE_JPEG_QUALITY = 0.92

const detectCanvas = document.createElement('canvas')
const effectScratch = document.createElement('canvas')
const transformScratch = document.createElement('canvas')
const transformSource = document.createElement('canvas')
const captureCanvas = document.createElement('canvas')
const rawDetectCanvas = document.createElement('canvas')
const motionCanvas = document.createElement('canvas')

export interface LiveCameraOpts {
  detectEnabled: boolean
  selectedEffect: AnonymizeEffectId
  brushStrength: number
  colorAdj: ColorAdjustments
  transform: LiveTransformOpts
  camera: Pick<{ aspectRatio: LiveAspectRatio }, 'aspectRatio'>
  customImages?: CustomImageAsset[]
  customImageSource?: CustomImageSource
  /** When set, every emoji-anonymized face uses this exact emoji (not random). */
  fixedEmoji?: string
  /** When set, every custom-image face uses this exact asset id (not random). */
  fixedCustomImageId?: string
  /** Static anonymization halo around each face, as a fraction of face size. */
  faceOffset?: number
  /** Stable track IDs the user opted OUT of anonymizing (kept un-blurred). */
  ignoredFaceIds?: Set<string>
  /** Normalized boxes of opted-out faces, so still-frame captures skip them too. */
  ignoredFaceBoxes?: { x: number; y: number; width: number; height: number }[]
  /** Live-tracked zones from the preview loop — still capture reuses these for WYSIWYG. */
  snapshotZones?: Zone[]
}

/** A single tracked face exposed to the UI for overlay boxes / removal. */
export interface LiveZoneInfo {
  id: string
  x: number
  y: number
  width: number
  height: number
  /** True when the user opted this face out of anonymization. */
  ignored: boolean
}

export interface LiveCameraCallbacks {
  onDetectError?: () => void
  onFaceCount?: (count: number) => void
  onEffectTransition?: (active: boolean) => void
  onPipelineMs?: (ms: number) => void
  /** Smoothed live redraw rate (frames/sec actually rendered, incl. effects). */
  onFps?: (fps: number) => void
  /** Fires every frame with the currently tracked faces (smoothed positions). */
  onZones?: (zones: LiveZoneInfo[]) => void
  /** Latest smoothed anonymization zones (for still capture). */
  onSnapshotZones?: (zones: readonly Zone[]) => void
}

interface NormBox {
  x: number
  y: number
  width: number
  height: number
}

/** A persistent face track: stable id + smoothed box + velocity across frames. */
interface LiveTrack extends NormBox {
  id: string
  vx: number
  vy: number
  emoji: string
  misses: number
}

// A track survives this many missed detections before it's dropped — long
// enough to keep identity (and opt-out memory) through brief occlusions.
const MAX_TRACK_MISSES = 6

function boxIoU(a: NormBox, b: NormBox): number {
  const ax2 = a.x + a.width
  const ay2 = a.y + a.height
  const bx2 = b.x + b.width
  const by2 = b.y + b.height
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x))
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y))
  const inter = ix * iy
  const union = a.width * a.height + b.width * b.height - inter
  return union > 0 ? inter / union : 0
}

function boxCenterDist(a: NormBox, b: NormBox): number {
  const acx = a.x + a.width / 2
  const acy = a.y + a.height / 2
  const bcx = b.x + b.width / 2
  const bcy = b.y + b.height / 2
  return Math.hypot(acx - bcx, acy - bcy)
}

function lerpZone(from: Zone, to: Zone, t: number): Zone {
  return {
    ...to,
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    width: from.width + (to.width - from.width) * t,
    height: from.height + (to.height - from.height) * t,
  }
}

function zonesFromBoxes(
  boxes: { x: number; y: number; width: number; height: number }[],
  w: number,
  h: number,
  effect: AnonymizeEffectId,
  emojis: Map<number, string>,
): Zone[] {
  return boxes.map((box, i) => ({
    id: `live-${i}`,
    x: box.x / w,
    y: box.y / h,
    width: box.width / w,
    height: box.height / h,
    effect,
    emoji: emojis.get(i) ?? pickRandomEmoji(),
  }))
}

// Overlay effects cover the face with a separate graphic and should NOT be
// clipped to the (square) zone scratch or feathered — they're drawn directly.
const OVERLAY_EFFECTS = new Set<AnonymizeEffectId>(['emoji', 'custom-image'])

function applyFeatheredEffect(
  ctx: CanvasRenderingContext2D,
  zone: Zone,
  w: number,
  h: number,
  strength: number,
  effectOptions?: EffectRenderOptions,
  pad: number = ZONE_PAD,
) {
  // Emoji / custom-image overlays fill the same expanded region as the live
  // selection outline (face offset + motion halo), not just the raw detect box.
  if (OVERLAY_EFFECTS.has(zone.effect)) {
    const padX = pad
    const padY = pad + 0.06
    const box = expandNormBox(zone.x, zone.y, zone.width, zone.height, padX, padY)
    applyEffectRect(ctx, zone.effect, box.x * w, box.y * h, box.width * w, box.height * h, strength, zone.emoji, {
      ...effectOptions,
      zoneId: zone.id,
      customImageAssetId: zone.customImageAssetId,
    })
    return
  }

  // Vertical pad gets a small extra bump so foreheads / chins stay covered and
  // the anonymized region matches the display outline (liveZoneDisplayRect uses
  // padY = padX + 0.06).
  const padX = zone.width * pad
  const padY = zone.height * (pad + 0.06)
  const nx = Math.max(0, zone.x - padX)
  const ny = Math.max(0, zone.y - padY)
  const nw = Math.min(1 - nx, zone.width + padX * 2)
  const nh = Math.min(1 - ny, zone.height + padY * 2)

  const ox = Math.floor(nx * w)
  const oy = Math.floor(ny * h)
  const ow = Math.max(1, Math.ceil(nw * w))
  const oh = Math.max(1, Math.ceil(nh * h))

  if (effectScratch.width !== ow || effectScratch.height !== oh) {
    effectScratch.width = ow
    effectScratch.height = oh
  }
  const sctx = effectScratch.getContext('2d')
  if (!sctx) return

  sctx.clearRect(0, 0, ow, oh)
  sctx.drawImage(ctx.canvas, ox, oy, ow, oh, 0, 0, ow, oh)

  // Apply the effect across the WHOLE padded region (not just the inner detected
  // box) so the anonymized area actually fills the face-offset selection. The
  // radial feather below softens the edges for a natural blend.
  applyEffectRect(sctx, zone.effect, 0, 0, ow, oh, strength, zone.emoji, {
    ...effectOptions,
    zoneId: zone.id,
    customImageAssetId: zone.customImageAssetId,
  })

  const cx = ow / 2
  const cy = oh / 2
  const rx = ow / 2
  const ry = oh / 2
  const grad = sctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.35, cx, cy, Math.max(rx, ry))
  // Keep the effect fully solid across most of the padded region so the offset
  // is actually filled; only the outermost edge feathers for a soft blend.
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.85, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')

  sctx.globalCompositeOperation = 'destination-in'
  sctx.fillStyle = grad
  sctx.fillRect(0, 0, ow, oh)
  sctx.globalCompositeOperation = 'source-over'

  ctx.drawImage(effectScratch, ox, oy)
}

function liveEffectOptions(opts: LiveCameraOpts, zone: Zone): EffectRenderOptions {
  return {
    customImages: opts.customImages,
    customImageSource: opts.customImageSource,
    zoneId: zone.id,
    customImageAssetId: opts.fixedCustomImageId ?? zone.customImageAssetId,
  }
}

/** Apply the user's confirmed emoji/custom-image choice to a live zone. */
function withFixedOverlay(opts: LiveCameraOpts, zone: Zone): Zone {
  if (opts.selectedEffect === 'emoji' && opts.fixedEmoji) {
    return { ...zone, effect: opts.selectedEffect, emoji: opts.fixedEmoji }
  }
  if (opts.selectedEffect === 'custom-image' && opts.fixedCustomImageId) {
    return { ...zone, effect: opts.selectedEffect, customImageAssetId: opts.fixedCustomImageId }
  }
  return { ...zone, effect: opts.selectedEffect }
}

function syncZoneEffect(zones: Zone[], effect: AnonymizeEffectId): Zone[] {
  return zones.map((z) => (z.effect === effect ? z : { ...z, effect }))
}

function transformFingerprint(opts: LiveCameraOpts): string {
  const t = opts.transform
  return distortPipelineKey(t.enabled, t.strengths, t.params, t.pixelShiftType)
}

interface PipelineTimingState {
  smoothedMs: number | null
  lastDistortPassMs: number | null
  lastSyncEffectsMs: number | null
  lastReportedMs: number | null
}

function reportPipelineMs(
  callbacks: LiveCameraCallbacks | undefined,
  timing: PipelineTimingState,
  opts: LiveCameraOpts,
  faceCount: number,
) {
  if (!callbacks?.onPipelineMs) return
  const distortOn = opts.transform.enabled.length > 0
  const hasWork = livePipelineHasWork(opts.colorAdj, distortOn, opts.detectEnabled, faceCount)
  if (!hasWork) {
    if (timing.lastReportedMs !== 0) {
      timing.lastReportedMs = 0
      callbacks.onPipelineMs(0)
    }
    return
  }
  // Use the smoothed real per-frame cost (measured for free during the draw).
  const out = timing.smoothedMs != null && timing.smoothedMs > 0 ? timing.smoothedMs : null
  if (out == null) return
  if (timing.lastReportedMs !== out) {
    timing.lastReportedMs = out
    callbacks.onPipelineMs(out)
  }
}

interface ZoneVelocity {
  vx: number
  vy: number
}

interface FramePipelineState {
  displayZones: Zone[]
  targetZones: Zone[]
  // Persistent face tracks (stable ids) — source of truth for detection.
  tracks: LiveTrack[]
  nextTrackId: number
  fadeFrames: number
  lastEffect: AnonymizeEffectId | null
  effectTransitionFrames: number
  transformReady: boolean
  transformGen: number
  lastTransformKey: string
  // Motion / prediction state for leak-proof coverage. Velocity keyed by track id.
  zoneVelocity: Map<string, ZoneVelocity>
  lastDetectTs: number
  prevDetectTs: number
  motion: number
  motionPrev: Uint8ClampedArray | null
}

/** Cheap whole-frame motion estimate (0..1) via downscaled grayscale frame diff. */
function estimateMotion(source: HTMLCanvasElement, state: FramePipelineState): number {
  const w = MOTION_SAMPLE_W
  const h = Math.max(1, Math.round((source.height / source.width) * w))
  if (motionCanvas.width !== w || motionCanvas.height !== h) {
    motionCanvas.width = w
    motionCanvas.height = h
    state.motionPrev = null
  }
  const mctx = motionCanvas.getContext('2d', { alpha: false })
  if (!mctx) return 0
  mctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, w, h)
  const data = mctx.getImageData(0, 0, w, h).data
  const prev = state.motionPrev
  const cur = new Uint8ClampedArray(w * h)
  let diffSum = 0
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0
    cur[p] = lum
    if (prev) diffSum += Math.abs(lum - prev[p])
  }
  state.motionPrev = cur
  if (!prev) return 0
  // Normalize: average per-pixel luminance delta mapped to ~0..1.
  const avg = diffSum / (w * h)
  return Math.min(1, avg / 24)
}

/** Predict where a moving zone will be `aheadMs` from its last detection and pad it. */
function predictZone(zone: Zone, vel: ZoneVelocity | undefined, aheadMs: number): Zone {
  if (!vel) return zone
  return {
    ...zone,
    x: zone.x + vel.vx * aheadMs,
    y: zone.y + vel.vy * aheadMs,
  }
}

function drawBaseFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  pw: number,
  ph: number,
  crop: { sx: number; sy: number; sw: number; sh: number },
) {
  if (ctx.canvas.width !== pw || ctx.canvas.height !== ph) {
    ctx.canvas.width = pw
    ctx.canvas.height = ph
  }
  ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, pw, ph)
}

function applyFrameEffects(
  ctx: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  opts: LiveCameraOpts,
  state: FramePipelineState,
  callbacks: LiveCameraCallbacks | undefined,
  timing: PipelineTimingState,
) {
  const pipelineT0 = performance.now()

  applyColorAdjustments(ctx, opts.colorAdj, ctx.canvas)

  const sub = opts.transform.enabled.length > 0
  const key = transformFingerprint(opts)
  if (sub) {
    if (key !== state.lastTransformKey) {
      state.lastTransformKey = key
      state.transformReady = false
      state.transformGen += 1
    }
    if (state.transformReady && transformScratch.width > 0) {
      ctx.drawImage(transformScratch, 0, 0, pw, ph)
    }
  } else {
    state.transformReady = false
    state.lastTransformKey = ''
    state.transformGen += 1
  }

  if (opts.detectEnabled) {
    const ignored = opts.ignoredFaceIds
    // Grow the covered halo with motion + per-zone speed so fast head moves
    // never expose an un-anonymized face between detections.
    for (let i = 0; i < state.displayZones.length; i += 1) {
      const zone = state.displayZones[i]
      // Opted-out faces are tracked + drawn as boxes but never anonymized.
      if (ignored && ignored.has(zone.id)) continue
      const vel = state.zoneVelocity.get(zone.id)
      const speed = vel ? Math.hypot(vel.vx, vel.vy) : 0
      // User-controlled "face offset" sets the static coverage; motion + per-zone
      // speed add extra halo so a fast head can't slip out between detections.
      const staticPad = Math.max(SAFETY_PAD_MIN, opts.faceOffset ?? 0.1)
      const pad = Math.min(
        SAFETY_PAD_MAX,
        staticPad + state.motion * 0.35 + speed * 600,
      )
      applyFeatheredEffect(ctx, withFixedOverlay(opts, zone), pw, ph, opts.brushStrength, liveEffectOptions(opts, zone), pad)
    }
    // Surface tracked faces so the UI can draw removal boxes over the preview.
    callbacks?.onZones?.(state.displayZones.map((z) => ({
      id: z.id,
      x: z.x,
      y: z.y,
      width: z.width,
      height: z.height,
      ignored: ignored ? ignored.has(z.id) : false,
    })))
    callbacks?.onSnapshotZones?.(state.displayZones)
  }

  if (state.effectTransitionFrames > 0) {
    state.effectTransitionFrames -= 1
    if (state.effectTransitionFrames === 0) callbacks?.onEffectTransition?.(false)
  }

  // The real frame's effect cost is measured here for free (color + distort
  // blit + per-face effects). Smooth and report it directly — no separate
  // duplicate "benchmark" pass is needed (that doubled work and caused hitches).
  timing.lastSyncEffectsMs = Math.round(performance.now() - pipelineT0)
  timing.smoothedMs = smoothPipelineMs(timing.smoothedMs, timing.lastSyncEffectsMs)
  reportPipelineMs(callbacks, timing, opts, state.displayZones.length)
}

export interface LiveCameraLoop {
  stop: () => void
}

export function startLiveCameraLoop(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  getOpts: () => LiveCameraOpts,
  callbacks?: LiveCameraCallbacks,
): LiveCameraLoop {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return { stop: () => {} }

  let stopped = false
  let detectPending = false
  let lastDetectAt = 0
  let lastTransformAt = 0
  const transformPending = { current: false }

  // ── Real redraw FPS (reflects effect cost: heavier filters ⇒ lower FPS) ──
  let lastTickTs = 0
  let fpsSmoothed: number | null = null
  let lastFpsReport = 0
  let lastFpsValue = -1

  const timing: PipelineTimingState = {
    smoothedMs: null,
    lastDistortPassMs: null,
    lastSyncEffectsMs: null,
    lastReportedMs: null,
  }

  const state: FramePipelineState = {
    displayZones: [],
    targetZones: [],
    tracks: [],
    nextTrackId: 0,
    fadeFrames: 0,
    lastEffect: null,
    effectTransitionFrames: 0,
    transformReady: false,
    transformGen: 0,
    lastTransformKey: '',
    zoneVelocity: new Map(),
    lastDetectTs: 0,
    prevDetectTs: 0,
    motion: 0,
    motionPrev: null,
  }

  const runTransformPass = (srcW: number, srcH: number, opts: LiveCameraOpts) => {
    if (opts.transform.enabled.length === 0 || transformPending.current) return
    transformPending.current = true
    const gen = ++state.transformGen
    const key = transformFingerprint(opts)
    const t0 = performance.now()

    void (async () => {
      try {
        const result = await applyDistortPipeline(
          transformSource,
          opts.transform.enabled,
          opts.transform.strengths,
          opts.transform.params,
          opts.transform.pixelShiftType,
        )
        if (gen !== state.transformGen) return
        if (transformScratch.width !== srcW || transformScratch.height !== srcH) {
          transformScratch.width = srcW
          transformScratch.height = srcH
        }
        transformScratch.getContext('2d')!.drawImage(result, 0, 0, srcW, srcH)
        state.transformReady = true
        state.lastTransformKey = key
        const distortMs = Math.round(performance.now() - t0)
        timing.lastDistortPassMs = distortMs
        timing.smoothedMs = smoothPipelineMs(timing.smoothedMs, distortMs + (timing.lastSyncEffectsMs ?? 0))
        reportPipelineMs(callbacks, timing, opts, state.displayZones.length)
      } catch {
        state.transformReady = false
      } finally {
        transformPending.current = false
      }
    })()
  }

  let lastFaceCountReport = 0

  const reportFaceCount = (count: number) => {
    if (count === lastFaceCountReport) return
    lastFaceCountReport = count
    callbacks?.onFaceCount?.(count)
  }

  const runDetect = async (pw: number, ph: number, opts: LiveCameraOpts) => {
    if (!opts.detectEnabled || detectPending) return
    detectPending = true
    try {
      const scale = Math.min(1, DETECT_MAX_WIDTH_LIVE / pw)
      const dw = Math.max(1, Math.round(pw * scale))
      const dh = Math.max(1, Math.round(ph * scale))
      if (detectCanvas.width !== dw || detectCanvas.height !== dh) {
        detectCanvas.width = dw
        detectCanvas.height = dh
      }
      const dctx = detectCanvas.getContext('2d')
      if (!dctx) return
      // Detect on raw camera frame — not color/distort-processed canvas.
      dctx.drawImage(rawDetectCanvas, 0, 0, pw, ph, 0, 0, dw, dh)

      const boxes = await detectFaces(detectCanvas, false)
      const detections: NormBox[] = boxes.map((box) => ({
        x: box.x / dw,
        y: box.y / dh,
        width: box.width / dw,
        height: box.height / dh,
      }))

      const now = performance.now()
      const dt = state.lastDetectTs > 0 ? Math.max(1, now - state.lastDetectTs) : 0
      const prevTracks = state.tracks
      const prevCount = state.targetZones.length

      // Match each detection to the nearest previous track by IoU + proximity so
      // a face keeps a STABLE id frame-to-frame (required for opt-out memory).
      const usedTrack = new Set<number>()
      const nextTracks: LiveTrack[] = []
      detections.forEach((box) => {
        let best = -1
        let bestScore = 0
        prevTracks.forEach((tr, ti) => {
          if (usedTrack.has(ti)) return
          const overlap = boxIoU(box, tr)
          const dist = boxCenterDist(box, tr)
          if (overlap < 0.1 && dist > 0.14) return
          const score = overlap * 1.5 + Math.max(0, 1 - dist / 0.25)
          if (score > bestScore) {
            best = ti
            bestScore = score
          }
        })
        if (best >= 0) {
          usedTrack.add(best)
          const prev = prevTracks[best]
          const cxNew = box.x + box.width / 2
          const cyNew = box.y + box.height / 2
          const cxOld = prev.x + prev.width / 2
          const cyOld = prev.y + prev.height / 2
          nextTracks.push({
            ...prev,
            ...box,
            vx: dt > 0 ? (cxNew - cxOld) / dt : 0,
            vy: dt > 0 ? (cyNew - cyOld) / dt : 0,
            misses: 0,
          })
        } else {
          nextTracks.push({
            id: `lt-${state.nextTrackId++}`,
            ...box,
            vx: 0,
            vy: 0,
            emoji: pickRandomEmoji(),
            misses: 0,
          })
        }
      })
      // Carry forward unmatched tracks briefly so identity + opt-out persists
      // through a missed detection (occlusion, fast turn), then expire them.
      prevTracks.forEach((tr, ti) => {
        if (usedTrack.has(ti)) return
        if (tr.misses + 1 <= MAX_TRACK_MISSES) {
          nextTracks.push({ ...tr, vx: 0, vy: 0, misses: tr.misses + 1 })
        }
      })
      state.tracks = nextTracks
      state.prevDetectTs = state.lastDetectTs
      state.lastDetectTs = now

      // Only currently-visible tracks become zones; missed tracks stay alive for
      // identity but aren't drawn at stale positions.
      const visible = nextTracks.filter((t) => t.misses === 0)
      const velocity = new Map<string, ZoneVelocity>()
      visible.forEach((t) => velocity.set(t.id, { vx: t.vx, vy: t.vy }))
      state.zoneVelocity = velocity
      state.targetZones = visible.map((t) => ({
        id: t.id,
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
        effect: opts.selectedEffect,
        emoji: t.emoji,
      }))
      if (state.targetZones.length !== prevCount) state.fadeFrames = 2
      if (state.displayZones.length === 0) state.displayZones = state.targetZones.map((z) => ({ ...z }))
      reportFaceCount(state.targetZones.length)
    } catch {
      callbacks?.onDetectError?.()
    } finally {
      detectPending = false
    }
  }

  const tick = (ts: number) => {
    if (stopped) return
    const opts = getOpts()

    // Measure the true frame interval (this callback fires once per rendered
    // frame), smooth it, and report a few times per second.
    if (lastTickTs > 0) {
      const dt = ts - lastTickTs
      if (dt > 0 && dt < 1000) {
        const inst = 1000 / dt
        fpsSmoothed = fpsSmoothed == null ? inst : fpsSmoothed * 0.85 + inst * 0.15
      }
    }
    lastTickTs = ts
    if (fpsSmoothed != null && ts - lastFpsReport > 400) {
      lastFpsReport = ts
      const fps = Math.min(120, Math.round(fpsSmoothed))
      if (fps !== lastFpsValue) {
        lastFpsValue = fps
        callbacks?.onFps?.(fps)
      }
    }

    if (state.lastEffect !== null && opts.selectedEffect !== state.lastEffect) {
      state.effectTransitionFrames = 2
      callbacks?.onEffectTransition?.(true)
      state.displayZones = syncZoneEffect(state.displayZones, opts.selectedEffect)
      state.targetZones = syncZoneEffect(state.targetZones, opts.selectedEffect)
    }
    state.lastEffect = opts.selectedEffect

    if (video.readyState >= 2) {
      const w = video.videoWidth
      const h = video.videoHeight
      if (w > 0 && h > 0) {
        const crop = computeSourceCrop(w, h, opts.camera.aspectRatio)
        const previewScale = Math.min(1, PREVIEW_MAX_WIDTH / crop.sw)
        const pw = Math.max(1, Math.round(crop.sw * previewScale))
        const ph = Math.max(1, Math.round(crop.sh * previewScale))

        drawBaseFrame(ctx, video, pw, ph, crop)

        if (opts.detectEnabled) {
          // Motion runs every frame off the (still-raw) preview canvas — cheap,
          // it only samples a 48px downscale. No full-size copy needed here.
          state.motion = estimateMotion(ctx.canvas, state)
          const detectInterval = state.motion > 0.12
            ? DETECT_INTERVAL_FAST_MS
            : DETECT_INTERVAL_MS
          if (ts - lastDetectAt > detectInterval) {
            lastDetectAt = ts
            // Snapshot the raw frame only on detect frames (before effects mutate
            // the canvas) so YuNet sees the un-anonymized camera image.
            if (rawDetectCanvas.width !== pw || rawDetectCanvas.height !== ph) {
              rawDetectCanvas.width = pw
              rawDetectCanvas.height = ph
            }
            rawDetectCanvas.getContext('2d')!.drawImage(ctx.canvas, 0, 0)
            void runDetect(pw, ph, opts)
          }
          // Extrapolate each target forward by its velocity so the cover leads
          // a fast-moving face rather than trailing behind it.
          const aheadMs = state.lastDetectTs > 0
            ? (performance.now() - state.lastDetectTs) + ZONE_LOOKAHEAD_MS
            : 0
          const predicted = state.targetZones.map((z) =>
            predictZone(z, state.zoneVelocity.get(z.id), aheadMs))

          const lerpT = state.fadeFrames > 0 ? ZONE_LERP * 1.25 : ZONE_LERP
          // Lerp display zones toward predicted targets matched by stable id.
          const prevDisplay = new Map(state.displayZones.map((z) => [z.id, z]))
          state.displayZones = predicted.map((z) => {
            const prev = prevDisplay.get(z.id)
            return prev ? lerpZone(prev, z, lerpT) : { ...z }
          })
          if (state.fadeFrames > 0) state.fadeFrames -= 1
        } else {
          state.displayZones = []
          state.targetZones = []
          state.tracks = []
          state.zoneVelocity = new Map()
          reportFaceCount(0)
          callbacks?.onZones?.([])
        }

        if (opts.transform.enabled.length > 0 && !transformPending.current && ts - lastTransformAt >= TRANSFORM_INTERVAL_MS) {
          lastTransformAt = ts
          const tw = Math.min(pw, TRANSFORM_MAX_WIDTH)
          const th = Math.round(ph * (tw / pw))
          if (transformSource.width !== tw || transformSource.height !== th) {
            transformSource.width = tw
            transformSource.height = th
          }
          transformSource.getContext('2d')!.drawImage(ctx.canvas, 0, 0, pw, ph, 0, 0, tw, th)
          runTransformPass(tw, th, opts)
        }

        applyFrameEffects(ctx, pw, ph, opts, state, callbacks, timing)
      }
    }

    scheduleNext()
  }

  const scheduleNext = () => {
    if (stopped) return
    if ('requestVideoFrameCallback' in video) {
      (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
        .requestVideoFrameCallback(() => tick(performance.now()))
    } else {
      requestAnimationFrame(tick)
    }
  }

  scheduleNext()

  return {
    stop: () => {
      stopped = true
    },
  }
}

/** Render one full-resolution frame for photo / video capture. */
export async function renderLiveCaptureFrame(
  video: HTMLVideoElement,
  getOpts: () => LiveCameraOpts,
): Promise<HTMLCanvasElement | null> {
  if (video.readyState < 2 || video.videoWidth === 0) return null
  const opts = getOpts()
  const w = video.videoWidth
  const h = video.videoHeight
  const crop = computeSourceCrop(w, h, opts.camera.aspectRatio)
  const pw = Math.max(1, Math.round(crop.sw))
  const ph = Math.max(1, Math.round(crop.sh))

  captureCanvas.width = pw
  captureCanvas.height = ph
  const ctx = captureCanvas.getContext('2d', { alpha: false })
  if (!ctx) return null

  ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, pw, ph)

  let captureZones: Zone[] = []
  if (opts.detectEnabled) {
    const snap = opts.snapshotZones?.filter((z) => !opts.ignoredFaceIds?.has(z.id)) ?? []
    if (snap.length > 0) {
      captureZones = snap.map((z) => ({ ...z }))
    } else {
      const scale = Math.min(1, DETECT_MAX_WIDTH / pw)
      const dw = Math.max(1, Math.round(pw * scale))
      const dh = Math.max(1, Math.round(ph * scale))
      detectCanvas.width = dw
      detectCanvas.height = dh
      detectCanvas.getContext('2d')!.drawImage(captureCanvas, 0, 0, pw, ph, 0, 0, dw, dh)
      try {
        const boxes = await detectFaces(detectCanvas, false)
        captureZones = zonesFromBoxes(boxes, dw, dh, opts.selectedEffect, new Map())
      } catch { /* skip face detection */ }
    }
  }

  applyColorAdjustments(ctx, opts.colorAdj, captureCanvas)

  if (opts.transform.enabled.length > 0) {
    const tw = Math.min(pw, 1280)
    const th = Math.round(ph * (tw / pw))
    if (transformSource.width !== tw || transformSource.height !== th) {
      transformSource.width = tw
      transformSource.height = th
    }
    transformSource.getContext('2d')!.drawImage(captureCanvas, 0, 0, pw, ph, 0, 0, tw, th)
    try {
      const result = await applyDistortPipeline(
        transformSource,
        opts.transform.enabled,
        opts.transform.strengths,
        opts.transform.params,
        opts.transform.pixelShiftType,
      )
      ctx.drawImage(result, 0, 0, pw, ph)
    } catch { /* keep color-adjusted frame */ }
  }

  if (opts.detectEnabled) {
    const ignoredBoxes = opts.ignoredFaceBoxes ?? []
    for (const zone of captureZones) {
      // Skip faces the user opted out of in the live feed (matched by overlap).
      const zoneBox: NormBox = { x: zone.x, y: zone.y, width: zone.width, height: zone.height }
      const opted = ignoredBoxes.some((b) => boxIoU(zoneBox, b) > 0.3 || boxCenterDist(zoneBox, b) < 0.1)
      if (opted) continue
      // Match the live preview's static face-offset coverage so the captured
      // still anonymizes the same expanded region the user saw on screen.
      const capturePad = Math.max(SAFETY_PAD_MIN, opts.faceOffset ?? ZONE_PAD)
      applyFeatheredEffect(ctx, withFixedOverlay(opts, zone), pw, ph, opts.brushStrength, liveEffectOptions(opts, zone), capturePad)
    }
  }

  return captureCanvas
}

export async function captureLivePhotoBlob(
  video: HTMLVideoElement,
  getOpts: () => LiveCameraOpts,
): Promise<Blob | null> {
  const frame = await renderLiveCaptureFrame(video, getOpts)
  if (!frame) return null
  return new Promise((resolve) => {
    frame.toBlob((blob) => resolve(blob), 'image/jpeg', CAPTURE_JPEG_QUALITY)
  })
}

export { CAPTURE_JPEG_QUALITY as LIVE_CAPTURE_JPEG_QUALITY }
