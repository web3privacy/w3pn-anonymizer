import { Capacitor, registerPlugin } from '@capacitor/core'

export type NativeMediaType = 'photo' | 'video'

interface NativeMediaLibraryPlugin {
  saveMedia(options: {
    data: string
    fileName: string
    mimeType: string
    mediaType: NativeMediaType
  }): Promise<{ uri?: string }>
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
  const data = await blobToBase64(blob)
  await NativeMediaLibrary.saveMedia({ data, fileName: safeName, mimeType, mediaType })
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
    ?.replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `w3pn-capture.${fallbackExt}`
  return /\.[a-z0-9]{2,5}$/i.test(base) ? base : `${base}.${fallbackExt}`
}
