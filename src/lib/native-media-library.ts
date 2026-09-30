import { Capacitor, registerPlugin } from '@capacitor/core'
import { retainVideoFile } from './video-storage'

export type NativeMediaType = 'photo' | 'video'

interface NativeMediaLibraryPlugin {
  beginExport(options: { fileName: string; mimeType: string; mediaType: string }): Promise<{ id: string }>
  appendExport(options: { id: string; data: string }): Promise<void>
  finishExport(options: { id: string }): Promise<{ uri?: string }>
  cancelExport(options: { id: string }): Promise<void>
}

const NativeMediaLibrary = registerPlugin<NativeMediaLibraryPlugin>('NativeMediaLibrary')

const FALLBACK_MIME: Record<NativeMediaType, string> = {
  photo: 'image/jpeg',
  video: 'video/mp4',
}

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

export function isNativePlatform(): boolean {
  return Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android'
}

export function extensionForMime(mimeType: string, mediaType: NativeMediaType): string {
  const cleanMime = mimeType.split(';')[0]?.trim().toLowerCase()
  if (cleanMime && EXTENSION_BY_MIME[cleanMime]) return EXTENSION_BY_MIME[cleanMime]
  return mediaType === 'photo' ? 'jpg' : 'mp4'
}

export function buildNativeCaptureName(mediaType: NativeMediaType, mimeType: string): string {
  return `w3pn-capture-${new Date().toISOString().replace(/[:.]/g, '-')}.${extensionForMime(mimeType, mediaType)}`
}

export async function saveBlobToNativeMediaLibrary(
  blob: Blob,
  fileName: string,
  mediaType: NativeMediaType,
): Promise<boolean> {
  if (!isNativePlatform()) return false
  const mimeType = blob.type || FALLBACK_MIME[mediaType]
  const safeName = sanitizeFileName(fileName, extensionForMime(mimeType, mediaType))
  await writeNativeExport(blob, safeName, mimeType, mediaType)
  return true
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read media blob.'))
    reader.onload = () => {
      const value = String(reader.result ?? '')
      resolve(value.includes(',') ? value.slice(value.indexOf(',') + 1) : value)
    }
    reader.readAsDataURL(blob)
  })
}

function sanitizeFileName(fileName: string, fallbackExt: string): string {
  const base = fileName
    .split('/')
    .pop()
    ?.replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `w3pn-capture.${fallbackExt}`
  return /\.[a-z0-9]{2,5}$/i.test(base) ? base : `${base}.${fallbackExt}`
}

/** One bounded bridge message at a time; the native side owns a temporary file. */
async function writeNativeExport(blob: Blob, fileName: string, mimeType: string, mediaType: string): Promise<void> {
  const release = retainVideoFile(blob)
  try {
    const { id } = await NativeMediaLibrary.beginExport({ fileName, mimeType, mediaType })
    try {
      for (let offset = 0; offset < blob.size; offset += 256 * 1024) {
        const data = await blobToBase64(blob.slice(offset, offset + 256 * 1024))
        await NativeMediaLibrary.appendExport({ id, data })
      }
      await NativeMediaLibrary.finishExport({ id })
    } finally {
      await NativeMediaLibrary.cancelExport({ id }).catch(() => undefined)
    }
  } finally { await release?.() }
}

/** Export all media kinds through the OS share/save sheet on native platforms. */
export async function exportBlob(blob: Blob, fileName: string): Promise<void> {
  if (isNativePlatform()) {
    await writeNativeExport(blob, sanitizeFileName(fileName, 'bin'), blob.type || 'application/octet-stream', 'file')
  } else {
    const release = retainVideoFile(blob)
    try {
      const { saveAs } = await import('file-saver')
      saveAs(blob, fileName)
      // Match FileSaver's object URL lifetime while the browser accepts the download.
      if (release) setTimeout(() => { void release().catch((error) => console.warn('Temporary video cleanup failed:', error)) }, 40_000)
    } catch (error) { await release?.(); throw error }
  }
}
