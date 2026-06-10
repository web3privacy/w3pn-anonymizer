/**
 * Face detection orchestrator — YuNet via ONNX Runtime Web (local WASM only).
 *
 * Model: face_detection_yunet_2023mar.onnx
 */

import type { DetectorStatus, FaceBox } from '../types'
import { initYuNet, isYuNetReady, detectYuNet, disposeYuNet, setYuNetLoadProgressCallback, type DetectorLoadProgress } from './yunet-wasm'

export type { DetectorLoadProgress }

// Capture detector download progress at module level so the UI can render an
// accurate "X / Y MB" while initialization is in flight.
let latestLoadProgress: DetectorLoadProgress | null = null
let appLoadProgressCb: ((p: DetectorLoadProgress) => void) | null = null
setYuNetLoadProgressCallback((p) => {
  latestLoadProgress = p
  appLoadProgressCb?.(p)
})

/** Subscribe to model/WASM byte-download progress during detector init. */
export const setDetectorLoadProgressCallback = (cb: ((p: DetectorLoadProgress) => void) | null): void => {
  appLoadProgressCb = cb
}

export const getDetectorLoadProgress = (): DetectorLoadProgress | null => latestLoadProgress

export type DetectorMode = 'yunet-wasm' | 'unavailable'

export interface ExtendedDetectorStatus extends DetectorStatus {
  mode: DetectorMode
}

const YUNET_TILE_SIZE = 640
const YUNET_TILE_OVERLAP = 0.25
const YUNET_MIN_TILE_DIM = 800

let statusCache: ExtendedDetectorStatus | null = null
let initPromise: Promise<ExtendedDetectorStatus> | null = null

let onProgress: ((step: string) => void) | null = null

export const setDetectionProgressCallback = (cb: ((step: string) => void) | null): void => {
  onProgress = cb
}

const reportProgress = (step: string): void => {
  onProgress?.(step)
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

export const initializeDetector = async (): Promise<ExtendedDetectorStatus> => {
  if (statusCache) return statusCache
  if (initPromise) return initPromise

  initPromise = (async (): Promise<ExtendedDetectorStatus> => {
    reportProgress('Loading YuNet (WASM)…')
    const yunetOk = await initYuNet()

    if (yunetOk) {
      statusCache = {
        mode: 'yunet-wasm',
        message: 'YuNet face detector (local WASM)',
      }
      initPromise = null
      return statusCache
    }

    statusCache = {
      mode: 'unavailable',
      message: 'YuNet unavailable — check the local ONNX model and WASM runtime.',
    }
    initPromise = null
    return statusCache
  })()

  return initPromise
}

/** Start detector/model download as early as possible (safe to call multiple times). */
export function preloadDetector(): void {
  void initializeDetector()
}

export const getDetectorStatus = (): ExtendedDetectorStatus | null => statusCache

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

async function detectViaLocalYuNet(canvas: HTMLCanvasElement, robust: boolean, confidence?: number): Promise<FaceBox[]> {
  if (!isYuNetReady()) return []

  const w = canvas.width
  const h = canvas.height
  reportProgress(`Running YuNet on ${w}×${h} image…`)

  // A caller-supplied confidence overrides the defaults so the detection
  // settings drawer can trade sensitivity (more faces) for precision.
  const fullThreshold = confidence ?? (robust ? 0.40 : 0.50)
  const tileThreshold = confidence !== undefined
    ? Math.max(0.2, confidence - 0.05)
    : (robust ? 0.40 : 0.45)

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

/**
 * Run YuNet face detection on a canvas/image/video frame.
 * ONNX inference cannot be aborted mid-run; callers should use a generation
 * token (see App.tsx detectGenerationRef) to discard stale results after await.
 */
export const detectFaces = async (
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  robust = false,
  confidence?: number,
): Promise<FaceBox[]> => {
  reportProgress('Initializing…')
  await initializeDetector()
  const canvas = toCanvas(source)

  if (isYuNetReady()) {
    return await detectViaLocalYuNet(canvas, robust, confidence)
  }

  return []
}
