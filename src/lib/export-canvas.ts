import { canvasToBmpBlob, canvasToGifBlob, canvasToTiffBlob } from './image-encoders'
import type { NormalizeFormat } from '../types'

type PngDepth = 'full' | 'reduced' | 'minimal'

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality)
  })
}

async function quantizeCanvasToBlob(canvas: HTMLCanvasElement, depth: PngDepth): Promise<Blob> {
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
  }
  ctx.putImageData(imageData, 0, 0)
  return canvasToBlob(tmp, 'image/png')
}

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
