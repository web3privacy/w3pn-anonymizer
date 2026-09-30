import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('temporary video file lifecycle', () => {
  const writes: { position: number; data: Uint8Array | Blob }[] = []
  const removeEntry = vi.fn(async () => {})
  const writer = { write: vi.fn(async (data) => { writes.push(data) }), close: vi.fn(async () => {}), abort: vi.fn(async () => {}) }
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks(); writes.length = 0
    writer.write.mockImplementation(async (data) => { writes.push(data) })
    const directory = { removeEntry, getFileHandle: vi.fn(async () => ({
      createWritable: async () => writer,
      getFile: async () => new Blob(['file-backed-output']),
    })) }
    vi.stubGlobal('navigator', { storage: { getDirectory: async () => ({ getDirectoryHandle: async () => directory }) } })
  })
  afterEach(() => vi.unstubAllGlobals())
  it('owns copied buffers, serializes positional writes and cleans up released output', async () => {
    const { VideoTempFile, releaseVideoFile, transferVideoFileOwnership } = await import('./video-storage')
    const file = await VideoTempFile.create()
    const buffer = new Uint8Array([1, 2, 3])
    file.write(buffer); buffer.fill(9)
    file.write(new Uint8Array([7]), 1)
    const output = await file.finish('video/webm')
    expect(file.size).toBe(3)
    expect([...writes[0].data as Uint8Array]).toEqual([1, 2, 3])
    expect(writes[1].position).toBe(1)
    expect(writer.close).toHaveBeenCalledOnce()
    const normalized = new Blob([output])
    transferVideoFileOwnership(output, normalized)
    await releaseVideoFile(output)
    expect(removeEntry).not.toHaveBeenCalled()
    await releaseVideoFile(normalized)
    expect(removeEntry).toHaveBeenCalledOnce()
  })
  it('surfaces asynchronous disk failure and removes partial files', async () => {
    writer.write.mockRejectedValue(new DOMException('Disk full', 'QuotaExceededError'))
    const { VideoTempFile } = await import('./video-storage')
    const file = await VideoTempFile.create()
    file.write(new Uint8Array([1]))
    await expect(file.drain()).rejects.toThrow('disk space')
    await expect(file.finish()).rejects.toThrow('disk space')
    await file.dispose()
    expect(writer.abort).toHaveBeenCalledOnce()
    expect(removeEntry).toHaveBeenCalledOnce()
  })
  it('keeps a library result readable until an in-flight export releases it', async () => {
    const { VideoTempFile, releaseVideoFile, retainVideoFile } = await import('./video-storage')
    const file = await VideoTempFile.create()
    const blob = await file.finish()
    const finishExport = retainVideoFile(blob)!
    await releaseVideoFile(blob)
    expect(removeEntry).not.toHaveBeenCalled()
    await finishExport()
    await finishExport()
    expect(removeEntry).toHaveBeenCalledOnce()
  })
  it('bounds pending writes rather than total file size', async () => {
    const { VideoTempFile } = await import('./video-storage')
    const file = await VideoTempFile.create()
    expect(() => file.write(new Uint8Array(33 * 1024 * 1024))).toThrow('cannot keep up')
    file.write(new Uint8Array([1]), 200 * 1024 * 1024)
    await file.drain()
    expect(file.size).toBe(200 * 1024 * 1024 + 1)
    await file.dispose()
  })
})
