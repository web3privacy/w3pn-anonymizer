/**
 * Pure file/media classification + naming helpers. Extracted from App.tsx so
 * the size/type/extension rules are isolated and unit-testable.
 */

export const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'heif',
])
export const VIDEO_EXTENSIONS_SET = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogv'])
export const AUDIO_EXTENSIONS_SET = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'webm'])
// DOCX is intentionally excluded: it cannot be parsed as plain text (it is a
// ZIP archive), so accepting it would show garbage and risk leaking unredacted
// PII on export. Real DOCX support (mammoth) is tracked in the roadmap.
export const DOCUMENT_EXTENSIONS_SET = new Set(['pdf', 'txt', 'md', 'markdown'])

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB per image
export const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024 // 500 MB per video
export const MAX_AUDIO_FILE_SIZE = 100 * 1024 * 1024 // 100 MB per audio
export const MAX_DOCUMENT_FILE_SIZE = 100 * 1024 * 1024 // 100 MB per document
export const MAX_TOTAL_PHOTOS = 2000

export const isAudioFileCheck = (f: File) => {
  if (f.type?.startsWith('audio/')) return true
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  return AUDIO_EXTENSIONS_SET.has(ext)
}

const DOCUMENT_MIME = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
])

export const isDocumentFileCheck = (f: File) => {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (DOCUMENT_EXTENSIONS_SET.has(ext)) return true
  return DOCUMENT_MIME.has(f.type) || f.type === 'text/plain'
}

export const isMediaFile = (f: File) => {
  if (f.size === 0) return false
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (f.type?.startsWith('video/') || VIDEO_EXTENSIONS_SET.has(ext)) {
    return f.size <= MAX_VIDEO_FILE_SIZE
  }
  if (DOCUMENT_EXTENSIONS_SET.has(ext) || DOCUMENT_MIME.has(f.type)) {
    return f.size <= MAX_DOCUMENT_FILE_SIZE
  }
  if (f.type?.startsWith('audio/') || AUDIO_EXTENSIONS_SET.has(ext)) {
    return f.size <= MAX_AUDIO_FILE_SIZE
  }
  if (f.size > MAX_FILE_SIZE) return false
  if (f.type && f.type.startsWith('image/')) return true
  return IMAGE_EXTENSIONS.has(ext)
}

export const isVideoFileCheck = (f: File) => {
  // An explicit audio MIME wins over the ambiguous container extensions (e.g.
  // `audio/webm`) so audio-only WebM/OGG never lands in the video pipeline.
  if (f.type?.startsWith('audio/')) return false
  if (f.type?.startsWith('video/')) return true
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  return VIDEO_EXTENSIONS_SET.has(ext)
}

export const fmtBytes = (b: number) => {
  if (b < 1024 * 100) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

/** Build a unique, slash-stripped filename for a zip entry, given prior names. */
export const makeZipSafeName = (name: string, existing: Map<string, number>) => {
  const cleaned = name.replace(/^\/+/, '')
  const seen = existing.get(cleaned) ?? 0
  if (seen === 0) { existing.set(cleaned, 1); return cleaned }
  const dot = cleaned.lastIndexOf('.')
  const base = dot === -1 ? cleaned : cleaned.slice(0, dot)
  const ext = dot === -1 ? '' : cleaned.slice(dot)
  const next = `${base}-${seen + 1}${ext}`
  existing.set(cleaned, seen + 1)
  return next
}
