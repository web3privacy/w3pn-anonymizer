import { extensionForMime } from '../lib/native-media-library'

export interface LiveCaptureEntry {
  id: string
  type: 'photo' | 'video'
  blob: Blob
  timestamp: number
  filename: string
}

/**
 * Records lightweight metadata about the most recent live capture in
 * sessionStorage so a reload can tell a capture happened this session.
 * The actual blob is delivered to the library via the capture callback.
 */
export function saveLiveCapture(blob: Blob, type: 'photo' | 'video'): LiveCaptureEntry {
  const ext = extensionForMime(blob.type, type)
  const filename = `live-capture-${Date.now()}.${ext}`
  const entry: LiveCaptureEntry = {
    id: `live-${Date.now()}`,
    type,
    blob,
    timestamp: Date.now(),
    filename,
  }
  try {
    sessionStorage.setItem('anonymizer-live-meta', JSON.stringify({
      id: entry.id,
      type: entry.type,
      timestamp: entry.timestamp,
      filename: entry.filename,
    }))
  } catch {
    /* sessionStorage full or unavailable */
  }
  return entry
}
