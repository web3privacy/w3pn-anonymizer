import { expect, it, vi } from 'vitest'
import { renderProcessedAudioBuffer } from './audioPipeline'
it('remove_audio exports silence and never returns the original voice buffer', async () => {
  const source = { numberOfChannels: 2, length: 48000, sampleRate: 48000 } as AudioBuffer
  const silent = { marker: 'silent' } as unknown as AudioBuffer
  const context = { createBuffer: vi.fn(() => silent) } as unknown as AudioContext
  expect(await renderProcessedAudioBuffer(context, source, { mode: 'remove_audio', preset: 'maximum_mask', intensity: 1 })).toBe(silent)
  expect(context.createBuffer).toHaveBeenCalledWith(2, 48000, 48000)
  expect(await renderProcessedAudioBuffer(context, source, { mode: 'keep_original', preset: 'maximum_mask', intensity: 1 })).toBe(source)
})
