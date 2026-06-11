/**
 * Local OCR → PII detector. Runs Tesseract.js (fully in-browser, self-hosted
 * assets under /public/tesseract) on an image canvas, reconstructs the text
 * with per-word bounding boxes, then reuses the document regex/checksum PII
 * recognizers to locate sensitive strings (emails, cards, IBAN, national IDs…)
 * and emit them as `pii_text` privacy detections positioned over the image.
 *
 * No network, no upload. Heavy assets lazy-load on first use.
 */
import type { PrivacyDetection } from '../../types'
import { DETECTION_COLORS } from '../detection-config'
import { createDetectionId } from '../detections/adapters'
import { detectPiiInText } from '../document/piiDetectors'

const OCR_LANGS = ['eng', 'ces']

export type OcrProgressPhase = 'init' | 'download' | 'recognize' | 'ready'
export type OcrProgress = { phase: OcrProgressPhase; progress?: number; label?: string }

let progressCb: ((p: OcrProgress) => void) | null = null
export function setOcrProgressCallback(cb: ((p: OcrProgress) => void) | null): void {
  progressCb = cb
}
const report = (p: OcrProgress) => progressCb?.(p)

type TessWorker = {
  recognize: (image: HTMLCanvasElement, opts?: unknown, output?: unknown) => Promise<{ data: TessData }>
  terminate: () => Promise<void>
}

export type TessBBox = { x0: number; y0: number; x1: number; y1: number }
export type TessWord = { text: string; bbox: TessBBox; confidence?: number }
type TessLine = { words?: TessWord[] }
type TessParagraph = { lines?: TessLine[] }
type TessBlock = { paragraphs?: TessParagraph[] }
type TessData = { text?: string; words?: TessWord[]; blocks?: TessBlock[] }

let workerPromise: Promise<TessWorker | null> | null = null

/** Lazily create (and cache) the Tesseract worker with self-hosted assets. */
async function getWorker(): Promise<TessWorker | null> {
  if (workerPromise) return workerPromise
  workerPromise = (async () => {
    try {
      report({ phase: 'init', label: 'Starting OCR engine…' })
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker(OCR_LANGS, 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/',
        langPath: '/tesseract/lang',
        gzip: false,
        logger: (m: { status?: string; progress?: number }) => {
          if (!m?.status) return
          if (m.status.includes('loading language') || m.status.includes('initiali')) {
            report({ phase: 'download', progress: m.progress, label: 'Loading OCR language data…' })
          } else if (m.status.includes('recognizing')) {
            report({ phase: 'recognize', progress: m.progress, label: 'Scanning text…' })
          }
        },
      })
      report({ phase: 'ready' })
      return worker as unknown as TessWorker
    } catch (err) {
      console.error('OCR worker init failed', err)
      workerPromise = null
      return null
    }
  })()
  return workerPromise
}

/** Kick off OCR asset download without running recognition (background prefetch). */
export async function preloadOcr(): Promise<boolean> {
  return (await getWorker()) != null
}

export function disposeOcr(): void {
  const p = workerPromise
  workerPromise = null
  void p?.then((w) => w?.terminate())
}

function flattenWords(data: TessData): TessWord[] {
  if (Array.isArray(data.words) && data.words.length > 0) return data.words
  const out: TessWord[] = []
  for (const block of data.blocks ?? []) {
    for (const para of block.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        for (const word of line.words ?? []) out.push(word)
      }
    }
  }
  return out
}

type IndexedWord = { word: TessWord; start: number; end: number }

/** Concatenate words into a single string, tracking each word's char range. */
function buildText(words: TessWord[]): { text: string; indexed: IndexedWord[] } {
  let text = ''
  const indexed: IndexedWord[] = []
  for (const word of words) {
    const t = (word.text ?? '').trim()
    if (!t) continue
    if (text.length > 0) text += ' '
    const start = text.length
    text += t
    indexed.push({ word, start, end: text.length })
  }
  return { text, indexed }
}

function unionBox(words: TessWord[]): TessBBox | null {
  if (words.length === 0) return null
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const w of words) {
    x0 = Math.min(x0, w.bbox.x0)
    y0 = Math.min(y0, w.bbox.y0)
    x1 = Math.max(x1, w.bbox.x1)
    y1 = Math.max(y1, w.bbox.y1)
  }
  return { x0, y0, x1, y1 }
}

/**
 * Pure core: turn OCR words + image size into PII privacy detections. Exposed
 * for unit testing without the Tesseract worker.
 */
export function piiDetectionsFromWords(
  words: TessWord[],
  imageW: number,
  imageH: number,
  minConfidence = 0.5,
): PrivacyDetection[] {
  if (words.length === 0 || imageW <= 0 || imageH <= 0) return []
  const { text, indexed } = buildText(words)
  const spans = detectPiiInText(text)
  const padX = imageW * 0.004
  const padY = imageH * 0.006

  const detections: PrivacyDetection[] = []
  for (const span of spans) {
    if ((span.confidence ?? 0) < minConfidence) continue
    const s = span.start ?? 0
    const e = span.end ?? 0
    const hitWords = indexed.filter((iw) => iw.start < e && iw.end > s).map((iw) => iw.word)
    const box = unionBox(hitWords)
    if (!box) continue
    const x = Math.max(0, box.x0 - padX)
    const y = Math.max(0, box.y0 - padY)
    const right = Math.min(imageW, box.x1 + padX)
    const bottom = Math.min(imageH, box.y1 + padY)
    if (right <= x || bottom <= y) continue
    detections.push({
      id: createDetectionId('pii'),
      type: 'pii_text',
      bbox: { x: x / imageW, y: y / imageH, width: (right - x) / imageW, height: (bottom - y) / imageH },
      confidence: span.confidence ?? 0.8,
      sourceModel: 'tesseract-ocr',
      color: DETECTION_COLORS.pii_text,
      objectClass: span.type,
    })
  }
  return detections
}

/**
 * Recognize text on the canvas and return PII regions as privacy detections.
 * `minConfidence` filters out low-confidence PII spans (regex confidence).
 */
/**
 * OCR resolution policy. Tesseract reads text far better when glyphs have enough
 * pixels: a small source (e.g. a 1024px phone photo of a document) yields almost
 * no readable words at native size — so we *upscale* small inputs toward a
 * comfortable working size, and *downscale* very large ones to bound memory and
 * runtime (a 50 MP photo would otherwise freeze the tab). Detections are stored
 * as normalized (0–1) boxes, so they map back onto the original image regardless
 * of the working scale used here.
 */
const TARGET_OCR_DIM = 3000 // preferred long side for recognition
const MAX_OCR_DIM = 3200 // hard cap (memory/runtime) for very large sources
const MAX_OCR_UPSCALE = 3 // never blow a tiny thumbnail up beyond 3×

function resizeForOcr(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const longSide = Math.max(canvas.width, canvas.height)
  if (longSide <= 0) return canvas
  let scale = TARGET_OCR_DIM / longSide
  // Cap upscaling of tiny inputs, and never exceed the hard max for big inputs.
  scale = Math.min(scale, MAX_OCR_UPSCALE)
  if (scale * longSide > MAX_OCR_DIM) scale = MAX_OCR_DIM / longSide
  // Effectively native — skip the (costly) copy.
  if (scale > 0.98 && scale < 1.02) return canvas
  const w = Math.max(1, Math.round(canvas.width * scale))
  const h = Math.max(1, Math.round(canvas.height * scale))
  const tmp = document.createElement('canvas')
  tmp.width = w
  tmp.height = h
  const ctx = tmp.getContext('2d')
  if (!ctx) return canvas
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, w, h)
  return tmp
}

export async function detectPiiViaOcr(
  canvas: HTMLCanvasElement,
  minConfidence = 0.5,
): Promise<PrivacyDetection[]> {
  const worker = await getWorker()
  if (!worker) return []

  report({ phase: 'recognize', label: 'Scanning text…' })
  const work = resizeForOcr(canvas)
  let data: TessData
  try {
    const result = await worker.recognize(work, undefined, { text: true, blocks: true })
    data = result.data
  } catch (err) {
    console.error('OCR recognize failed', err)
    return []
  }

  const words = flattenWords(data)
  if (words.length === 0) { report({ phase: 'ready' }); return [] }

  // Use the OCR canvas dimensions: word boxes are in that space, and the output
  // boxes are normalized so they map back onto the original image unchanged.
  const detections = piiDetectionsFromWords(words, work.width, work.height, minConfidence)
  report({ phase: 'ready' })
  return detections
}

/** Whether the pii_text category is enabled in the given config. */
export function isPiiTextEnabled(
  config: { type: string; enabled: boolean }[],
): boolean {
  return config.some((c) => c.enabled && c.type === 'pii_text')
}
