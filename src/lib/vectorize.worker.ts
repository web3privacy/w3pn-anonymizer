/// <reference lib="webworker" />
/**
 * Web Worker that runs ImageTracer's pure `imagedataToSVG` off the main thread,
 * so vectorizing large images no longer freezes the UI. The heavy tracing is
 * identical to the main-thread path — only the thread changes.
 *
 * The vendor bundle exposes `self.ImageTracer` when loaded via importScripts
 * (see public/vendor/imagetracer_v1.2.6.js export tail). Only `imagedataToSVG`
 * is used here; the DOM-dependent helpers in the bundle are never called.
 */

interface ImageTracerInstance {
  imagedataToSVG: (imgData: { data: Uint8ClampedArray; width: number; height: number }, options?: string | object) => string
}

interface WorkerGlobals {
  ImageTracer?: ImageTracerInstance
  importScripts: (...urls: string[]) => void
  postMessage: (message: unknown) => void
  onmessage: ((ev: MessageEvent) => void) | null
}

const ctx = self as unknown as WorkerGlobals

let tracerError: string | null = null

function ensureTracer(vendorUrl: string): ImageTracerInstance | null {
  if (ctx.ImageTracer) return ctx.ImageTracer
  if (tracerError) return null
  try {
    ctx.importScripts(vendorUrl)
  } catch (err) {
    tracerError = err instanceof Error ? err.message : 'importScripts failed'
    return null
  }
  if (!ctx.ImageTracer) {
    tracerError = 'ImageTracer did not register on the worker global'
    return null
  }
  return ctx.ImageTracer
}

interface VectorizeRequest {
  id: number
  vendorUrl: string
  width: number
  height: number
  data: Uint8ClampedArray
  options: string | object
}

ctx.onmessage = (ev: MessageEvent) => {
  const req = ev.data as VectorizeRequest
  try {
    const tracer = ensureTracer(req.vendorUrl)
    if (!tracer) {
      ctx.postMessage({ id: req.id, error: tracerError ?? 'tracer unavailable' })
      return
    }
    const svg = tracer.imagedataToSVG(
      { data: req.data, width: req.width, height: req.height },
      req.options,
    )
    ctx.postMessage({ id: req.id, svg })
  } catch (err) {
    ctx.postMessage({ id: req.id, error: err instanceof Error ? err.message : 'vectorize failed' })
  }
}
