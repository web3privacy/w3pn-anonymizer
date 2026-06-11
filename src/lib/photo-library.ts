import { FORMAT_EXT } from './image-encoders'
import { isMediaFile, isVideoFileCheck, isAudioFileCheck, isDocumentFileCheck, MAX_TOTAL_PHOTOS } from './media-files'
import type { NormalizeFormat, PhotoItem } from '../types'

export type InputRecord = {
  file: File
  name: string
  source: PhotoItem['source']
  handle?: FileSystemFileHandle
}

export type ValidateRecordsResult =
  | { ok: false; message: string }
  | { ok: true; records: InputRecord[]; notice?: string }

const RASTER_IMAGE_FORMATS = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff',
])

/** Filter and cap incoming library records against the max photo limit. */
export function validateRecordsForAdd(
  records: InputRecord[],
  currentCount: number,
  maxPhotos = MAX_TOTAL_PHOTOS,
): ValidateRecordsResult {
  const valid = records.filter((r) => isMediaFile(r.file))
  if (valid.length === 0) {
    return { ok: false, message: 'No supported media found (check file types and size limits).' }
  }
  const remaining = Math.max(0, maxPhotos - currentCount)
  if (remaining === 0) {
    return { ok: false, message: `Maximum ${maxPhotos} photos reached.` }
  }
  if (valid.length > remaining) {
    valid.length = remaining
    return {
      ok: true,
      records: valid,
      notice: `Added ${remaining} media files (max ${maxPhotos}).`,
    }
  }
  return { ok: true, records: valid }
}

/** Map validated input records into new library photo items. */
export function recordsToPhotoItems(
  records: InputRecord[],
  idFactory: () => string,
  createPreviewUrl: (file: File) => string,
): PhotoItem[] {
  return records.map((r) => {
    const isVideo = isVideoFileCheck(r.file)
    const isDocument = !isVideo && isDocumentFileCheck(r.file)
    const isAudio = !isVideo && !isDocument && isAudioFileCheck(r.file)
    const ext = r.name.split('.').pop()?.toLowerCase() ?? ''
    const documentKind: PhotoItem['documentKind'] | undefined = isDocument
      ? (ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : (ext === 'md' || ext === 'markdown') ? 'md' : 'txt')
      : undefined
    return {
      id: idFactory(),
      name: r.name,
      mimeType: r.file.type || (isVideo ? 'video/mp4' : isAudio ? 'audio/wav' : isDocument ? (documentKind === 'pdf' ? 'application/pdf' : 'text/plain') : 'image/jpeg'),
      blob: r.file,
      previewUrl: createPreviewUrl(r.file),
      source: r.source,
      edited: false,
      fileHandle: r.handle,
      isVideo,
      isAudio,
      isDocument,
      documentKind,
    }
  })
}

/** Build the original-blob backup map for newly added photos. */
export function originalsFromPhotoItems(items: PhotoItem[]): Record<string, Blob> {
  const originals: Record<string, Blob> = {}
  for (const p of items) originals[p.id] = p.blob
  return originals
}

/** When deleting the active photo, pick the next library item to focus. */
export function resolveNextActiveAfterDelete(
  photos: PhotoItem[],
  deletingPhotoId: string,
  activePhotoId: string | null,
): PhotoItem | null {
  if (activePhotoId !== deletingPhotoId) return null
  const deletedIndex = photos.findIndex((p) => p.id === deletingPhotoId)
  if (deletedIndex < 0) return null
  return photos[deletedIndex + 1] ?? photos[deletedIndex - 1] ?? null
}

/** Photos that have unsaved edits (explicit flag or dirty canvas). */
export function photosNeedingSave(
  photos: PhotoItem[],
  dirtyByPhoto: Record<string, boolean>,
): PhotoItem[] {
  return photos.filter((p) => p.edited || dirtyByPhoto[p.id])
}

/** Non-video library items eligible for batch export (optional id filter). */
export function selectLibraryExportImages(
  photos: PhotoItem[],
  photoIds?: string[],
): { images: PhotoItem[]; skippedVideos: number } {
  const selectedIds = photoIds ? new Set(photoIds) : null
  const sourcePhotos = selectedIds ? photos.filter((p) => selectedIds.has(p.id)) : photos
  const images = sourcePhotos.filter((p) => !p.isVideo && !p.isDocument && !p.isAudio)
  return { images, skippedVideos: sourcePhotos.length - images.length }
}

export type LibraryMediaKind = 'image' | 'video' | 'audio' | 'document'

export function libraryItemKind(p: PhotoItem): LibraryMediaKind {
  if (p.isVideo) return 'video'
  if (p.isDocument) return 'document'
  if (p.isAudio) return 'audio'
  return 'image'
}

/**
 * Select all library items for a full export (optional id filter), keeping every
 * media type. Images are re-baked from zones on export; videos/audio/documents
 * are exported using their current (already-anonymized when processed) blob.
 */
export function selectLibraryExportItems(
  photos: PhotoItem[],
  photoIds?: string[],
): { items: PhotoItem[]; counts: Record<LibraryMediaKind, number> } {
  const selectedIds = photoIds ? new Set(photoIds) : null
  const items = selectedIds ? photos.filter((p) => selectedIds.has(p.id)) : [...photos]
  const counts: Record<LibraryMediaKind, number> = { image: 0, video: 0, audio: 0, document: 0 }
  for (const p of items) counts[libraryItemKind(p)] += 1
  return { items, counts }
}

/** Extension for a non-image media item, inferred from its name or mime type. */
function mediaExtension(p: PhotoItem): string {
  const fromName = p.name.split('/').pop()?.split('.').pop()?.toLowerCase()
  if (fromName && fromName !== p.name.toLowerCase() && fromName.length <= 5) return fromName
  const mime = p.blob.type || p.mimeType || ''
  if (mime.includes('webm')) return 'webm'
  if (mime.includes('mp4')) return 'mp4'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('pdf')) return 'pdf'
  if (mime.startsWith('video/')) return 'mp4'
  if (mime.startsWith('audio/')) return 'wav'
  return 'bin'
}

/**
 * Export filename for a non-image library item, preserving its extension and
 * tagging anonymized outputs with `-anon`.
 */
export function buildMediaExportName(p: PhotoItem): string {
  const base = (p.name.split('/').pop() ?? p.name).replace(/\.[^.]+$/, '')
  const ext = mediaExtension(p)
  return `${base}${p.edited ? '-anon' : ''}.${ext}`
}

/** Derive an anonymized export filename from the source name and target format. */
export function buildAnonymizedExportName(photoName: string, format: NormalizeFormat): string {
  const baseName = photoName.split('/').pop() ?? photoName
  const ext = FORMAT_EXT[format] ?? 'png'
  return baseName.replace(/\.[^.]+$/, '') + `-anon.${ext}`
}

export function isRasterImageFormat(fmt: string): fmt is NormalizeFormat {
  return RASTER_IMAGE_FORMATS.has(fmt)
}
