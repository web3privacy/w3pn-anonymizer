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
type WordLine = { words: TessWord[]; text: string; bbox: TessBBox }

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

function normalizeForSensitiveHeuristics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[|]/g, 'i')
    .replace(/\s+/g, ' ')
    .trim()
}

const SENSITIVE_LABEL_RE = /\b(?:jmeno|name|e-?mail|mail|telefon|phone|tel\.?|adresa|address|datum\s+narozeni|datum|narozen|birth|iban|bic|swift|ucet|uctu|account|cislo\s+uctu|card|karta|ico|ic\b|dic|tax\s+id|vat|op\b|passport|id\s*(?:card|number)?|wifi|wi\s*fi|heslo|password|secret|token|private\s+key)\b/i
const EMAILISH_RE = /@|(?:[a-z0-9._%+-]{2,}\s+(?:at|u)\s+[a-z0-9.-]{2,})/i
const LONG_NUMBER_RE = /(?:\+?\d[\d\s()./-]{5,}\d)/
const DATE_RE = /\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/
const MONEY_RE = /\b\d{1,3}(?:[ .]\d{3})*(?:[,.]\d{2})?\s*(?:kc|kč|czk|eur|usd|gbp|€|\$)\b/i
const POSTAL_CITY_RE = /\b\d{3}\s?\d{2}\s+[a-z]{2,}/i
const ADDRESS_RE = /\b(?:ulice|street|str\.?|namesti|trida|nabrezi|nabrezi|sidlo|sídlo|praha|brno|ostrava|plzen|olomouc|liberec|pardubice)\b/i
const REFERENCE_RE = /\b(?:fv|obj|inv|invoice|faktura|objednavka|smlouva|contract|cislo|c\.|no\.?)\s*[-:]?\s*[a-z0-9/-]{3,}\b/i
const NUMERIC_CLUSTER_RE = /(?:\d[\d\s./-]{2,}\d)/g

function lineLooksSensitive(text: string): boolean {
  const normalized = normalizeForSensitiveHeuristics(text)
  if (!normalized) return false
  if (SENSITIVE_LABEL_RE.test(normalized)) return true
  if (EMAILISH_RE.test(normalized)) return true
  if (DATE_RE.test(normalized)) return true
  if (MONEY_RE.test(normalized)) return true
  if (POSTAL_CITY_RE.test(normalized)) return true
  if (ADDRESS_RE.test(normalized) && /\d/.test(normalized)) return true
  if (REFERENCE_RE.test(normalized)) return true
  const digits = normalized.replace(/\D/g, '')
  if (digits.length >= 7 && LONG_NUMBER_RE.test(normalized)) return true
  const clusters = normalized.match(NUMERIC_CLUSTER_RE) ?? []
  return clusters.length >= 2 && digits.length >= 6
}

function groupWordsIntoLines(words: TessWord[]): WordLine[] {
  const usable = words
    .filter((w) => (w.text ?? '').trim() && (w.confidence === undefined || w.confidence >= 25))
    .sort((a, b) => {
      const ac = (a.bbox.y0 + a.bbox.y1) / 2
      const bc = (b.bbox.y0 + b.bbox.y1) / 2
      return ac - bc || a.bbox.x0 - b.bbox.x0
    })
  const lines: TessWord[][] = []
  for (const word of usable) {
    const center = (word.bbox.y0 + word.bbox.y1) / 2
    const height = Math.max(1, word.bbox.y1 - word.bbox.y0)
    const last = lines[lines.length - 1]
    if (!last) {
      lines.push([word])
      continue
    }
    const lastBox = unionBox(last)
    const lastCenter = lastBox ? (lastBox.y0 + lastBox.y1) / 2 : center
    const lastHeight = lastBox ? Math.max(1, lastBox.y1 - lastBox.y0) : height
    if (Math.abs(center - lastCenter) <= Math.max(12, Math.max(height, lastHeight) * 0.8)) {
      last.push(word)
    } else {
      lines.push([word])
    }
  }
  return lines.flatMap((lineWords) => {
    const sorted = [...lineWords].sort((a, b) => a.bbox.x0 - b.bbox.x0)
    const segments: TessWord[][] = []
    for (const word of sorted) {
      const current = segments[segments.length - 1]
      if (!current) {
        segments.push([word])
        continue
      }
      const prev = current[current.length - 1]
      const gap = word.bbox.x0 - prev.bbox.x1
      const avgHeight = Math.max(1, ((word.bbox.y1 - word.bbox.y0) + (prev.bbox.y1 - prev.bbox.y0)) / 2)
      const prevWidth = Math.max(1, prev.bbox.x1 - prev.bbox.x0)
      if (gap > Math.max(110, avgHeight * 7, prevWidth * 2.2)) {
        segments.push([word])
      } else {
        current.push(word)
      }
    }
    return segments.flatMap((segmentWords) => {
      const bbox = unionBox(segmentWords)
      if (!bbox) return []
      const text = segmentWords.map((w) => (w.text ?? '').trim()).filter(Boolean).join(' ')
      return [{ words: segmentWords, text, bbox }]
    })
  })
}

function bboxOverlaps(a: TessBBox, b: TessBBox): boolean {
  const x = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0))
  const y = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
  return x > 0 && y > 0
}

function bboxToDetection(
  box: TessBBox,
  imageW: number,
  imageH: number,
  confidence: number,
  objectClass: string,
): PrivacyDetection | null {
  const padX = imageW * 0.004
  const padY = imageH * 0.006
  const x = Math.max(0, box.x0 - padX)
  const y = Math.max(0, box.y0 - padY)
  const right = Math.min(imageW, box.x1 + padX)
  const bottom = Math.min(imageH, box.y1 + padY)
  if (right <= x || bottom <= y) return null
  return {
    id: createDetectionId('pii'),
    type: 'pii_text',
    bbox: { x: x / imageW, y: y / imageH, width: (right - x) / imageW, height: (bottom - y) / imageH },
    confidence,
    sourceModel: 'tesseract-ocr',
    color: DETECTION_COLORS.pii_text,
    objectClass,
  }
}

function sensitiveLineFallbackDetections(
  words: TessWord[],
  imageW: number,
  imageH: number,
  existingBoxes: TessBBox[],
  minConfidence: number,
): PrivacyDetection[] {
  const fallbackConfidence = 0.82
  if (fallbackConfidence < minConfidence) return []
  const detections: PrivacyDetection[] = []
  for (const line of groupWordsIntoLines(words)) {
    if (!lineLooksSensitive(line.text)) continue
    if (existingBoxes.some((box) => bboxOverlaps(box, line.bbox))) continue
    const det = bboxToDetection(line.bbox, imageW, imageH, fallbackConfidence, 'sensitive_line')
    if (det) detections.push(det)
  }
  return detections
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

  const detections: PrivacyDetection[] = []
  const existingBoxes: TessBBox[] = []
  for (const span of spans) {
    if ((span.confidence ?? 0) < minConfidence) continue
    const s = span.start ?? 0
    const e = span.end ?? 0
    const hitWords = indexed.filter((iw) => iw.start < e && iw.end > s).map((iw) => iw.word)
    const box = unionBox(hitWords)
    if (!box) continue
    const det = bboxToDetection(box, imageW, imageH, span.confidence ?? 0.8, span.type)
    if (!det) continue
    existingBoxes.push(box)
    detections.push(det)
  }
  return [
    ...detections,
    ...sensitiveLineFallbackDetections(words, imageW, imageH, existingBoxes, minConfidence),
  ]
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
