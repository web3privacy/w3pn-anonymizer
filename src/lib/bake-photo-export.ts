import { applyColorAdjustments, applyEffectRect } from './effects'
import type { ColorAdjustments, EffectRenderOptions, PhotoItem, Zone } from '../types'

export interface BakePhotoInput {
  photo: PhotoItem
  sourceBlob: Blob
  zones: Zone[]
  colorAdj?: ColorAdjustments
  brushStrength: number
  activeWorkCanvas?: HTMLCanvasElement | null
  isActivePhoto: boolean
  effectOptionsForZone?: (zone: Zone) => EffectRenderOptions
}

export async function bakePhotoToCanvas(input: BakePhotoInput): Promise<HTMLCanvasElement> {
  const { photo, sourceBlob, zones, colorAdj, brushStrength, activeWorkCanvas, isActivePhoto, effectOptionsForZone } = input

  if (isActivePhoto && activeWorkCanvas && activeWorkCanvas.width > 0 && !photo.isVideo) {
    const out = document.createElement('canvas')
    out.width = activeWorkCanvas.width
    out.height = activeWorkCanvas.height
    out.getContext('2d')!.drawImage(activeWorkCanvas, 0, 0)
    return out
  }

  const bmp = await createImageBitmap(sourceBlob)
  const canvas = document.createElement('canvas')
  canvas.width = bmp.width
  canvas.height = bmp.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    bmp.close()
    throw new Error('Canvas 2D unavailable')
  }
  ctx.drawImage(bmp, 0, 0)
  bmp.close()

  if (colorAdj) {
    applyColorAdjustments(ctx, colorAdj, canvas)
  }

  const w = canvas.width
  const h = canvas.height
  for (const z of zones) {
    applyEffectRect(
      ctx,
      z.effect,
      z.x * w,
      z.y * h,
      z.width * w,
      z.height * h,
      brushStrength,
      z.emoji,
      effectOptionsForZone?.(z),
    )
  }

  return canvas
}
