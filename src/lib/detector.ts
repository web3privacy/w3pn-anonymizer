/**
 * Face detection orchestrator.
 *
 * YuNet (OpenCV Zoo `face_detection_yunet_2023mar.onnx`) is the primary model everywhere.
 *
 * Init order (always): load browser YuNet (ONNX+WASM) first so local detection and server
 * fallbacks can use the same model. Then:
 *   1. Python backend /api/detect (OpenCV FaceDetectorYN, same weights) when hybrid + server up
 *   2. Same YuNet in-browser if local-only or server down
 *   3. MediaPipe / native / face-api only if YuNet is unavailable
 */

import type { DetectorStatus, FaceBox } from '../types'
import { initYuNet, isYuNetReady, detectYuNet, disposeYuNet } from './yunet-wasm'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DetectorMode = 'backend' | 'yunet-wasm' | 'mediapipe' | 'native' | 'face-api' | 'unavailable'

export interface ExtendedDetectorStatus extends DetectorStatus {
  mode: DetectorMode
  backendAvailable: boolean
  backendDetector: string
}

export interface DepEntry { pkg: string; label: string; ok: boolean; version: string | null }
export interface DepsStatus {
  all_ok: boolean; deps: DepEntry[]; yunet_model_present: boolean
  yunet_model_path: string; python: string; python_executable: string
}
export interface InstallResult {
  ok: boolean; returncode: number; stdout: string; stderr: string; message: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BACKEND_URL = '/api'
/** Cold-start Python + proxy can exceed 3s; missing backend wrongly falls back to WASM. */
const BACKEND_TIMEOUT_MS = 8_000
const DETECT_TIMEOUT_MS = 30_000

// ── Module state ──────────────────────────────────────────────────────────────

let statusCache: ExtendedDetectorStatus | null = null
let initPromise: Promise<ExtendedDetectorStatus> | null = null
let _forceLocal = false

let _onProgress: ((step: string) => void) | null = null
export const setDetectionProgressCallback = (cb: ((step: string) => void) | null): void => { _onProgress = cb }
const reportProgress = (step: string): void => { _onProgress?.(step) }

export const setForceLocal = (val: boolean): void => {
  _forceLocal = val
  statusCache = null
  initPromise = null
}
export const getForceLocal = (): boolean => _forceLocal

// ── MediaPipe ─────────────────────────────────────────────────────────────────

let mpDetector: import('@mediapipe/tasks-vision').FaceDetector | null = null
let mpReady = false
let mpInitializing = false

async function ensureMediaPipe(): Promise<boolean> {
  if (mpReady && mpDetector) return true
  if (mpInitializing) {
    while (mpInitializing && !mpReady) {
      await new Promise<void>((r) => setTimeout(r, 100))
    }
    return mpReady
  }
  mpInitializing = true

  const base = new URL('.', window.location.href).href
  // Use full-range model (works up to ~5m, better for group/crowd photos)
  const modelPath = `${base}mediapipe/face_detection_full_range.tflite`

  const delegates = ['GPU', 'CPU'] as const
  for (const delegate of delegates) {
    try {
      reportProgress(`Loading MediaPipe (${delegate})…`)
      const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision')

      console.log(`[detector] MediaPipe: loading WASM from ${base}mediapipe/wasm`)
      const vision = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`)

      console.log(`[detector] MediaPipe: loading full-range model from ${modelPath}`)
      mpDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelPath, delegate },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.35,
      })

      mpReady = true
      console.log(`[detector] MediaPipe ready (${delegate}, full-range model)`)
      reportProgress(`MediaPipe ready (${delegate})`)
      return true
    } catch (err) {
      console.warn(`[detector] MediaPipe ${delegate} init failed:`, err)
    }
  }

  console.warn('[detector] All MediaPipe delegates failed')
  mpInitializing = false
  return false
}

/**
 * Run MediaPipe detection on a single canvas region and return face boxes
 * with coordinates mapped back to the original image.
 */
function detectOnCanvas(canvas: HTMLCanvasElement, offsetX = 0, offsetY = 0): FaceBox[] {
  if (!mpDetector) return []
  const result = mpDetector.detect(canvas)
  return result.detections
    .filter((det) => det.boundingBox)
    .map((det) => {
      const bb = det.boundingBox!
      return {
        x: bb.originX + offsetX,
        y: bb.originY + offsetY,
        width: bb.width,
        height: bb.height,
        score: det.categories?.[0]?.score,
      }
    })
}

/**
 * Deduplicate overlapping face boxes using Non-Maximum Suppression (NMS).
 * Keeps the box with the higher score when IoU exceeds threshold.
 */
function nms(boxes: FaceBox[], iouThreshold = 0.4): FaceBox[] {
  if (boxes.length <= 1) return boxes
  const sorted = [...boxes].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const kept: FaceBox[] = []
  const suppressed = new Set<number>()

  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue
      if (iou(sorted[i], sorted[j]) > iouThreshold) suppressed.add(j)
    }
  }
  return kept
}

function iou(a: FaceBox, b: FaceBox): number {
  const x1 = Math.max(a.x, b.x)
  const y1 = Math.max(a.y, b.y)
  const x2 = Math.min(a.x + a.width, b.x + b.width)
  const y2 = Math.min(a.y + a.height, b.y + b.height)
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  if (inter === 0) return 0
  const areaA = a.width * a.height
  const areaB = b.width * b.height
  return inter / (areaA + areaB - inter)
}

/**
 * Multi-scale tiled face detection using MediaPipe.
 *
 * For images larger than TILE_SIZE, we run detection on:
 *   1. The full image (catches large/medium faces)
 *   2. Overlapping tiles at original resolution to catch small faces
 *
 * Results are merged and deduplicated with NMS.
 */
async function detectWithMediaPipe(source: HTMLCanvasElement): Promise<FaceBox[]> {
  if (!mpDetector) return []
  try {
    const w = source.width
    const h = source.height

    reportProgress(`Scanning ${w}×${h} image…`)

    // Pass 1: full-image detection (catches large/medium faces)
    const allBoxes: FaceBox[] = detectOnCanvas(source)
    console.log(`[detector] MediaPipe full-image: ${allBoxes.length} faces in ${w}×${h}`)

    // Pass 2: tiled detection for images with small faces
    const TILE_SIZE = 640
    const OVERLAP = 0.25
    const MIN_DIM_FOR_TILING = 800

    if (w > MIN_DIM_FOR_TILING || h > MIN_DIM_FOR_TILING) {
      const step = Math.round(TILE_SIZE * (1 - OVERLAP))
      const tileCanvas = document.createElement('canvas')
      const tileCtx = tileCanvas.getContext('2d')!

      // Count total tiles for progress
      const tiles: Array<[number, number]> = []
      for (let ty = 0; ty < h; ty += step) {
        for (let tx = 0; tx < w; tx += step) {
          const cropW = Math.min(TILE_SIZE, w - tx)
          const cropH = Math.min(TILE_SIZE, h - ty)
          if (cropW >= 80 && cropH >= 80) tiles.push([tx, ty])
        }
      }

      let tileFaces = 0
      for (let i = 0; i < tiles.length; i++) {
        const [tx, ty] = tiles[i]
        const cropW = Math.min(TILE_SIZE, w - tx)
        const cropH = Math.min(TILE_SIZE, h - ty)

        tileCanvas.width = cropW
        tileCanvas.height = cropH
        tileCtx.clearRect(0, 0, cropW, cropH)
        tileCtx.drawImage(source, tx, ty, cropW, cropH, 0, 0, cropW, cropH)

        const tileBoxes = detectOnCanvas(tileCanvas, tx, ty)
        tileFaces += tileBoxes.length
        allBoxes.push(...tileBoxes)

        // Yield to UI every 4 tiles so progress updates render
        if (i % 4 === 3) {
          reportProgress(`Scanning region ${i + 1}/${tiles.length} (${allBoxes.length} faces)…`)
          await new Promise<void>((r) => setTimeout(r, 0))
        }
      }
      console.log(`[detector] MediaPipe tiles: ${tiles.length} tiles, ${tileFaces} additional faces`)
    }

    // Deduplicate overlapping detections
    const deduped = nms(allBoxes, 0.35)
    console.log(`[detector] MediaPipe total: ${allBoxes.length} raw → ${deduped.length} after NMS`)
    return deduped
  } catch (err) {
    console.error('[detector] MediaPipe detect() threw:', err)
    return []
  }
}

// ── Native browser FaceDetector ───────────────────────────────────────────────

interface NativeDetectedFace { boundingBox: DOMRectReadOnly }
interface NativeFaceDetector {
  detect(input: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap): Promise<NativeDetectedFace[]>
}
interface NativeFaceDetectorCtor {
  new(config?: { fastMode?: boolean; maxDetectedFaces?: number }): NativeFaceDetector
}
declare global { interface Window { FaceDetector?: NativeFaceDetectorCtor } }

let nativeDetector: NativeFaceDetector | null = null

// ── face-api.js (legacy fallback) ─────────────────────────────────────────────

let faceApiReady = false
let faceApiInitializing = false
let faceApiBackendName = ''

async function ensureFaceApi(): Promise<boolean> {
  if (faceApiReady) return true
  if (faceApiInitializing) {
    while (faceApiInitializing && !faceApiReady) {
      await new Promise<void>((r) => setTimeout(r, 200))
    }
    return faceApiReady
  }
  faceApiInitializing = true
  try {
    reportProgress('Loading face-api.js (fallback)…')
    const tf = await import('@tensorflow/tfjs-core')
    await import('@tensorflow/tfjs-backend-webgl')
    const faceapi = await import('face-api.js')

    try {
      await tf.setBackend('webgl')
    } catch {
      await tf.setBackend('cpu')
    }
    await tf.ready()
    faceApiBackendName = tf.getBackend() === 'webgl' ? 'WebGL' : 'CPU'

    reportProgress('Loading model weights…')
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models')
    faceApiReady = true
    return true
  } catch (err) {
    console.warn('face-api.js init failed:', err)
    return false
  } finally {
    faceApiInitializing = false
  }
}

export const getFaceApiBackendName = (): string => {
  if (isYuNetReady()) return 'YuNet (WASM/ONNX)'
  if (mpReady) return 'MediaPipe (WASM)'
  return faceApiBackendName ? `face-api.js (${faceApiBackendName})` : ''
}

// ── Backend health check ──────────────────────────────────────────────────────

async function checkBackend(): Promise<{ ok: boolean; detector: string }> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), BACKEND_TIMEOUT_MS)
    const res = await fetch(`${BACKEND_URL}/status`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return { ok: false, detector: 'none' }
    const data = await res.json() as { ok: boolean; detector: string }
    return { ok: data.ok, detector: data.detector ?? 'unknown' }
  } catch {
    return { ok: false, detector: 'none' }
  }
}

// ── Initialization ────────────────────────────────────────────────────────────

export const initializeDetector = async (): Promise<ExtendedDetectorStatus> => {
  if (statusCache) {
    console.log('[detector] returning cached status:', statusCache.mode)
    return statusCache
  }
  if (initPromise) return initPromise

  console.log('[detector] initializeDetector: forceLocal=%s', _forceLocal)
  initPromise = (async (): Promise<ExtendedDetectorStatus> => {
    // 1. Always load YuNet in the browser first (primary model; same ONNX as Python server)
    reportProgress('Loading YuNet (WASM)…')
    const yunetOk = await initYuNet()
    if (yunetOk) {
      console.log('[detector] YuNet WASM ready (primary local pipeline)')
    } else {
      console.warn('[detector] YuNet WASM did not start — check /models/face_detection_yunet_2023mar.onnx and /onnx/*.wasm')
    }

    // 2. Hybrid: use Python OpenCV YuNet on /api when available (same model, server-side)
    if (!_forceLocal) {
      const info = await checkBackend()
      if (info.ok) {
        statusCache = {
          mode: 'backend', backendAvailable: true, backendDetector: info.detector,
          message: `Python backend — ${info.detector === 'yunet' ? 'OpenCV YuNet' : info.detector}`,
        }
        initPromise = null
        return statusCache
      }
    }

    // 3. Local-only or server down: use in-browser YuNet if it loaded
    if (yunetOk) {
      statusCache = {
        mode: 'yunet-wasm', backendAvailable: false, backendDetector: 'none',
        message: 'YuNet face detector (local WASM)',
      }
      initPromise = null
      return statusCache
    }

    // 4. MediaPipe BlazeFace (fast, WASM-based fallback)
    const mpOk = await ensureMediaPipe()
    if (mpOk) {
      statusCache = {
        mode: 'mediapipe', backendAvailable: false, backendDetector: 'none',
        message: 'MediaPipe BlazeFace (local WASM)',
      }
      initPromise = null
      return statusCache
    }

    // 5. Native browser FaceDetector
    if (window.FaceDetector) {
      try {
        nativeDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 64 })
        statusCache = {
          mode: 'native', backendAvailable: false, backendDetector: 'none',
          message: 'Native browser FaceDetector',
        }
        initPromise = null
        return statusCache
      } catch { /* fall through */ }
    }

    // 6. face-api.js
    statusCache = {
      mode: 'face-api', backendAvailable: false, backendDetector: 'none',
      message: 'face-api.js (fallback)',
    }
    initPromise = null
    return statusCache
  })()

  return initPromise
}

export const getDetectorStatus = (): ExtendedDetectorStatus | null => statusCache

export const checkDeps = async (): Promise<DepsStatus | null> => {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), BACKEND_TIMEOUT_MS)
    const res = await fetch(`${BACKEND_URL}/deps`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.json() as DepsStatus
  } catch { return null }
}

export const triggerInstall = async (): Promise<InstallResult | null> => {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 320_000)
  try {
    const res = await fetch(`${BACKEND_URL}/install`, { method: 'POST', signal: ctrl.signal })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { ok: false, returncode: res.status, stdout: '', stderr: text, message: `Server error: ${res.status}` }
    }
    return await res.json() as InstallResult
  } catch { return null } finally { clearTimeout(timer) }
}

export const resetDetectorStatus = (): void => {
  statusCache = null; initPromise = null; nativeDetector = null
  faceApiReady = false; faceApiInitializing = false
  mpReady = false; mpInitializing = false; mpDetector = null
  disposeYuNet()
}

// ── Detection ─────────────────────────────────────────────────────────────────

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob null')), 'image/jpeg', 0.92)
  })
}

async function detectViaBackend(canvas: HTMLCanvasElement, robust: boolean): Promise<FaceBox[]> {
  const blob = await canvasToBlob(canvas)
  const form = new FormData()
  form.append('image', blob, 'photo.jpg')
  form.append('robust', robust ? 'true' : 'false')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), DETECT_TIMEOUT_MS)
  let res: Response
  try { res = await fetch(`${BACKEND_URL}/detect`, { method: 'POST', body: form, signal: ctrl.signal }) }
  finally { clearTimeout(timer) }
  if (!res.ok) throw new Error(`Backend ${res.status}`)
  const data = await res.json() as { faces?: Array<{ x: number; y: number; width: number; height: number; score: number }> }
  return (data.faces ?? []).map((f) => ({ x: f.x, y: f.y, width: f.width, height: f.height, score: f.score }))
}

/**
 * Detect faces. Returns FaceBox[] in image-pixel coordinates.
 */
export const detectFaces = async (
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  robust = false,
): Promise<FaceBox[]> => {
  reportProgress('Initializing…')
  const status = await initializeDetector()

  // 1. Backend (server mode)
  if (status.mode === 'backend' && !_forceLocal) {
    let canvas: HTMLCanvasElement
    if (source instanceof HTMLCanvasElement) { canvas = source }
    else {
      canvas = document.createElement('canvas')
      canvas.width = source.width || (source as HTMLImageElement).naturalWidth
      canvas.height = source.height || (source as HTMLImageElement).naturalHeight
      canvas.getContext('2d')!.drawImage(source, 0, 0)
    }
    try {
      reportProgress('Sending to server…')
      return await detectViaBackend(canvas, robust)
    } catch (err) {
      console.warn('Backend failed:', err)
      reportProgress('Server failed — using local detection…')
    }
  }

  // 2. YuNet WASM (same model as Python backend, highest local accuracy)
  if (isYuNetReady()) {
    try {
      const w = (source as HTMLCanvasElement).width || (source as HTMLImageElement).naturalWidth || 0
      const h = (source as HTMLCanvasElement).height || (source as HTMLImageElement).naturalHeight || 0
      reportProgress(`Running YuNet on ${w}×${h} image…`)

      let canvas: HTMLCanvasElement
      if (source instanceof HTMLCanvasElement) {
        canvas = source
      } else {
        canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(source, 0, 0)
      }

      const fullThreshold = robust ? 0.40 : 0.50
      const tileThreshold = robust ? 0.40 : 0.45

      // Multi-scale: run on full image + tiles for large images.
      // Match the backend thresholds so "Local" and "Server" stay comparable.
      const fullBoxes = await detectYuNet(canvas, fullThreshold)
      console.log('[detector] YuNet full-image: %d faces in %dx%d', fullBoxes.length, w, h)

      const TILE = 640
      const MIN_FOR_TILING = 800
      if (w > MIN_FOR_TILING || h > MIN_FOR_TILING || robust) {
        const step = Math.round(TILE * 0.75)
        const tiles: Array<[number, number]> = []
        for (let ty = 0; ty < h; ty += step) {
          for (let tx = 0; tx < w; tx += step) {
            if (Math.min(TILE, w - tx) >= 80 && Math.min(TILE, h - ty) >= 80) tiles.push([tx, ty])
          }
        }

        const tileCanvas = document.createElement('canvas')
        const tileCtx = tileCanvas.getContext('2d')!
        let tileFaces = 0

        for (let i = 0; i < tiles.length; i++) {
          const [tx, ty] = tiles[i]
          const cw = Math.min(TILE, w - tx)
          const ch = Math.min(TILE, h - ty)
          tileCanvas.width = cw; tileCanvas.height = ch
          tileCtx.clearRect(0, 0, cw, ch)
          tileCtx.drawImage(canvas, tx, ty, cw, ch, 0, 0, cw, ch)

          try {
            const tileBoxes = await detectYuNet(tileCanvas, tileThreshold)
            for (const b of tileBoxes) {
              fullBoxes.push({ x: b.x + tx, y: b.y + ty, width: b.width, height: b.height, score: b.score })
            }
            tileFaces += tileBoxes.length
          } catch (err) {
            console.warn('[detector] YuNet tile detection error at (%d,%d):', tx, ty, err)
          }

          if (i % 3 === 2) {
            reportProgress(`Scanning region ${i + 1}/${tiles.length} (${fullBoxes.length} faces)…`)
            await new Promise<void>((r) => setTimeout(r, 0))
          }
        }
        console.log('[detector] YuNet tiles: %d tiles, %d tile faces', tiles.length, tileFaces)
      }

      const deduped = nms(fullBoxes, 0.35)
      console.log('[detector] YuNet total: %d raw → %d after NMS', fullBoxes.length, deduped.length)
      return deduped
    } catch (err) {
      console.warn('[detector] YuNet WASM detection error:', err)
    }
  }

  // 3. MediaPipe (fast WASM fallback, full-range model + multi-scale tiling)
  console.log('[detector] detectFaces: trying MediaPipe (mpReady=%s)', mpReady)
  if (mpReady || await ensureMediaPipe()) {
    try {
      const w = (source as HTMLCanvasElement).width || (source as HTMLImageElement).naturalWidth || 0
      const h = (source as HTMLCanvasElement).height || (source as HTMLImageElement).naturalHeight || 0
      reportProgress(`Detecting faces in ${w}×${h} image (MediaPipe)…`)

      let canvas: HTMLCanvasElement
      if (source instanceof HTMLCanvasElement) {
        canvas = source
      } else {
        canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(source, 0, 0)
      }

      const boxes = await detectWithMediaPipe(canvas)
      console.log('[detector] MediaPipe result: %d faces', boxes.length)
      return boxes
    } catch (err) {
      console.warn('[detector] MediaPipe detection threw:', err)
    }
  } else {
    console.warn('[detector] MediaPipe not available, falling through')
  }

  // 5. Native browser FaceDetector
  if (nativeDetector) {
    try {
      console.log('[detector] trying native browser FaceDetector')
      reportProgress('Trying native browser detection…')
      const faces = await nativeDetector.detect(source)
      console.log('[detector] native found %d faces', faces.length)
      if (faces.length > 0) {
        return faces.map((f) => ({
          x: f.boundingBox.x, y: f.boundingBox.y,
          width: f.boundingBox.width, height: f.boundingBox.height,
        }))
      }
    } catch (err) { console.warn('[detector] native error:', err) }
  }

  // 6. face-api.js (legacy)
  try {
    console.log('[detector] trying face-api.js (legacy fallback)')
    const ok = await ensureFaceApi()
    if (ok) {
      const faceapi = await import('face-api.js')
      const w = (source as HTMLCanvasElement).width || (source as HTMLImageElement).naturalWidth || 0
      const h = (source as HTMLCanvasElement).height || (source as HTMLImageElement).naturalHeight || 0
      reportProgress(`Analyzing ${w}×${h} with face-api.js…`)
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 })
      const detections = await Promise.race([
        faceapi.detectAllFaces(source, opts),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 30_000)),
      ])
      console.log('[detector] face-api.js found %d faces', detections.length)
      return detections.map((d) => ({ x: d.box.x, y: d.box.y, width: d.box.width, height: d.box.height, score: d.score }))
    }
  } catch (err) { console.warn('[detector] face-api.js error:', err) }

  return []
}
