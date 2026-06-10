import { canvasToBmpBlob, canvasToGifBlob, canvasToTiffBlob } from './image-encoders'
import type { NormalizeFormat } from '../types'

export type PngDepth = 'full' | 'reduced' | 'minimal'

/** Promise wrapper around canvas.toBlob with a default quality (0.94). */
export async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), type, quality ?? 0.94)
  })
}

/**
 * Export canvas as PNG with optional color quantization.
 * 'full' → no quantization (lossless). 'reduced' → 5-bit/channel (step 8),
 * 'minimal' → 3-bit/channel (step 32).
 */
export async function quantizeCanvasToBlob(canvas: HTMLCanvasElement, depth: PngDepth): Promise<Blob> {
  if (depth === 'full') return canvasToBlob(canvas, 'image/png')
  const tmp = document.createElement('canvas')
  tmp.width = canvas.width
  tmp.height = canvas.height
  const ctx = tmp.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(canvas, 0, 0)
  const imageData = ctx.getImageData(0, 0, tmp.width, tmp.height)
  const { data } = imageData
  const step = depth === 'reduced' ? 8 : 32
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.round(data[i] / step) * step)
    data[i + 1] = Math.min(255, Math.round(data[i + 1] / step) * step)
    data[i + 2] = Math.min(255, Math.round(data[i + 2] / step) * step)
    // alpha channel left unchanged
  }
  ctx.putImageData(imageData, 0, 0)
  return canvasToBlob(tmp, 'image/png')
}

/** Export canvas to blob, handling all supported formats. */
export async function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: NormalizeFormat,
  quality: number,
  pngDepth: PngDepth,
): Promise<Blob> {
  switch (format) {
    case 'image/png': return quantizeCanvasToBlob(canvas, pngDepth)
    case 'image/bmp': return canvasToBmpBlob(canvas)
    case 'image/gif': return canvasToGifBlob(canvas)
    case 'image/tiff': return canvasToTiffBlob(canvas)
    default: return canvasToBlob(canvas, format, quality / 100)
  }
}

/**
 * Re-encode a blob through a canvas to strip all embedded metadata
 * (EXIF, GPS coordinates, camera info, timestamps, ICC profiles, etc.).
 * The canvas API only retains raw pixel data — all metadata segments are discarded.
 */
export async function stripMetadata(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bmp.width
  canvas.height = bmp.height
  canvas.getContext('2d')!.drawImage(bmp, 0, 0)
  bmp.close()
  const mime = blob.type || 'image/jpeg'
  // PNG stays lossless; JPEG/WebP use a high-quality re-encode
  return canvasToBlob(canvas, mime, mime === 'image/png' ? undefined : 0.96)
}
