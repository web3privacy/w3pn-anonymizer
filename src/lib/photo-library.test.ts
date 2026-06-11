import { describe, it, expect } from 'vitest'
import {
  validateRecordsForAdd,
  recordsToPhotoItems,
  originalsFromPhotoItems,
  resolveNextActiveAfterDelete,
  photosNeedingSave,
  selectLibraryExportImages,
  selectLibraryExportItems,
  buildAnonymizedExportName,
  buildMediaExportName,
  libraryItemKind,
  isRasterImageFormat,
  type InputRecord,
} from './photo-library'
import { isMediaFile, MAX_TOTAL_PHOTOS } from './media-files'
import type { PhotoItem } from '../types'

const file = (name: string, type: string, size: number): File => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

const record = (name: string, type = 'image/jpeg', size = 1000): InputRecord => ({
  file: file(name, type, size),
  name,
  source: 'upload',
})

const photo = (id: string, overrides: Partial<PhotoItem> = {}): PhotoItem => ({
  id,
  name: `${id}.jpg`,
  mimeType: 'image/jpeg',
  blob: new Blob(),
  previewUrl: `blob:${id}`,
  source: 'upload',
  edited: false,
  ...overrides,
})

describe('validateRecordsForAdd', () => {
  it('rejects when no records pass media validation', () => {
    const result = validateRecordsForAdd([record('a.exe', '', 100)], 0)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('No supported media')
  })

  it('rejects when library is at capacity', () => {
    const result = validateRecordsForAdd([record('a.jpg')], MAX_TOTAL_PHOTOS)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain(String(MAX_TOTAL_PHOTOS))
  })

  it('caps incoming records to remaining capacity', () => {
    const records = [record('a.jpg'), record('b.jpg'), record('c.jpg')]
    const result = validateRecordsForAdd(records, MAX_TOTAL_PHOTOS - 2)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.records).toHaveLength(2)
      expect(result.notice).toContain('2')
    }
  })

  it('accepts all valid records when under the limit', () => {
    const records = [record('a.jpg'), record('b.png', 'image/png')]
    const result = validateRecordsForAdd(records, 0)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.records).toHaveLength(2)
      expect(result.notice).toBeUndefined()
    }
  })

  it('uses isMediaFile for validation', () => {
    const valid = record('photo.heic', '', 500)
    expect(isMediaFile(valid.file)).toBe(true)
    const result = validateRecordsForAdd([valid], 0)
    expect(result.ok).toBe(true)
  })
})

describe('recordsToPhotoItems', () => {
  it('assigns ids and preview urls from factories', () => {
    let n = 0
    const items = recordsToPhotoItems(
      [record('folder/a.jpg'), record('clip.mp4', 'video/mp4', 5000)],
      () => `id-${++n}`,
      (f) => `preview://${f.name}`,
    )
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('id-1')
    expect(items[0].previewUrl).toBe('preview://folder/a.jpg')
    expect(items[0].isVideo).toBe(false)
    expect(items[1].isVideo).toBe(true)
    expect(items[1].mimeType).toBe('video/mp4')
  })
})

describe('originalsFromPhotoItems', () => {
  it('maps each photo id to its blob', () => {
    const items = [photo('a'), photo('b')]
    expect(originalsFromPhotoItems(items)).toEqual({ a: items[0].blob, b: items[1].blob })
  })
})

describe('resolveNextActiveAfterDelete', () => {
  const library = [photo('a'), photo('b'), photo('c')]

  it('returns null when deleting a non-active photo', () => {
    expect(resolveNextActiveAfterDelete(library, 'b', 'a')).toBeNull()
  })

  it('prefers the next photo, then the previous', () => {
    expect(resolveNextActiveAfterDelete(library, 'b', 'b')?.id).toBe('c')
    expect(resolveNextActiveAfterDelete(library, 'c', 'c')?.id).toBe('b')
    expect(resolveNextActiveAfterDelete(library, 'a', 'a')?.id).toBe('b')
  })
})

describe('photosNeedingSave', () => {
  it('includes edited photos and dirty entries', () => {
    const library = [
      photo('a', { edited: true }),
      photo('b'),
      photo('c'),
    ]
    const dirty = { c: true }
    expect(photosNeedingSave(library, dirty).map((p) => p.id)).toEqual(['a', 'c'])
  })
})

describe('selectLibraryExportImages', () => {
  const library = [
    photo('img', { isVideo: false }),
    photo('vid', { isVideo: true }),
    photo('img2', { isVideo: false }),
  ]

  it('filters videos from the full library', () => {
    const { images, skippedVideos } = selectLibraryExportImages(library)
    expect(images.map((p) => p.id)).toEqual(['img', 'img2'])
    expect(skippedVideos).toBe(1)
  })

  it('respects an optional id filter', () => {
    const { images, skippedVideos } = selectLibraryExportImages(library, ['img', 'vid'])
    expect(images.map((p) => p.id)).toEqual(['img'])
    expect(skippedVideos).toBe(1)
  })
})

describe('selectLibraryExportItems', () => {
  const library = [
    photo('img', { name: 'a.jpg' }),
    photo('vid', { name: 'b.mp4', isVideo: true }),
    photo('aud', { name: 'c.wav', isAudio: true }),
    photo('doc', { name: 'd.pdf', isDocument: true, documentKind: 'pdf' }),
  ]

  it('keeps every media type and counts kinds', () => {
    const { items, counts } = selectLibraryExportItems(library)
    expect(items.map((p) => p.id)).toEqual(['img', 'vid', 'aud', 'doc'])
    expect(counts).toEqual({ image: 1, video: 1, audio: 1, document: 1 })
  })

  it('respects an optional id filter', () => {
    const { items, counts } = selectLibraryExportItems(library, ['vid', 'doc'])
    expect(items.map((p) => p.id)).toEqual(['vid', 'doc'])
    expect(counts).toEqual({ image: 0, video: 1, audio: 0, document: 1 })
  })
})

describe('libraryItemKind', () => {
  it('classifies each media type', () => {
    expect(libraryItemKind(photo('a'))).toBe('image')
    expect(libraryItemKind(photo('b', { isVideo: true }))).toBe('video')
    expect(libraryItemKind(photo('c', { isAudio: true }))).toBe('audio')
    expect(libraryItemKind(photo('d', { isDocument: true }))).toBe('document')
  })
})

describe('buildMediaExportName', () => {
  it('preserves extension and tags anonymized outputs', () => {
    expect(buildMediaExportName(photo('v', { name: 'clip.mp4', isVideo: true, edited: true }))).toBe('clip-anon.mp4')
  })
  it('omits the -anon suffix for untouched items and strips the path', () => {
    expect(buildMediaExportName(photo('a', { name: 'folder/talk.wav', isAudio: true }))).toBe('talk.wav')
  })
  it('falls back to the mime type when the name has no extension', () => {
    expect(buildMediaExportName(photo('v', { name: 'clip', isVideo: true, blob: new Blob([], { type: 'video/webm' }) }))).toBe('clip.webm')
  })
})

describe('buildAnonymizedExportName', () => {
  it('strips path and extension then adds -anon suffix', () => {
    expect(buildAnonymizedExportName('folder/photo.jpg', 'image/png')).toBe('photo-anon.png')
  })
})

describe('isRasterImageFormat', () => {
  it('recognizes supported raster formats', () => {
    expect(isRasterImageFormat('image/jpeg')).toBe(true)
    expect(isRasterImageFormat('video/mp4')).toBe(false)
  })
})
