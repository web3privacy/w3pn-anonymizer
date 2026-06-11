import { describe, it, expect } from 'vitest'
import { resolveAudioPreset, DEFAULT_AUDIO_EFFECT_SETTINGS } from './audioPresets'

describe('audioPresets', () => {
  it('scales intensity into preset parameters', () => {
    const low = resolveAudioPreset('maximum_mask', 10, DEFAULT_AUDIO_EFFECT_SETTINGS)
    const high = resolveAudioPreset('maximum_mask', 100, DEFAULT_AUDIO_EFFECT_SETTINGS)
    expect(Math.abs(high.pitchSemitones ?? 0)).toBeGreaterThan(Math.abs(low.pitchSemitones ?? 0))
  })

  it('keeps mode from base settings and never adds noise', () => {
    const out = resolveAudioPreset('heavy_scramble', 50, { ...DEFAULT_AUDIO_EFFECT_SETTINGS, mode: 'keep_original' })
    expect(out.mode).toBe('keep_original')
    expect(out.preset).toBe('heavy_scramble')
    expect(out.noiseAmount).toBe(0)
  })
})
