import { afterEach, describe, expect, it, vi } from 'vitest'
const bridge = vi.hoisted(() => ({ beginExport: vi.fn(), appendExport: vi.fn(), finishExport: vi.fn(), cancelExport: vi.fn() }))
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'android' }, registerPlugin: () => bridge }))
import { exportBlob } from './native-media-library'

afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks() })
function setup() {
  const sizes: number[] = []
  bridge.beginExport.mockResolvedValue({ id: 'job' })
  bridge.appendExport.mockResolvedValue(undefined)
  bridge.finishExport.mockResolvedValue({})
  bridge.cancelExport.mockResolvedValue(undefined)
  vi.stubGlobal('FileReader', class {
    result = ''; onload?: () => void
    async readAsDataURL(blob: Blob) {
      sizes.push(blob.size)
      this.result = `data:application/octet-stream;base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`
      this.onload?.()
    }
  })
  return sizes
}

describe('native exports', () => {
  it('transfers bounded chunks instead of converting the entire video to base64', async () => {
    const sizes = setup()
    await exportBlob(new Blob([new Uint8Array(600_000)]), 'video.webm')
    expect(sizes).toEqual([262144, 262144, 75712])
    expect(bridge.finishExport).toHaveBeenCalledExactlyOnceWith({ id: 'job' })
    expect(bridge.cancelExport).toHaveBeenCalledExactlyOnceWith({ id: 'job' })
  })
  it('cleans up a partially written export and propagates native errors', async () => {
    setup(); bridge.appendExport.mockRejectedValueOnce(new Error('Disk full'))
    await expect(exportBlob(new Blob(['private']), 'sample.txt')).rejects.toThrow('Disk full')
    expect(bridge.finishExport).not.toHaveBeenCalled()
    expect(bridge.cancelExport).toHaveBeenCalledExactlyOnceWith({ id: 'job' })
  })
})
