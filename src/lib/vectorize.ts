/**
 * Browser-based image vectorization using imagetracer.js.
 * Converts raster images to SVG — fully local, no network calls.
 */

interface ImageTracerInstance {
  imagedataToSVG: (imgData: ImageData, options?: string | object) => string
}

declare global {
  interface Window {
    ImageTracer?: ImageTracerInstance
  }
}

let imageTracerLoadPromise: Promise<ImageTracerInstance> | null = null

async function ensureImageTracer(): Promise<ImageTracerInstance> {
  if (window.ImageTracer) return window.ImageTracer
  if (!imageTracerLoadPromise) {
    imageTracerLoadPromise = new Promise<ImageTracerInstance>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = new URL('vendor/imagetracer_v1.2.6.js', document.baseURI).toString()
      script.async = true
      script.onload = () => {
        if (window.ImageTracer) resolve(window.ImageTracer)
        else reject(new Error('ImageTracer loaded without exposing window.ImageTracer'))
      }
      script.onerror = () => reject(new Error(`Failed to load local ImageTracer bundle: ${script.src}`))
      document.head.appendChild(script)
    })
  }
  return imageTracerLoadPromise
}

export type VectorizePreset =
  | 'default'
  | 'posterized'
  | 'curvy'
  | 'sharp'
  | 'detailed'
  | 'smoothed'
  | 'grayscale'
  | 'artistic'

export const VECTORIZE_PRESETS: { id: VectorizePreset; label: string; desc: string }[] = [
  { id: 'default', label: 'Default', desc: 'Balanced tracing' },
  { id: 'posterized', label: 'Posterized', desc: 'Reduced colors, flat areas' },
  { id: 'curvy', label: 'Curvy', desc: 'Smooth curves, fewer corners' },
  { id: 'sharp', label: 'Sharp', desc: 'Crisp edges, detailed corners' },
  { id: 'detailed', label: 'Detailed', desc: 'Maximum detail, larger file' },
  { id: 'smoothed', label: 'Smoothed', desc: 'Smoothed shapes, minimal noise' },
  { id: 'grayscale', label: 'Grayscale', desc: 'Grayscale conversion' },
  { id: 'artistic', label: 'Artistic', desc: 'Stylized, illustrated look' },
]

export interface VectorizeParams {
  preset: VectorizePreset
  /** Number of colors (2–256). Lower = simpler SVG. */
  colorCount: number
  /** Minimum path segment length in px (0.5–10). Higher = smoother. */
  minPathLength: number
  /** Corner rounding threshold (0–2). Higher = rounder corners. */
  cornerThreshold: number
}

export const DEFAULT_VECTORIZE_PARAMS: VectorizeParams = {
  preset: 'default',
  colorCount: 16,
  minPathLength: 2,
  cornerThreshold: 1,
}

export function paramsToOptions(params: VectorizeParams): string | object {
  if (params.preset === 'posterized') return 'posterized2'
  if (params.preset === 'smoothed') {
    return {
      blurradius: 2,
      blurdelta: 20,
      ltres: 1.5,
      qtres: 1.5,
      pathomit: 16,
      numberofcolors: 12,
      colorquantcycles: 3,
    }
  }
  if (params.preset === 'artistic') return 'artistic1'
  if (params.preset !== 'default') return params.preset
  return {
    numberofcolors: params.colorCount,
    mincolorratio: 0,
    colorquantcycles: 3,
    ltres: params.cornerThreshold,
    qtres: params.cornerThreshold,
    pathomit: Math.round(params.minPathLength * 4),
    blurradius: 0,
    blurdelta: 20,
  }
}

const MAX_VECTORIZE_DIM = 1200

// ── Worker offloading (keeps the UI responsive on large images) ───────────────
// The worker runs the exact same ImageTracer.imagedataToSVG, just off the main
// thread. We always keep a synchronous main-thread fallback so behavior is
// preserved if Worker creation or the worker run fails.

const VENDOR_URL = (() => {
  try {
    return new URL('vendor/imagetracer_v1.2.6.js', document.baseURI).toString()
  } catch {
    return 'vendor/imagetracer_v1.2.6.js'
  }
})()

let vectorizeWorker: Worker | null = null
let workerDisabled = false
let workerSeq = 0
const pendingWorkerJobs = new Map<number, { resolve: (svg: string) => void; reject: (err: Error) => void }>()

function getWorker(): Worker | null {
  if (workerDisabled) return null
  if (vectorizeWorker) return vectorizeWorker
  if (typeof Worker === 'undefined') { workerDisabled = true; return null }
  try {
    vectorizeWorker = new Worker(new URL('./vectorize.worker.ts', import.meta.url), { type: 'classic' })
    vectorizeWorker.onmessage = (ev: MessageEvent) => {
      const { id, svg, error } = ev.data as { id: number; svg?: string; error?: string }
      const job = pendingWorkerJobs.get(id)
      if (!job) return
      pendingWorkerJobs.delete(id)
      if (typeof svg === 'string') job.resolve(svg)
      else job.reject(new Error(error ?? 'worker vectorize failed'))
    }
    vectorizeWorker.onerror = () => {
      // Fatal worker error: reject everything in flight and disable the worker
      // path so subsequent calls go straight to the main-thread fallback.
      workerDisabled = true
      for (const [, job] of pendingWorkerJobs) job.reject(new Error('vectorize worker crashed'))
      pendingWorkerJobs.clear()
      vectorizeWorker = null
    }
  } catch {
    workerDisabled = true
    return null
  }
  return vectorizeWorker
}

function vectorizeViaWorker(imageData: ImageData, options: string | object): Promise<string> {
  const worker = getWorker()
  if (!worker) return Promise.reject(new Error('worker unavailable'))
  const id = ++workerSeq
  return new Promise<string>((resolve, reject) => {
    pendingWorkerJobs.set(id, { resolve, reject })
    // Copy the pixel buffer (no transfer) so the caller can still fall back to
    // the main-thread tracer with the same ImageData if the worker fails.
    worker.postMessage({
      id,
      vendorUrl: VENDOR_URL,
      width: imageData.width,
      height: imageData.height,
      data: new Uint8ClampedArray(imageData.data),
      options,
    })
  })
}

function extractImageData(canvas: HTMLCanvasElement): ImageData {
  const w = canvas.width, h = canvas.height
  if (w > MAX_VECTORIZE_DIM || h > MAX_VECTORIZE_DIM) {
    const scale = Math.min(MAX_VECTORIZE_DIM / w, MAX_VECTORIZE_DIM / h)
    const sw = Math.round(w * scale), sh = Math.round(h * scale)
    const tmp = document.createElement('canvas')
    tmp.width = sw; tmp.height = sh
    const tctx = tmp.getContext('2d')
    if (!tctx) throw new Error('Cannot create temporary canvas')
    tctx.drawImage(canvas, 0, 0, sw, sh)
    return tctx.getImageData(0, 0, sw, sh)
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get canvas context')
  return ctx.getImageData(0, 0, w, h)
}

/**
 * Convert canvas to SVG string.
 * For large images, internally downscales to prevent OOM / long processing.
 * Runs in a Web Worker when available, with a main-thread fallback.
 */
export async function canvasToSvg(
  canvas: HTMLCanvasElement,
  params: VectorizeParams = DEFAULT_VECTORIZE_PARAMS,
): Promise<string> {
  const imageData = extractImageData(canvas)
  const options = paramsToOptions(params)
  try {
    return await vectorizeViaWorker(imageData, options)
  } catch {
    // Fallback: run the tracer on the main thread (identical output).
    const tracer = await ensureImageTracer()
    return tracer.imagedataToSVG(imageData, options)
  }
}

/**
 * Convert canvas to SVG Blob for download.
 */
export async function canvasToSvgBlob(
  canvas: HTMLCanvasElement,
  params: VectorizeParams = DEFAULT_VECTORIZE_PARAMS,
): Promise<Blob> {
  const svgString = await canvasToSvg(canvas, params)
  return new Blob([svgString], { type: 'image/svg+xml' })
}
