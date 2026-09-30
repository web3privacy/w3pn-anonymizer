import { afterEach, describe, expect, it, vi } from 'vitest'
import { ZoneEffectPreview } from './zone-effect-preview'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

function setup() {
  const bitmaps: Array<{ width: number; height: number; close: ReturnType<typeof vi.fn> }> = []
  vi.stubGlobal('createImageBitmap', vi.fn(async () => {
    const bitmap = { width: 800, height: 479, close: vi.fn() }
    bitmaps.push(bitmap)
    return bitmap
  }))
  vi.stubGlobal('document', { createElement: () => {
    const canvas = { width: 0, height: 0, getContext: () => ctx }
    const ctx = { canvas, clearRect: vi.fn(), drawImage: vi.fn() }
    return canvas
  } })
  return { preview: new ZoneEffectPreview(), bitmaps }
}

describe('zone effect preview lifecycle', () => {
  it('decodes once while changing strength and closes the original when switching photos', async () => {
    const { preview, bitmaps } = setup()
    const original = new Blob(['first'])
    const commit = vi.fn()
    await preview.render(original, 1, vi.fn(), commit)
    await preview.render(original, 1, vi.fn(), commit)
    expect(createImageBitmap).toHaveBeenCalledTimes(1)
    await preview.render(new Blob(['second']), 1, vi.fn(), commit)
    expect(bitmaps[0].close).toHaveBeenCalledTimes(1)
    preview.dispose()
    expect(bitmaps[1].close).toHaveBeenCalledTimes(1)
  })

  it('never commits a stale in-flight decode after a photo switch', async () => {
    const { preview } = setup()
    let finish!: (bitmap: ImageBitmap) => void
    const bitmap = { width: 800, height: 479, close: vi.fn() }
    vi.stubGlobal('createImageBitmap', () => new Promise<ImageBitmap>((resolve) => { finish = resolve }))
    const commit = vi.fn()
    const pending = preview.render(new Blob(), 1, vi.fn(), commit)
    preview.dispose()
    finish(bitmap as unknown as ImageBitmap)
    expect(await pending).toBe(false)
    expect(commit).not.toHaveBeenCalled()
    expect(bitmap.close).toHaveBeenCalledTimes(1)
  })

  it('abandons superseded work without publishing a partially processed photo', async () => {
    const { preview } = setup()
    const commit = vi.fn()
    const apply = vi.fn(() => preview.invalidate())
    expect(await preview.render(new Blob(), 3, apply, commit)).toBe(false)
    expect(apply).toHaveBeenCalledTimes(1)
    expect(commit).not.toHaveBeenCalled()
  })
})
