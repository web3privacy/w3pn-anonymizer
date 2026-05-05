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

function paramsToOptions(params: VectorizeParams): string | object {
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

/**
 * Convert canvas to SVG string.
 * For large images, internally downscales to prevent OOM / long processing.
 */
export async function canvasToSvg(
  canvas: HTMLCanvasElement,
  params: VectorizeParams = DEFAULT_VECTORIZE_PARAMS,
): Promise<string> {
  const tracer = await ensureImageTracer()
  let imageData: ImageData
  const w = canvas.width, h = canvas.height
  if (w > MAX_VECTORIZE_DIM || h > MAX_VECTORIZE_DIM) {
    const scale = Math.min(MAX_VECTORIZE_DIM / w, MAX_VECTORIZE_DIM / h)
    const sw = Math.round(w * scale), sh = Math.round(h * scale)
    const tmp = document.createElement('canvas')
    tmp.width = sw; tmp.height = sh
    const tctx = tmp.getContext('2d')
    if (!tctx) throw new Error('Cannot create temporary canvas')
    tctx.drawImage(canvas, 0, 0, sw, sh)
    imageData = tctx.getImageData(0, 0, sw, sh)
  } else {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Cannot get canvas context')
    imageData = ctx.getImageData(0, 0, w, h)
  }
  return tracer.imagedataToSVG(imageData, paramsToOptions(params))
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
