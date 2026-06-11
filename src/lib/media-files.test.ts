import { describe, it, expect } from 'vitest'
import {
  isMediaFile,
  isVideoFileCheck,
  fmtBytes,
  makeZipSafeName,
  MAX_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE,
} from './media-files'

const file = (name: string, type: string, size: number): File => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('isMediaFile', () => {
  it('rejects empty files', () => {
    expect(isMediaFile(file('a.jpg', 'image/jpeg', 0))).toBe(false)
  })
  it('accepts images within the size limit', () => {
    expect(isMediaFile(file('a.jpg', 'image/jpeg', 1000))).toBe(true)
    expect(isMediaFile(file('a.heic', '', 1000))).toBe(true)
  })
  it('rejects images above MAX_FILE_SIZE', () => {
    expect(isMediaFile(file('a.png', 'image/png', MAX_FILE_SIZE + 1))).toBe(false)
  })
  it('accepts videos up to MAX_VIDEO_FILE_SIZE', () => {
    expect(isMediaFile(file('a.mp4', 'video/mp4', MAX_VIDEO_FILE_SIZE))).toBe(true)
    expect(isMediaFile(file('a.mp4', 'video/mp4', MAX_VIDEO_FILE_SIZE + 1))).toBe(false)
  })
  it('rejects unknown extensions', () => {
    expect(isMediaFile(file('a.exe', '', 1000))).toBe(false)
  })
})

describe('isVideoFileCheck', () => {
  it('detects by mime type and extension', () => {
    expect(isVideoFileCheck(file('a.webm', '', 1))).toBe(true)
    expect(isVideoFileCheck(file('a', 'video/mp4', 1))).toBe(true)
    expect(isVideoFileCheck(file('a.jpg', 'image/jpeg', 1))).toBe(false)
  })
  it('treats an explicit audio mime as not-video even for .webm', () => {
    // audio/webm must not be misrouted into the video pipeline.
    expect(isVideoFileCheck(file('a.webm', 'audio/webm', 1))).toBe(false)
    expect(isVideoFileCheck(file('a.ogg', 'audio/ogg', 1))).toBe(false)
  })
})

describe('fmtBytes', () => {
  it('uses KB below 100KB and MB above', () => {
    expect(fmtBytes(2048)).toBe('2 KB')
    expect(fmtBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})

describe('makeZipSafeName', () => {
  it('strips leading slashes and dedupes with numeric suffixes before the extension', () => {
    const seen = new Map<string, number>()
    expect(makeZipSafeName('/a/b.png', seen)).toBe('a/b.png')
    expect(makeZipSafeName('photo.jpg', seen)).toBe('photo.jpg')
    expect(makeZipSafeName('photo.jpg', seen)).toBe('photo-2.jpg')
    expect(makeZipSafeName('photo.jpg', seen)).toBe('photo-3.jpg')
  })
  it('handles names without extensions', () => {
    const seen = new Map<string, number>()
    expect(makeZipSafeName('README', seen)).toBe('README')
    expect(makeZipSafeName('README', seen)).toBe('README-2')
  })
})
