/**
 * Face detection orchestrator.
 *
 * YuNet (OpenCV Zoo `face_detection_yunet_2023mar.onnx`) is the only active
 * detector in both processing modes:
 *   1. `backend` uses the localhost Python/OpenCV runtime
 *   2. `yunet-wasm` uses the same ONNX weights directly in the browser
 */

import type { DetectorStatus, FaceBox } from '../types'
import { initYuNet, isYuNetReady, detectYuNet, disposeYuNet } from './yunet-wasm'

export type DetectorMode = 'backend' | 'yunet-wasm' | 'unavailable'

export interface ExtendedDetectorStatus extends DetectorStatus {
  mode: DetectorMode
  backendAvailable: boolean
  backendDetector: string
}

export interface DepEntry { pkg: string; label: string; ok: boolean; version: string | null }
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

const BACKEND_URL = '/api'
const BACKEND_TIMEOUT_MS = 8_000
const DETECT_TIMEOUT_MS = 30_000
const YUNET_TILE_SIZE = 640
const YUNET_TILE_OVERLAP = 0.25
const YUNET_MIN_TILE_DIM = 800

let statusCache: ExtendedDetectorStatus | null = null
let initPromise: Promise<ExtendedDetectorStatus> | null = null
let forceLocal = false

let onProgress: ((step: string) => void) | null = null

export const setDetectionProgressCallback = (cb: ((step: string) => void) | null): void => {
  onProgress = cb
}

const reportProgress = (step: string): void => {
  onProgress?.(step)
}

export const setForceLocal = (value: boolean): void => {
  forceLocal = value
  statusCache = null
  initPromise = null
}

export const getForceLocal = (): boolean => forceLocal

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

function nms(boxes: FaceBox[], iouThreshold = 0.35): FaceBox[] {
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

export const initializeDetector = async (): Promise<ExtendedDetectorStatus> => {
  if (statusCache) return statusCache
  if (initPromise) return initPromise

  initPromise = (async (): Promise<ExtendedDetectorStatus> => {
    reportProgress('Loading YuNet (WASM)…')
    const yunetOk = await initYuNet()

    if (!forceLocal) {
      const info = await checkBackend()
      if (info.ok) {
        statusCache = {
          mode: 'backend',
          backendAvailable: true,
          backendDetector: info.detector,
          message: `Python backend — ${info.detector === 'yunet' ? 'OpenCV YuNet' : info.detector}`,
        }
        initPromise = null
        return statusCache
      }
    }

    if (yunetOk) {
      statusCache = {
        mode: 'yunet-wasm',
        backendAvailable: false,
        backendDetector: 'none',
        message: 'YuNet face detector (local WASM)',
      }
      initPromise = null
      return statusCache
    }

    statusCache = {
      mode: 'unavailable',
      backendAvailable: false,
      backendDetector: 'none',
      message: 'YuNet unavailable — check the local ONNX model and WASM runtime.',
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
  } catch {
    return null
  }
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
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const resetDetectorStatus = (): void => {
  statusCache = null
  initPromise = null
  disposeYuNet()
}

function toCanvas(source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): HTMLCanvasElement {
  if (source instanceof HTMLCanvasElement) return source

  const width = source.width || (source as HTMLImageElement).naturalWidth
  const height = source.height || (source as HTMLImageElement).naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(source, 0, 0)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('toBlob returned null')), 'image/jpeg', 0.92)
  })
}

async function detectViaBackend(canvas: HTMLCanvasElement, robust: boolean): Promise<FaceBox[]> {
  const blob = await canvasToBlob(canvas)
  const form = new FormData()
  form.append('image', blob, 'photo.jpg')
  form.append('robust', robust ? 'true' : 'false')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), DETECT_TIMEOUT_MS)
  try {
    const res = await fetch(`${BACKEND_URL}/detect`, {
      method: 'POST',
      body: form,
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`Backend ${res.status}`)
    const data = await res.json() as {
      faces?: Array<{ x: number; y: number; width: number; height: number; score: number }>
    }
    return (data.faces ?? []).map((face) => ({
      x: face.x,
      y: face.y,
      width: face.width,
      height: face.height,
      score: face.score,
    }))
  } finally {
    clearTimeout(timer)
  }
}

async function detectViaLocalYuNet(canvas: HTMLCanvasElement, robust: boolean): Promise<FaceBox[]> {
  if (!isYuNetReady()) return []

  const w = canvas.width
  const h = canvas.height
  reportProgress(`Running YuNet on ${w}×${h} image…`)

  const fullThreshold = robust ? 0.40 : 0.50
  const tileThreshold = robust ? 0.40 : 0.45

  const allBoxes = await detectYuNet(canvas, fullThreshold)
  if (w > YUNET_MIN_TILE_DIM || h > YUNET_MIN_TILE_DIM || robust) {
    const step = Math.max(1, Math.round(YUNET_TILE_SIZE * (1 - YUNET_TILE_OVERLAP)))
    const tiles: Array<[number, number]> = []
    for (let ty = 0; ty < h; ty += step) {
      for (let tx = 0; tx < w; tx += step) {
        if (Math.min(YUNET_TILE_SIZE, w - tx) >= 80 && Math.min(YUNET_TILE_SIZE, h - ty) >= 80) {
          tiles.push([tx, ty])
        }
      }
    }

    const tileCanvas = document.createElement('canvas')
    const tileCtx = tileCanvas.getContext('2d')!
    for (let i = 0; i < tiles.length; i++) {
      const [tx, ty] = tiles[i]
      const cropW = Math.min(YUNET_TILE_SIZE, w - tx)
      const cropH = Math.min(YUNET_TILE_SIZE, h - ty)
      tileCanvas.width = cropW
      tileCanvas.height = cropH
      tileCtx.clearRect(0, 0, cropW, cropH)
      tileCtx.drawImage(canvas, tx, ty, cropW, cropH, 0, 0, cropW, cropH)

      const tileBoxes = await detectYuNet(tileCanvas, tileThreshold)
      for (const box of tileBoxes) {
        allBoxes.push({
          x: box.x + tx,
          y: box.y + ty,
          width: box.width,
          height: box.height,
          score: box.score,
        })
      }

      if (i % 3 === 2) {
        reportProgress(`Scanning region ${i + 1}/${tiles.length} (${allBoxes.length} faces)…`)
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
      }
    }
  }

  return nms(allBoxes, 0.35)
}

export const detectFaces = async (
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  robust = false,
): Promise<FaceBox[]> => {
  reportProgress('Initializing…')
  const status = await initializeDetector()
  const canvas = toCanvas(source)

  if (status.mode === 'backend' && !forceLocal) {
    try {
      reportProgress('Sending to server…')
      const backendBoxes = await detectViaBackend(canvas, robust)
      if (backendBoxes.length > 0 || robust) return backendBoxes
    } catch (err) {
      console.warn('[detector] Backend detection failed:', err)
      reportProgress('Server unavailable — switching to local YuNet…')
    }
  }

  if (isYuNetReady()) {
    return await detectViaLocalYuNet(canvas, robust)
  }

  return []
}
