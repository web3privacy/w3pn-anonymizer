import imageCompression from 'browser-image-compression'
import picaFactory from 'pica'
import smartcrop from 'smartcrop'
import type {
  NormalizedRect,
  NormalizeFormat,
  NormalizeResult,
  NormalizeSettings,
  PhotoItem,
} from '../types'

const pica = picaFactory({
  tile: 1024,
  concurrency: Math.max(1, Math.min(4, Math.floor((navigator.hardwareConcurrency || 4) / 2))),
})

const EXTENSION_MAP: Record<NormalizeFormat, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const QUALITY_ENABLED_FORMATS = new Set<NormalizeFormat>(['image/jpeg', 'image/webp'])

const toFinite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback)
const clampInt = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(toFinite(value, min))))
const clampFloat = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, toFinite(value, min)))

interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

const WORKER_CODEC_LIB_URL = '/vendor/browser-image-compression.js'

const toBlob = (
  canvas: HTMLCanvasElement,
  format: NormalizeFormat,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const useQuality = QUALITY_ENABLED_FORMATS.has(format) ? quality : undefined
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed'))
          return
        }
        resolve(blob)
      },
      format,
      useQuality,
    )
  })

const createOutputName = (inputName: string, outputFormat: NormalizeFormat) => {
  const normalized = inputName.replace(/^\/+/, '')
  const extension = EXTENSION_MAP[outputFormat]
  const dotIndex = normalized.lastIndexOf('.')
  if (dotIndex < 0) {
    return `${normalized}.${extension}`
  }
  return `${normalized.slice(0, dotIndex)}.${extension}`
}

const getTargetSize = (
  width: number,
  height: number,
  settings: NormalizeSettings,
): { width: number; height: number } => {
  if (settings.resizeMode === 'keep') {
    return { width, height }
  }

  if (settings.resizeMode === 'exact') {
    return {
      width: clampInt(settings.targetWidth, 1, 25000),
      height: clampInt(settings.targetHeight, 1, 25000),
    }
  }

  const maxWidth = clampInt(settings.maxWidth, 1, 25000)
  const maxHeight = clampInt(settings.maxHeight, 1, 25000)
  const scale = Math.min(width > 0 ? maxWidth / width : 1, height > 0 ? maxHeight / height : 1, 1)
  return {
    width: clampInt(width * scale, 1, 25000),
    height: clampInt(height * scale, 1, 25000),
  }
}

const normalizeRect = (rect: NormalizedRect): NormalizedRect => {
  const x = clampFloat(rect.x, 0, 0.999999)
  const y = clampFloat(rect.y, 0, 0.999999)
  const width = clampFloat(rect.width, 0.0001, 1 - x)
  const height = clampFloat(rect.height, 0.0001, 1 - y)
  return { x, y, width, height }
}

const getRectFromTemplate = (
  width: number,
  height: number,
  template: NormalizedRect | null,
): PixelRect => {
  if (!template) {
    return { x: 0, y: 0, width, height }
  }

  const x = clampFloat(template.x, 0, 0.999999)
  const y = clampFloat(template.y, 0, 0.999999)
  const w = clampFloat(template.width, 0.0001, 1 - x)
  const h = clampFloat(template.height, 0.0001, 1 - y)

  const px = clampInt(x * width, 0, width - 1)
  const py = clampInt(y * height, 0, height - 1)
  const pw = clampInt(w * width, 1, width - px)
  const ph = clampInt(h * height, 1, height - py)

  return {
    x: px,
    y: py,
    width: pw,
    height: ph,
  }
}

const sanitizeByInsets = (
  imageWidth: number,
  imageHeight: number,
  insetLeft: number,
  insetRight: number,
  insetTop: number,
  insetBottom: number,
): PixelRect => {
  const left = clampInt(insetLeft, 0, imageWidth - 1)
  const right = clampInt(insetRight, 0, imageWidth - 1)
  const top = clampInt(insetTop, 0, imageHeight - 1)
  const bottom = clampInt(insetBottom, 0, imageHeight - 1)

  const rawWidth = imageWidth - left - right
  const rawHeight = imageHeight - top - bottom

  const x = clampInt(left, 0, imageWidth - 1)
  const y = clampInt(top, 0, imageHeight - 1)
  const width = clampInt(rawWidth, 1, imageWidth - x)
  const height = clampInt(rawHeight, 1, imageHeight - y)

  return { x, y, width, height }
}

export const getCropRectPixels = (
  imageWidth: number,
  imageHeight: number,
  settings: NormalizeSettings,
): PixelRect => {
  if (settings.cropMode === 'none') {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight }
  }

  if (settings.cropMode === 'template') {
    return getRectFromTemplate(imageWidth, imageHeight, settings.templateCropNormalized)
  }

  if (settings.cropMode === 'uniform-percent') {
    const pct = clampFloat(settings.cropUniformPercent, 0, 99)
    return sanitizeByInsets(
      imageWidth,
      imageHeight,
      (imageWidth * pct) / 100,
      (imageWidth * pct) / 100,
      (imageHeight * pct) / 100,
      (imageHeight * pct) / 100,
    )
  }

  if (settings.cropMode === 'sides-percent') {
    return sanitizeByInsets(
      imageWidth,
      imageHeight,
      (imageWidth * clampFloat(settings.cropPercentLeft, 0, 99)) / 100,
      (imageWidth * clampFloat(settings.cropPercentRight, 0, 99)) / 100,
      (imageHeight * clampFloat(settings.cropPercentTop, 0, 99)) / 100,
      (imageHeight * clampFloat(settings.cropPercentBottom, 0, 99)) / 100,
    )
  }

  return sanitizeByInsets(
    imageWidth,
    imageHeight,
    clampFloat(settings.cropPixelsLeft, 0, 50000),
    clampFloat(settings.cropPixelsRight, 0, 50000),
    clampFloat(settings.cropPixelsTop, 0, 50000),
    clampFloat(settings.cropPixelsBottom, 0, 50000),
  )
}

export const getCropRectNormalized = (
  imageWidth: number,
  imageHeight: number,
  settings: NormalizeSettings,
): NormalizedRect => {
  const rect = getCropRectPixels(imageWidth, imageHeight, settings)
  const iw = imageWidth || 1
  const ih = imageHeight || 1
  return {
    x: rect.x / iw,
    y: rect.y / ih,
    width: rect.width / iw,
    height: rect.height / ih,
  }
}

const encodeWithWorkerCodec = async (
  canvas: HTMLCanvasElement,
  format: NormalizeFormat,
  quality: number,
): Promise<Blob> => {
  const intermediate = await toBlob(canvas, 'image/png', 1)
  const sourceFile = new File([intermediate], 'normalized-stage.png', { type: 'image/png' })
  const converted = await imageCompression(sourceFile, {
    fileType: format,
    useWebWorker: true,
    alwaysKeepResolution: true,
    initialQuality: quality,
    maxIteration: 9,
    preserveExif: false,
    libURL: WORKER_CODEC_LIB_URL,
  })
  return converted
}

const encodeOutputBlob = async (
  destinationCanvas: HTMLCanvasElement,
  settings: NormalizeSettings,
): Promise<Blob> => {
  const quality = clampInt(settings.quality, 1, 100) / 100
  if (
    settings.codecEngine === 'worker-codec' &&
    (settings.outputFormat === 'image/jpeg' || settings.outputFormat === 'image/webp')
  ) {
    try {
      return await encodeWithWorkerCodec(destinationCanvas, settings.outputFormat, quality)
    } catch (error) {
      console.error('Worker codec failed, fallback to canvas encoder.', error)
    }
  }
  return toBlob(destinationCanvas, settings.outputFormat, quality)
}

export const normalizeSinglePhoto = async (
  photo: PhotoItem,
  settings: NormalizeSettings,
): Promise<NormalizeResult> => {
  const bitmap = await createImageBitmap(photo.blob)
  const srcW = bitmap.width
  const srcH = bitmap.height

  // Use OffscreenCanvas when available for better off-main-thread performance
  const makeCanvas = (w: number, h: number): HTMLCanvasElement | OffscreenCanvas => {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    return c
  }

  let sourceCanvas: HTMLCanvasElement | OffscreenCanvas | null = null
  let destinationCanvas: HTMLCanvasElement | OffscreenCanvas | null = null

  try {
    const sourceCrop = getCropRectPixels(srcW, srcH, settings)
    const target = getTargetSize(sourceCrop.width, sourceCrop.height, settings)

    sourceCanvas = makeCanvas(sourceCrop.width, sourceCrop.height)
    const sourceContext = sourceCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
    if (!sourceContext) throw new Error('2D context unavailable on source canvas')

    sourceContext.drawImage(bitmap, sourceCrop.x, sourceCrop.y, sourceCrop.width, sourceCrop.height, 0, 0, sourceCrop.width, sourceCrop.height)

    // Release bitmap as early as possible to free GPU texture memory
    bitmap.close()

    destinationCanvas = makeCanvas(target.width, target.height)

    // pica requires HTMLCanvasElement — convert OffscreenCanvas if needed
    const toHtml = (c: HTMLCanvasElement | OffscreenCanvas): HTMLCanvasElement => {
      if (c instanceof HTMLCanvasElement) return c
      const h = document.createElement('canvas')
      h.width = c.width; h.height = c.height
      const ctx = h.getContext('2d')!
      ctx.drawImage(c as OffscreenCanvas, 0, 0)
      return h
    }

    const srcHtml = toHtml(sourceCanvas)
    const dstHtml = toHtml(destinationCanvas)

    await pica.resize(srcHtml, dstHtml, {
      unsharpAmount: 80,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    })

    const outputBlob = await encodeOutputBlob(dstHtml, settings)

    return {
      photoId: photo.id,
      outputName: createOutputName(photo.name, settings.outputFormat),
      outputMimeType: settings.outputFormat,
      blob: outputBlob,
      beforeWidth: srcW,
      beforeHeight: srcH,
      afterWidth: target.width,
      afterHeight: target.height,
      beforeBytes: photo.blob.size,
      afterBytes: outputBlob.size,
    }
  } finally {
    // Ensure bitmap is always freed even on error paths before the early close above
    try { bitmap.close() } catch { /* already closed */ }
    // Null references to allow GC of large canvas pixel data
    sourceCanvas = null
    destinationCanvas = null
  }
}

const borderColorFromCorners = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { r: number; g: number; b: number } => {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width * 0.1), Math.floor(height * 0.1)],
    [Math.floor(width * 0.9), Math.floor(height * 0.1)],
    [Math.floor(width * 0.1), Math.floor(height * 0.9)],
    [Math.floor(width * 0.9), Math.floor(height * 0.9)],
  ]
  let r = 0
  let g = 0
  let b = 0
  points.forEach(([x, y]) => {
    const idx = (y * width + x) * 4
    r += data[idx]
    g += data[idx + 1]
    b += data[idx + 2]
  })
  return {
    r: r / points.length,
    g: g / points.length,
    b: b / points.length,
  }
}

const colorDistance = (
  r: number,
  g: number,
  b: number,
  target: { r: number; g: number; b: number },
) => Math.sqrt((r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2)

const scanInset = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  edge: 'top' | 'bottom' | 'left' | 'right',
  borderColor: { r: number; g: number; b: number },
): number => {
  const maxInset = Math.max(8, Math.floor((edge === 'top' || edge === 'bottom' ? height : width) * 0.25))
  const sampleSteps = 80
  const threshold = 26

  for (let inset = 0; inset < maxInset; inset += 1) {
    let exceed = 0
    for (let s = 0; s < sampleSteps; s += 1) {
      const ratio = s / (sampleSteps - 1)
      let x = 0
      let y = 0
      if (edge === 'top') {
        x = Math.floor(ratio * (width - 1))
        y = inset
      } else if (edge === 'bottom') {
        x = Math.floor(ratio * (width - 1))
        y = height - 1 - inset
      } else if (edge === 'left') {
        x = inset
        y = Math.floor(ratio * (height - 1))
      } else {
        x = width - 1 - inset
        y = Math.floor(ratio * (height - 1))
      }
      const idx = (y * width + x) * 4
      const dist = colorDistance(data[idx], data[idx + 1], data[idx + 2], borderColor)
      if (dist > threshold) {
        exceed += 1
      }
    }
    if (exceed / sampleSteps > 0.2) {
      return inset
    }
  }
  return 0
}

export const detectFrameCropFromBlob = async (blob: Blob): Promise<NormalizedRect | null> => {
  const bitmap = await createImageBitmap(blob)
  try {
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height))
    const width = clampInt(bitmap.width * scale, 16, 1400)
    const height = clampInt(bitmap.height * scale, 16, 1400)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) {
      return null
    }
    context.drawImage(bitmap, 0, 0, width, height)
    const imageData = context.getImageData(0, 0, width, height)
    const borderColor = borderColorFromCorners(imageData.data, width, height)

    const top = scanInset(imageData.data, width, height, 'top', borderColor)
    const bottom = scanInset(imageData.data, width, height, 'bottom', borderColor)
    const left = scanInset(imageData.data, width, height, 'left', borderColor)
    const right = scanInset(imageData.data, width, height, 'right', borderColor)

    const croppedWidth = width - left - right
    const croppedHeight = height - top - bottom
    if (croppedWidth < width * 0.5 || croppedHeight < height * 0.5) {
      return null
    }
    if (top + bottom + left + right < 8) {
      return null
    }

    return normalizeRect({
      x: left / width,
      y: top / height,
      width: croppedWidth / width,
      height: croppedHeight / height,
    })
  } finally {
    bitmap.close()
  }
}

export const suggestContentAwareCropFromBlob = async (
  blob: Blob,
  settings: NormalizeSettings,
): Promise<NormalizedRect | null> => {
  const bitmap = await createImageBitmap(blob)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) {
      return null
    }
    context.drawImage(bitmap, 0, 0)

    let aspectRatio = settings.contentAwareAspectWidth / Math.max(1, settings.contentAwareAspectHeight)
    if (settings.resizeMode === 'exact') {
      aspectRatio = settings.targetWidth / Math.max(1, settings.targetHeight)
    }
    aspectRatio = clampFloat(aspectRatio, 0.2, 5)

    const fittedWidth = Math.min(bitmap.width, bitmap.height * aspectRatio)
    const fittedHeight = fittedWidth / aspectRatio
    const scale = clampFloat(settings.contentAwareScalePercent, 20, 100) / 100
    const requestWidth = clampInt(fittedWidth * scale, 1, bitmap.width)
    const requestHeight = clampInt(fittedHeight * scale, 1, bitmap.height)

    const result = await smartcrop.crop(canvas, {
      width: requestWidth,
      height: requestHeight,
      ruleOfThirds: true,
      boost: [
        {
          x: Math.floor(bitmap.width * 0.25),
          y: Math.floor(bitmap.height * 0.25),
          width: Math.floor(bitmap.width * 0.5),
          height: Math.floor(bitmap.height * 0.5),
          weight: 0.35,
        },
      ],
    })

    if (!result.topCrop) {
      return null
    }

    return normalizeRect({
      x: result.topCrop.x / bitmap.width,
      y: result.topCrop.y / bitmap.height,
      width: result.topCrop.width / bitmap.width,
      height: result.topCrop.height / bitmap.height,
    })
  } finally {
    bitmap.close()
  }
}

export const formatMimeLabel = (format: NormalizeFormat) => {
  if (format === 'image/jpeg') {
    return 'JPG'
  }
  if (format === 'image/png') {
    return 'PNG'
  }
  return 'WebP'
}
