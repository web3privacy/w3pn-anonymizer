import type { VoiceMaskParams, VoiceMaskPresetId, VoiceMaskSettings } from './voiceMaskTypes'

type PresetBase = {
  label: string
  description: string
  pitchRange: [number, number] // semitones; per-session random pick
  randomization: number
  highpassHz: number
  lowpassHz: number
  noiseAmount: number
  gateThreshold: number
  /** Multiplier applied to the user strength (0..1) for this preset's character. */
  strengthMul: number
}

/** Live voice presets mirror the audio-mode distortion set (+ Off for raw recording). */
export const VOICE_MASK_PRESETS: Record<VoiceMaskPresetId, PresetBase> = {
  off: {
    label: 'Off',
    description: 'Raw microphone — no masking on live recordings.',
    pitchRange: [0, 0],
    randomization: 0,
    highpassHz: 80,
    lowpassHz: 12000,
    noiseAmount: 0,
    gateThreshold: 0.008,
    strengthMul: 0,
  },
  maximum_mask: {
    label: 'Maximum Mask',
    description: 'Heavy pitch/formant scramble — strongest de-identification.',
    pitchRange: [-8, -4],
    randomization: 0.18,
    highpassHz: 260,
    lowpassHz: 2600,
    noiseAmount: 0,
    gateThreshold: 0.012,
    strengthMul: 1,
  },
  heavy_scramble: {
    label: 'Heavy Scramble',
    description: 'Aggressive formant + ring modulation for an unrecognizable timbre.',
    pitchRange: [-6, -2],
    randomization: 0.28,
    highpassHz: 320,
    lowpassHz: 3200,
    noiseAmount: 0,
    gateThreshold: 0.012,
    strengthMul: 1,
  },
  broken_timing: {
    label: 'Broken Timing',
    description: 'Strong amplitude wobble + pitch drift to smear temporal cues.',
    pitchRange: [-5, -1],
    randomization: 0.32,
    highpassHz: 280,
    lowpassHz: 3000,
    noiseAmount: 0,
    gateThreshold: 0.012,
    strengthMul: 1,
  },
}

export const VOICE_MASK_PRESET_LIST: VoiceMaskPresetId[] = [
  'off', 'maximum_mask', 'heavy_scramble', 'broken_timing',
]

/**
 * Resolve preset + user sliders into DSP params. A per-session `seed` (0..1)
 * picks a stable random pitch within the preset's range so every session sounds
 * different but consistent within itself.
 */
export function resolveVoiceMaskParams(settings: VoiceMaskSettings, seed: number): VoiceMaskParams {
  const base = VOICE_MASK_PRESETS[settings.preset]
  const strength = Math.min(1, Math.max(0, settings.strength / 100)) * base.strengthMul
  const intelligibility = Math.min(1, Math.max(0, settings.intelligibility / 100))
  const [lo, hi] = base.pitchRange
  const pitchBias = lo + (hi - lo) * seed
  return {
    strength,
    intelligibility,
    pitchBias,
    randomization: base.randomization,
    highpassHz: base.highpassHz,
    lowpassHz: base.lowpassHz,
    noiseAmount: base.noiseAmount,
    gateThreshold: base.gateThreshold,
  }
}
