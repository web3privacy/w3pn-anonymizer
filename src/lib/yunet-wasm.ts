/**
 * YuNet face detection via ONNX Runtime Web.
 *
 * Runs the same YuNet model as the Python backend, but entirely
 * inside the browser using WebAssembly — no server required.
 *
 * Model: face_detection_yunet_2023mar.onnx  (232 KB)
 * Input: [1, 3, 640, 640]  float32  (BGR, 0-255)
 * Output: cls/obj/bbox/kps at strides 8, 16, 32
 */

import * as ort from 'onnxruntime-web'
import type { FaceBox } from '../types'

// ── Constants ────────────────────────────────────────────────────────────────

const MODEL_INPUT_SIZE = 640
const STRIDES = [8, 16, 32] as const
const DEFAULT_SCORE_THR = 0.55
const DEFAULT_NMS_THR = 0.30
const TOP_K = 5000

// ── State ────────────────────────────────────────────────────────────────────

let session: ort.InferenceSession | null = null
let initPromise: Promise<boolean> | null = null

// Reusable preprocessing buffers. The model input is a fixed 640x640 tensor, so
// the resize canvas and the CHW float buffer (~4.9 MB) can be allocated once and
// reused across every inference instead of per call (big GC win on mobile).
let resizeCanvas: HTMLCanvasElement | null = null
let chwBuffer: Float32Array | null = null

export interface DetectorLoadProgress {
  loaded: number
  total: number
  /** download = fetching files; init = compiling WASM / creating session; ready = done */
  phase: 'download' | 'init' | 'ready'
}

let onLoadProgress: ((p: DetectorLoadProgress) => void) | null = null

export function setYuNetLoadProgressCallback(cb: ((p: DetectorLoadProgress) => void) | null): void {
  onLoadProgress = cb
}

const reportLoad = (p: DetectorLoadProgress) => onLoadProgress?.(p)

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    }),
  ])
}

/** Fetch a URL while reporting byte progress; resolves to the downloaded bytes. */
async function fetchWithProgress(
  url: string,
  onChunk: (deltaBytes: number, totalForThisFile: number) => void,
): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok || !res.body) {
    // Fall back to a plain fetch so init still proceeds even without streaming.
    return res.arrayBuffer()
  }
  const total = Number(res.headers.get('Content-Length')) || 0
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      loaded += value.length
      onChunk(value.length, total)
    }
  }
  const buf = new Uint8Array(loaded)
  let offset = 0
  for (const c of chunks) {
    buf.set(c, offset)
    offset += c.length
  }
  return buf.buffer
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function initYuNet(): Promise<boolean> {
  if (session) return true
  if (initPromise) return initPromise

  initPromise = (async () => {
    const base = new URL('.', window.location.href).href
    const modelUrl = `${base}models/face_detection_yunet_2023mar.onnx`
    const wasmUrl = `${base}onnx/ort-wasm-simd-threaded.wasm`
    ort.env.wasm.wasmPaths = `${base}onnx/`

    // Pre-fetch model + WASM with combined byte progress. ORT reuses the cached
    // WASM; session creation / compile is the remaining init step (no bytes).
    let modelBuffer: ArrayBuffer | null = null
    let modelLoaded = 0
    let modelTotal = 0
    let wasmLoaded = 0
    let wasmTotal = 0
    let lastReportedLoaded = 0

    const reportDownload = () => {
      const total = modelTotal + wasmTotal
      const loaded = modelLoaded + wasmLoaded
      lastReportedLoaded = Math.max(lastReportedLoaded, loaded)
      reportLoad({ loaded: lastReportedLoaded, total: total > 0 ? total : 0, phase: 'download' })
    }

    try {
      modelBuffer = await fetchWithProgress(modelUrl, (delta, fileTotal) => {
        modelLoaded += delta
        if (fileTotal > 0) modelTotal = fileTotal
        reportDownload()
      })
    } catch {
      modelBuffer = null
    }

    try {
      await fetchWithProgress(wasmUrl, (delta, fileTotal) => {
        wasmLoaded += delta
        if (fileTotal > 0) wasmTotal = fileTotal
        reportDownload()
      })
    } catch {
      // ORT will attempt its own fetch if the warm-cache prefetch fails.
    }

    const combinedTotal = modelTotal + wasmTotal
    const combinedLoaded = modelLoaded + wasmLoaded
    lastReportedLoaded = Math.max(lastReportedLoaded, combinedLoaded)
    reportLoad({
      loaded: combinedTotal > 0 ? lastReportedLoaded : lastReportedLoaded,
      total: combinedTotal > 0 ? combinedTotal : 1,
      phase: 'init',
    })

    // Single-thread WASM: reliable and fast to initialize (no SharedArrayBuffer /
    // cross-origin isolation requirement, no worker-spawn step that can hang).
    // Inference stays fast because we detect on small frames; live mode further
    // shrinks the detect resolution. A timeout guards against a stuck compile.
    ort.env.wasm.numThreads = 1

    // Prefer the WebGPU execution provider when the browser exposes it — this
    // runs inference on the GPU entirely locally (no data leaves the browser),
    // a big win on the heavy thorough/video detection paths. WASM remains the
    // fallback if WebGPU is unavailable or session creation fails (mobile Safari
    // support is still uneven). The JSEP wasm needed for WebGPU ships in onnx/.
    const modelSource: Uint8Array | string = modelBuffer ? new Uint8Array(modelBuffer) : modelUrl
    const webgpuAvailable = typeof navigator !== 'undefined' && 'gpu' in navigator

    const createSession = async (): Promise<ort.InferenceSession> => {
      if (webgpuAvailable) {
        try {
          if (import.meta.env.DEV) console.log('[yunet-wasm] Trying WebGPU EP…')
          return await withTimeout(
            ort.InferenceSession.create(modelSource as Uint8Array, {
              executionProviders: ['webgpu', 'wasm'],
            }),
            30000,
            'ONNX session (webgpu)',
          )
        } catch (err) {
          console.warn('[yunet-wasm] WebGPU EP unavailable, falling back to WASM:', err)
        }
      }
      return withTimeout(
        ort.InferenceSession.create(modelSource as Uint8Array, { executionProviders: ['wasm'] }),
        30000,
        'ONNX session (wasm)',
      )
    }

    try {
      if (import.meta.env.DEV) {
        console.log('[yunet-wasm] Creating session…', modelUrl)
      }
      session = await createSession()
      if (import.meta.env.DEV) {
        console.log('[yunet-wasm] Session ready, inputs:', session.inputNames)
      }
      reportLoad({
        loaded: combinedTotal > 0 ? combinedTotal : 1,
        total: combinedTotal > 0 ? combinedTotal : 1,
        phase: 'ready',
      })
      return true
    } catch (err) {
      console.error('[yunet-wasm] Failed to create ONNX session:', err)
      session = null
      reportLoad({
        loaded: combinedTotal > 0 ? combinedTotal : 1,
        total: combinedTotal > 0 ? combinedTotal : 1,
        phase: 'ready',
      })
      return false
    } finally {
      initPromise = null
    }
  })()

  return initPromise
}

export function isYuNetReady(): boolean {
  return session !== null
}

export function disposeYuNet(): void {
  session?.release()
  session = null
  initPromise = null
}

/**
 * Detect faces on a canvas using YuNet ONNX model.
 * Returns boxes in the canvas's original coordinate space.
 */
export async function detectYuNet(
  canvas: HTMLCanvasElement,
  scoreThreshold = DEFAULT_SCORE_THR,
): Promise<FaceBox[]> {
  if (!session) {
    const ok = await initYuNet()
    if (!ok || !session) return []
  }

  const origW = canvas.width
  const origH = canvas.height

  // The exported YuNet ONNX expects a fixed 640x640 tensor.
  // Draw smaller crops into the top-left of the frame and leave the rest padded.
  const inputW = Math.min(origW, MODEL_INPUT_SIZE)
  const inputH = Math.min(origH, MODEL_INPUT_SIZE)
  const padW = MODEL_INPUT_SIZE
  const padH = MODEL_INPUT_SIZE

  // Scale factors to map detections back to original image coordinates
  const scaleX = origW / inputW
  const scaleY = origH / inputH

  // Resize canvas to inputW × inputH and prepare pixel data (reused across calls)
  if (!resizeCanvas) {
    resizeCanvas = document.createElement('canvas')
    resizeCanvas.width = padW
    resizeCanvas.height = padH
  }
  const ctx = resizeCanvas.getContext('2d', { willReadFrequently: true })!
  ctx.clearRect(0, 0, padW, padH)
  ctx.drawImage(canvas, 0, 0, origW, origH, 0, 0, inputW, inputH)

  const imageData = ctx.getImageData(0, 0, padW, padH)
  const pixels = imageData.data // RGBA

  // Convert to NCHW float32 tensor (BGR order, values 0-255) into a reused buffer
  const chw = chwBuffer ?? (chwBuffer = new Float32Array(3 * padH * padW))
  const planeSize = padH * padW
  for (let i = 0; i < padH * padW; i++) {
    const ri = i * 4
    chw[0 * planeSize + i] = pixels[ri + 2] // B
    chw[1 * planeSize + i] = pixels[ri + 1] // G
    chw[2 * planeSize + i] = pixels[ri + 0] // R
  }

  const inputTensor = new ort.Tensor('float32', chw, [1, 3, padH, padW])

  // Run inference (YuNet ONNX uses the standard input name `input`; fallback to first binding)
  const inName = session.inputNames?.length ? session.inputNames[0] : 'input'
  const results = await session.run({ [inName]: inputTensor })

  // Decode outputs at each stride
  const rawFaces: Array<{ x: number; y: number; w: number; h: number; score: number }> = []

  for (let si = 0; si < STRIDES.length; si++) {
    const stride = STRIDES[si]
    const cols = Math.floor(padW / stride)
    const rows = Math.floor(padH / stride)
    const numAnchors = rows * cols

    const cls = results[`cls_${stride}`].data as Float32Array
    const obj = results[`obj_${stride}`].data as Float32Array
    const bbox = results[`bbox_${stride}`].data as Float32Array

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c
        if (idx >= numAnchors) continue

        // Score = sqrt(clamp01(cls) * clamp01(obj))
        const clsVal = Math.max(0, Math.min(1, cls[idx]))
        const objVal = Math.max(0, Math.min(1, obj[idx]))
        const score = Math.sqrt(clsVal * objVal)

        if (score < scoreThreshold) continue

        // Decode bounding box
        const bIdx = idx * 4
        const cx = (c + bbox[bIdx + 0]) * stride
        const cy = (r + bbox[bIdx + 1]) * stride
        const w = Math.exp(bbox[bIdx + 2]) * stride
        const h = Math.exp(bbox[bIdx + 3]) * stride

        const x1 = cx - w / 2
        const y1 = cy - h / 2

        // Map back to original image coordinates
        rawFaces.push({
          x: x1 * scaleX,
          y: y1 * scaleY,
          w: w * scaleX,
          h: h * scaleY,
          score,
        })
      }
    }
  }

  // Release ORT tensors now that all output data has been copied into rawFaces.
  // ORT Web tensors hold WASM-side memory that is not freed by GC alone.
  try {
    (inputTensor as { dispose?: () => void }).dispose?.()
    for (const key of Object.keys(results)) {
      (results[key] as { dispose?: () => void }).dispose?.()
    }
  } catch { /* dispose is best-effort */ }

  // Sort by score descending and apply NMS
  rawFaces.sort((a, b) => b.score - a.score)
  const topFaces = rawFaces.slice(0, TOP_K)
  const kept = applyNMS(topFaces, DEFAULT_NMS_THR)

  return kept.map((f) => ({
    x: Math.max(0, f.x),
    y: Math.max(0, f.y),
    width: Math.min(f.w, origW - Math.max(0, f.x)),
    height: Math.min(f.h, origH - Math.max(0, f.y)),
    score: f.score,
  }))
}

// ── NMS ──────────────────────────────────────────────────────────────────────

function applyNMS(
  faces: Array<{ x: number; y: number; w: number; h: number; score: number }>,
  iouThr: number,
): Array<{ x: number; y: number; w: number; h: number; score: number }> {
  if (faces.length <= 1) return faces
  const kept: typeof faces = []
  const suppressed = new Set<number>()

  for (let i = 0; i < faces.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(faces[i])
    for (let j = i + 1; j < faces.length; j++) {
      if (suppressed.has(j)) continue
      if (computeIoU(faces[i], faces[j]) > iouThr) suppressed.add(j)
    }
  }
  return kept
}

function computeIoU(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): number {
  const x1 = Math.max(a.x, b.x)
  const y1 = Math.max(a.y, b.y)
  const x2 = Math.min(a.x + a.w, b.x + b.w)
  const y2 = Math.min(a.y + a.h, b.y + b.h)
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  if (inter === 0) return 0
  return inter / (a.w * a.h + b.w * b.h - inter)
}
