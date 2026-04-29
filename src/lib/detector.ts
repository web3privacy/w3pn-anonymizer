/**
 * Face detection orchestrator.
 *
 * Priority:
 *   1. Python/OpenCV YuNet backend  (/api/detect)   ← best accuracy
 *   2. Native browser FaceDetector API              ← fast, Chrome only
 *   3. face-api.js TinyFaceDetector                 ← JS fallback, always works
 */

import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as faceapi from 'face-api.js'
import type { DetectorStatus, FaceBox } from '../types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NativeDetectedFace {
  boundingBox: DOMRectReadOnly
}
interface NativeFaceDetector {
  detect(
    input: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap,
  ): Promise<NativeDetectedFace[]>
}
interface NativeFaceDetectorCtor {
  new(config?: { fastMode?: boolean; maxDetectedFaces?: number }): NativeFaceDetector
}
declare global {
  interface Window { FaceDetector?: NativeFaceDetectorCtor }
}

export type DetectorMode = 'backend' | 'native' | 'face-api' | 'unavailable'

export interface ExtendedDetectorStatus extends DetectorStatus {
  mode: DetectorMode
  backendAvailable: boolean
  backendDetector: string  // 'yunet' | 'haar' | 'none'
}

export interface DepEntry {
  pkg: string
  label: string
  ok: boolean
  version: string | null
}

export interface DepsStatus {
  all_ok: boolean
  deps: DepEntry[]
  yunet_model_present: boolean
  yunet_model_path: string
  python: string
  python_executable: string
}

export interface InstallResult {
  ok: boolean
  returncode: number
  stdout: string
  stderr: string
  message: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BACKEND_URL = '/api'
const BACKEND_TIMEOUT_MS = 3_000   // status check
const DETECT_TIMEOUT_MS = 30_000   // image detection (large photos can be slow)

// ── Module state ──────────────────────────────────────────────────────────────

let statusCache: ExtendedDetectorStatus | null = null
let initPromise: Promise<ExtendedDetectorStatus> | null = null
let nativeDetector: NativeFaceDetector | null = null
const tinyDetectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 512,
  scoreThreshold: 0.40,
})

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

// ── face-api.js init ──────────────────────────────────────────────────────────

let faceApiReady = false
async function ensureFaceApi(): Promise<void> {
  if (faceApiReady) return
  await tf.setBackend('webgl').catch(async () => { await tf.setBackend('cpu') })
  await tf.ready()
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  faceApiReady = true
}

// ── Initialization ────────────────────────────────────────────────────────────

export const initializeDetector = async (): Promise<ExtendedDetectorStatus> => {
  if (statusCache) return statusCache
  if (initPromise) return initPromise

  initPromise = (async (): Promise<ExtendedDetectorStatus> => {
    // 1. Try Python backend
    const backendInfo = await checkBackend()
    if (backendInfo.ok) {
      statusCache = {
        mode: 'backend',
        backendAvailable: true,
        backendDetector: backendInfo.detector,
        message: `Python backend ready — ${backendInfo.detector === 'yunet'
          ? 'OpenCV YuNet (high accuracy)'
          : backendInfo.detector === 'haar'
            ? 'Haar Cascades (fallback)'
            : backendInfo.detector}`,
      }
      initPromise = null
      return statusCache
    }

    // 2. Native browser FaceDetector
    if (window.FaceDetector) {
      try {
        nativeDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 64 })
        statusCache = {
          mode: 'native',
          backendAvailable: false,
          backendDetector: 'none',
          message: 'Native browser FaceDetector (limited accuracy)',
        }
        initPromise = null
        return statusCache
      } catch { /* fall through */ }
    }

    // 3. face-api.js
    try {
      await ensureFaceApi()
      statusCache = {
        mode: 'face-api',
        backendAvailable: false,
        backendDetector: 'none',
        message: 'face-api.js TinyFaceDetector (JS fallback)',
      }
      initPromise = null
      return statusCache
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      statusCache = {
        mode: 'unavailable',
        backendAvailable: false,
        backendDetector: 'none',
        message: `No detector available: ${msg}`,
      }
      initPromise = null
      return statusCache
    }
  })()

  return initPromise
}

export const getDetectorStatus = (): ExtendedDetectorStatus | null => statusCache

/**
 * Query the backend for dependency health. Returns null if the backend is unreachable.
 * Only meaningful when the Python server IS running (or partially running).
 */
export const checkDeps = async (): Promise<DepsStatus | null> => {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), BACKEND_TIMEOUT_MS)
    const res = await fetch(`${BACKEND_URL}/deps`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.json() as DepsStatus
  } catch {
    return null
  }
}

/**
 * Ask the backend to run `pip install -r requirements.txt`.
 * Only works when the Python server IS reachable.
 */
export const triggerInstall = async (): Promise<InstallResult | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/install`, {
      method: 'POST',
      signal: AbortSignal.timeout(320_000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { ok: false, returncode: res.status, stdout: '', stderr: text, message: `Server error: ${res.status}` }
    }
    return await res.json() as InstallResult
  } catch (err) {
    return null
  }
}

/** Force re-check (e.g. backend was started after app load) */
export const resetDetectorStatus = (): void => {
  statusCache = null
  initPromise = null
  nativeDetector = null
  faceApiReady = false
}

// ── Detection ─────────────────────────────────────────────────────────────────

/**
 * Convert HTMLCanvasElement to Blob (JPEG) for backend upload.
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('Canvas toBlob returned null'))
    }, 'image/jpeg', 0.92)
  })
}

/**
 * Detect via Python backend. Uploads the canvas image as JPEG.
 */
async function detectViaBackend(
  canvas: HTMLCanvasElement,
  robust: boolean,
): Promise<FaceBox[]> {
  const blob = await canvasToBlob(canvas)
  const form = new FormData()
  form.append('image', blob, 'photo.jpg')
  form.append('robust', robust ? 'true' : 'false')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), DETECT_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(`${BACKEND_URL}/detect`, { method: 'POST', body: form, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Backend returned ${res.status}: ${text}`)
  }

  const data = await res.json() as {
    faces?: Array<{ x: number; y: number; width: number; height: number; score: number; source: string }>
    detector: string
    image_width: number
    image_height: number
    elapsed_ms: number
  }

  if (!Array.isArray(data.faces)) return []

  return data.faces.map((f) => ({
    x: f.x,
    y: f.y,
    width: f.width,
    height: f.height,
    score: f.score,
  }))
}

/**
 * Detect faces. Returns array of FaceBox in image-pixel coordinates.
 *
 * @param source  Canvas containing the full image (original resolution)
 * @param robust  Use more thorough / slower detection pass
 */
export const detectFaces = async (
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  robust = false,
): Promise<FaceBox[]> => {
  const status = await initializeDetector()

  // Backend path
  if (status.mode === 'backend') {
    // Ensure we have a canvas (backend needs an uploadable image)
    let canvas: HTMLCanvasElement
    if (source instanceof HTMLCanvasElement) {
      canvas = source
    } else {
      canvas = document.createElement('canvas')
      canvas.width = source.width || (source as HTMLImageElement).naturalWidth
      canvas.height = source.height || (source as HTMLImageElement).naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(source, 0, 0)
    }

    try {
      return await detectViaBackend(canvas, robust)
    } catch (err) {
      // Backend call failed — fall through to browser methods
      console.warn('Backend detection failed, falling back to browser:', err)
    }
  }

  // Native browser FaceDetector
  if (status.mode === 'native' && nativeDetector) {
    try {
      const faces = await nativeDetector.detect(source)
      return faces.map((f) => ({
        x: f.boundingBox.x,
        y: f.boundingBox.y,
        width: f.boundingBox.width,
        height: f.boundingBox.height,
      }))
    } catch (err) {
      console.warn('Native detector failed, falling back to face-api.js:', err)
    }
  }

  // face-api.js
  if (status.mode === 'face-api' || status.mode === 'native') {
    try {
      await ensureFaceApi()
      const detections = await faceapi.detectAllFaces(source, tinyDetectorOptions)
      return detections.map((det) => ({
        x: det.box.x,
        y: det.box.y,
        width: det.box.width,
        height: det.box.height,
        score: det.score,
      }))
    } catch (err) {
      console.warn('face-api.js detection failed:', err)
    }
  }

  return []
}
