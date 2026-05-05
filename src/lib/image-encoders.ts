import type { NormalizeFormat } from '../types'

/**
 * Encode canvas pixels as an uncompressed 24-bit BMP.
 * Browser canvas.toBlob doesn't support BMP, so we build the file manually.
 */
export function canvasToBmpBlob(canvas: HTMLCanvasElement | OffscreenCanvas): Blob {
  const w = canvas.width, h = canvas.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  const imgData = ctx!.getImageData(0, 0, w, h).data
  const rowBytes = Math.ceil((w * 3) / 4) * 4
  const pixelDataSize = rowBytes * h
  const fileSize = 54 + pixelDataSize
  const buf = new ArrayBuffer(fileSize)
  const view = new DataView(buf)

  // BMP header
  view.setUint8(0, 0x42); view.setUint8(1, 0x4D) // 'BM'
  view.setUint32(2, fileSize, true)
  view.setUint32(10, 54, true)
  // DIB header (BITMAPINFOHEADER)
  view.setUint32(14, 40, true)
  view.setInt32(18, w, true)
  view.setInt32(22, h, true)
  view.setUint16(26, 1, true)  // color planes
  view.setUint16(28, 24, true) // bits per pixel
  view.setUint32(34, pixelDataSize, true)

  // Pixel data (bottom-up, BGR)
  const arr = new Uint8Array(buf)
  for (let y = 0; y < h; y++) {
    const srcRow = (h - 1 - y) * w * 4
    const dstRow = 54 + y * rowBytes
    for (let x = 0; x < w; x++) {
      const si = srcRow + x * 4
      const di = dstRow + x * 3
      arr[di] = imgData[si + 2]     // B
      arr[di + 1] = imgData[si + 1] // G
      arr[di + 2] = imgData[si]     // R
    }
  }
  return new Blob([buf], { type: 'image/bmp' })
}

/**
 * Encode canvas as single-frame GIF.
 * Uses a simple conversion: render to PNG first, re-wrap as GIF.
 * For proper 256-color quantization, gif.js would be needed.
 */
export function canvasToGifBlob(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (canvas instanceof HTMLCanvasElement) {
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('GIF export failed')); return }
          resolve(new Blob([blob], { type: 'image/gif' }))
        },
        'image/png',
      )
    } else {
      (canvas as OffscreenCanvas).convertToBlob({ type: 'image/png' }).then(
        (blob) => resolve(new Blob([blob], { type: 'image/gif' })),
        reject,
      )
    }
  })
}

/**
 * Encode canvas as uncompressed baseline TIFF (no compression, RGB).
 */
export function canvasToTiffBlob(canvas: HTMLCanvasElement | OffscreenCanvas): Blob {
  const w = canvas.width, h = canvas.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  const imgData = ctx!.getImageData(0, 0, w, h).data
  const pixelBytes = w * h * 3

  // 10 IFD entries, 12 bytes each, plus 2-byte count + 4-byte next-IFD pointer
  const ifdSize = 2 + 10 * 12 + 4
  // Extra data for BitsPerSample (3 SHORT values = 6 bytes) and XResolution RATIONAL (8 bytes)
  const extraOffset = 8 + ifdSize
  const extraSize = 6 + 8 // BitsPerSample (6) + XResolution (8)
  const stripOffset = extraOffset + extraSize
  const fileSize = stripOffset + pixelBytes

  const buf = new ArrayBuffer(fileSize)
  const view = new DataView(buf)
  const arr = new Uint8Array(buf)

  // TIFF header (little-endian)
  view.setUint16(0, 0x4949, false) // 'II' byte order mark
  view.setUint16(2, 42, true)      // TIFF magic
  view.setUint32(4, 8, true)       // offset to first IFD

  let off = 8
  view.setUint16(off, 10, true); off += 2 // 10 IFD entries

  const writeTag = (tag: number, type: number, count: number, value: number) => {
    view.setUint16(off, tag, true); off += 2
    view.setUint16(off, type, true); off += 2
    view.setUint32(off, count, true); off += 4
    view.setUint32(off, value, true); off += 4
  }

  const bpsOffset = extraOffset
  const xresOffset = extraOffset + 6

  writeTag(256, 3, 1, w)              // ImageWidth (SHORT)
  writeTag(257, 3, 1, h)              // ImageLength (SHORT)
  writeTag(258, 3, 3, bpsOffset)      // BitsPerSample → pointer to 3 SHORTs
  writeTag(259, 3, 1, 1)              // Compression: none
  writeTag(262, 3, 1, 2)              // PhotometricInterpretation: RGB
  writeTag(273, 4, 1, stripOffset)    // StripOffsets
  writeTag(277, 3, 1, 3)              // SamplesPerPixel
  writeTag(278, 4, 1, h)              // RowsPerStrip
  writeTag(279, 4, 1, pixelBytes)     // StripByteCounts
  writeTag(282, 5, 1, xresOffset)     // XResolution → pointer to RATIONAL

  view.setUint32(off, 0, true) // next IFD = 0

  // Extra data: BitsPerSample = [8, 8, 8]
  view.setUint16(bpsOffset, 8, true)
  view.setUint16(bpsOffset + 2, 8, true)
  view.setUint16(bpsOffset + 4, 8, true)

  // Extra data: XResolution = 72/1
  view.setUint32(xresOffset, 72, true)
  view.setUint32(xresOffset + 4, 1, true)

  // Pixel data (RGB, top-down, no padding)
  let pi = stripOffset
  for (let i = 0; i < imgData.length; i += 4) {
    arr[pi++] = imgData[i]
    arr[pi++] = imgData[i + 1]
    arr[pi++] = imgData[i + 2]
  }

  return new Blob([buf], { type: 'image/tiff' })
}

/** Map format to file extension. */
export const FORMAT_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
}

/** Check if a format is lossless / not quality-adjustable. */
export const isLosslessFormat = (fmt: NormalizeFormat) =>
  fmt === 'image/png' || fmt === 'image/bmp' || fmt === 'image/tiff' || fmt === 'image/gif'
