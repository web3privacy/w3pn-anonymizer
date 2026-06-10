import { describe, it, expect } from 'vitest'
import {
  validateRecordsForAdd,
  recordsToPhotoItems,
  originalsFromPhotoItems,
  resolveNextActiveAfterDelete,
  photosNeedingSave,
  selectLibraryExportImages,
  buildAnonymizedExportName,
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
    const result = validateRecordsForAdd([record('a.txt', '', 100)], 0)
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
