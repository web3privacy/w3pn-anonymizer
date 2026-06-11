import type { BoundingBox, FaceBox, PrivacyDetection } from '../../types'

export function iouBox(a: BoundingBox, b: BoundingBox): number {
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

export function iouPixelBox(a: FaceBox, b: FaceBox): number {
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

export function nmsPixelBoxes(boxes: FaceBox[], iouThreshold = 0.35): FaceBox[] {
  if (boxes.length <= 1) return boxes
  const sorted = [...boxes].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const kept: FaceBox[] = []
  const suppressed = new Set<number>()
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue
      if (iouPixelBox(sorted[i], sorted[j]) > iouThreshold) suppressed.add(j)
    }
  }
  return kept
}

export function nmsPrivacyDetections(detections: PrivacyDetection[], iouThreshold = 0.4): PrivacyDetection[] {
  if (detections.length <= 1) return detections
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence)
  const kept: PrivacyDetection[] = []
  const suppressed = new Set<number>()
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue
      if (sorted[i].type === sorted[j].type && iouBox(sorted[i].bbox, sorted[j].bbox) > iouThreshold) {
        suppressed.add(j)
      }
    }
  }
  return kept
}

/**
 * Priority used by cross-type dedup. Featured privacy targets outrank the
 * generic raw-class `object` so an overlapping region keeps the more meaningful
 * label (and therefore a single, well-defined effect).
 */
const DETECTION_TYPE_PRIORITY: Record<string, number> = {
  face: 100,
  pii_text: 95,
  license_plate: 90,
  person: 80,
  document: 70,
  screen: 60,
  sign: 50,
  tattoo: 40,
  object: 10,
  manual_zone: 5,
}

/** Fraction of `inner` that lies inside `outer` (0–1). */
function containmentRatio(inner: BoundingBox, outer: BoundingBox): number {
  const x1 = Math.max(inner.x, outer.x)
  const y1 = Math.max(inner.y, outer.y)
  const x2 = Math.min(inner.x + inner.width, outer.x + outer.width)
  const y2 = Math.min(inner.y + inner.height, outer.y + outer.height)
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const areaInner = inner.width * inner.height
  if (areaInner <= 0) return 0
  return inter / areaInner
}

/**
 * Collapse heavily overlapping detections that come from DIFFERENT models/types
 * (e.g. a license_plate from the plate model and a generic `object` from COCO
 * over the same pixels). Without this, each survivor becomes its own zone and
 * gets its own anonymization effect — so the same area would be redacted twice
 * with two different effects. Keeping the highest-priority detection guarantees
 * exactly one effect per region. Same-type overlaps are left to
 * {@link nmsPrivacyDetections}.
 *
 * Two suppression rules (the kept box always has the higher priority/confidence
 * because the list is sorted):
 *  1. Classic IoU overlap (similarly sized boxes over the same region).
 *  2. Containment — a generic `object` box that mostly sits inside a featured
 *     detection (face/plate/person/…) is redundant; dropping it prevents a
 *     second effect from stacking on the featured target's pixels even when the
 *     IoU is low (a small plate inside a big COCO `object`, etc.).
 */
export function dedupeOverlappingDetections(
  detections: PrivacyDetection[],
  iouThreshold = 0.55,
  containmentThreshold = 0.7,
): PrivacyDetection[] {
  if (detections.length <= 1) return detections
  const rank = (d: PrivacyDetection) =>
    (DETECTION_TYPE_PRIORITY[d.type] ?? 0) * 1000 + d.confidence
  const sorted = [...detections].sort((a, b) => rank(b) - rank(a))
  const kept: PrivacyDetection[] = []
  const suppressed = new Set<number>()
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue
      const a = sorted[i]
      const b = sorted[j]
      if (iouBox(a.bbox, b.bbox) > iouThreshold) { suppressed.add(j); continue }
      // Drop a redundant generic object box that is mostly covered by the
      // higher-priority featured detection (keeps a single effect over it).
      if (
        b.type === 'object' &&
        a.type !== 'object' &&
        containmentRatio(b.bbox, a.bbox) > containmentThreshold
      ) {
        suppressed.add(j)
      }
    }
  }
  return kept
}

export type LetterboxResult = {
  scale: number
  padX: number
  padY: number
  inputW: number
  inputH: number
}

/** Letterbox resize for YOLO-style square inputs. */
export function computeLetterbox(srcW: number, srcH: number, targetSize: number): LetterboxResult {
  const scale = Math.min(targetSize / srcW, targetSize / srcH)
  const inputW = Math.round(srcW * scale)
  const inputH = Math.round(srcH * scale)
  const padX = (targetSize - inputW) / 2
  const padY = (targetSize - inputH) / 2
  return { scale, padX, padY, inputW, inputH }
}

export function letterboxCanvas(
  source: HTMLCanvasElement,
  targetSize: number,
): { canvas: HTMLCanvasElement; meta: LetterboxResult } {
  const meta = computeLetterbox(source.width, source.height, targetSize)
  const canvas = document.createElement('canvas')
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#114'
  ctx.fillRect(0, 0, targetSize, targetSize)
  ctx.drawImage(source, meta.padX, meta.padY, meta.inputW, meta.inputH)
  return { canvas, meta }
}

/** Scale normalized detection box from letterboxed model space back to source image (0–1). */
export function scaleBoxFromLetterbox(
  box: BoundingBox,
  meta: LetterboxResult,
  targetSize: number,
  _srcW: number,
  _srcH: number,
): BoundingBox {
  const x = (box.x * targetSize - meta.padX) / meta.inputW
  const y = (box.y * targetSize - meta.padY) / meta.inputH
  const w = (box.width * targetSize) / meta.inputW
  const h = (box.height * targetSize) / meta.inputH
  return {
    x: clamp01(x),
    y: clamp01(y),
    width: clamp01(w),
    height: clamp01(h),
  }
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

export function canvasToDetectorInput(source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): {
  canvas: HTMLCanvasElement
  width: number
  height: number
} {
  if (source instanceof HTMLCanvasElement) {
    return { canvas: source, width: source.width, height: source.height }
  }
  const width = source.width || (source as HTMLImageElement).naturalWidth
  const height = source.height || (source as HTMLImageElement).naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(source, 0, 0)
  return { canvas, width, height }
}

/** Build NCHW float32 tensor RGB 0–1 from canvas (for YOLO). */
export function canvasToNchwRgb01(canvas: HTMLCanvasElement, size: number): Float32Array {
  const tmp = document.createElement('canvas')
  tmp.width = size
  tmp.height = size
  const ctx = tmp.getContext('2d')!
  ctx.drawImage(canvas, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  const out = new Float32Array(3 * size * size)
  const plane = size * size
  for (let i = 0; i < plane; i++) {
    const j = i * 4
    out[i] = data[j] / 255
    out[plane + i] = data[j + 1] / 255
    out[2 * plane + i] = data[j + 2] / 255
  }
  return out
}

export type YoloRawDetection = {
  classId: number
  confidence: number
  cx: number
  cy: number
  w: number
  h: number
}

/**
 * Parse YOLOv8-style ONNX output [1, 4+numClasses, numAnchors].
 * Coordinates are normalized 0–1 center format.
 */
export function parseYoloV8Output(
  data: Float32Array,
  numClasses: number,
  numAnchors: number,
  minConfidence: number,
): YoloRawDetection[] {
  const out: YoloRawDetection[] = []
  for (let a = 0; a < numAnchors; a++) {
    let bestClass = 0
    let bestScore = 0
    for (let c = 0; c < numClasses; c++) {
      const score = data[(4 + c) * numAnchors + a]
      if (score > bestScore) {
        bestScore = score
        bestClass = c
      }
    }
    if (bestScore < minConfidence) continue
    const cx = data[0 * numAnchors + a]
    const cy = data[1 * numAnchors + a]
    const w = data[2 * numAnchors + a]
    const h = data[3 * numAnchors + a]
    out.push({ classId: bestClass, confidence: bestScore, cx, cy, w, h })
  }
  return out
}

export function centerBoxToBbox(cx: number, cy: number, w: number, h: number): BoundingBox {
  return {
    x: cx - w / 2,
    y: cy - h / 2,
    width: w,
    height: h,
  }
}

export function countDetectionsByType(detections: PrivacyDetection[]): Partial<Record<string, number>> {
  const counts: Partial<Record<string, number>> = {}
  for (const d of detections) {
    counts[d.type] = (counts[d.type] ?? 0) + 1
  }
  return counts
}
