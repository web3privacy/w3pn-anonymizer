import type { AudioEffectPreset, AudioEffectSettings } from './audioTypes'

export const DEFAULT_AUDIO_EFFECT_SETTINGS: AudioEffectSettings = {
  mode: 'distort_voice',
  preset: 'maximum_mask',
  intensity: 75,
}

export const DEFAULT_VIDEO_AUDIO_SETTINGS: AudioEffectSettings = {
  mode: 'keep_original',
  preset: 'maximum_mask',
  intensity: 75,
}

const LEGACY_PRESETS = new Set([
  'light_disguise', 'deep_voice', 'high_voice', 'anonymous_witness',
  'robot', 'radio_mask', 'glitch', 'maximum_distortion',
  'monster', 'chipmunk', 'telephone', 'whisper', 'underwater', 'alien',
])

/** Map stored / legacy preset ids to the current slim set. */
export function normalizeAudioPreset(preset: string): AudioEffectPreset {
  if (preset === 'maximum_distortion') return 'maximum_mask'
  if (preset === 'maximum_mask' || preset === 'heavy_scramble' || preset === 'broken_timing' || preset === 'custom') {
    return preset
  }
  if (LEGACY_PRESETS.has(preset)) return 'maximum_mask'
  return 'maximum_mask'
}

type PresetParams = Omit<AudioEffectSettings, 'mode' | 'preset' | 'intensity'>

const PRESET_BASE: Record<AudioEffectPreset, PresetParams> = {
  // Maximum mask — heavy pitch/formant/ring modulation, no additive noise.
  maximum_mask: {
    pitchSemitones: -8,
    formantShift: -0.35,
    bitcrushAmount: 0.55,
    ringModFrequency: 55,
    lowpassHz: 2600,
    highpassHz: 260,
    noiseAmount: 0,
    compressorAmount: 0.75,
    tremoloDepth: 0.14,
    tremoloRate: 5.5,
    randomizationAmount: 0.18,
  },
  // Heavy scramble — pushes formant + ring + crush for an unrecognizable timbre.
  heavy_scramble: {
    pitchSemitones: -6,
    formantShift: 0.55,
    bitcrushAmount: 0.65,
    ringModFrequency: 85,
    lowpassHz: 3200,
    highpassHz: 320,
    noiseAmount: 0,
    compressorAmount: 0.7,
    tremoloDepth: 0.22,
    tremoloRate: 7,
    randomizationAmount: 0.28,
  },
  // Broken timing — strong amplitude LFO + pitch wobble to smear temporal cues.
  broken_timing: {
    pitchSemitones: -5,
    formantShift: -0.2,
    bitcrushAmount: 0.45,
    ringModFrequency: 40,
    lowpassHz: 3000,
    highpassHz: 280,
    noiseAmount: 0,
    compressorAmount: 0.65,
    tremoloDepth: 0.55,
    tremoloRate: 11,
    randomizationAmount: 0.32,
  },
  custom: {},
}

export function resolveAudioPreset(
  preset: AudioEffectPreset,
  intensity: number,
  base?: Partial<AudioEffectSettings>,
): AudioEffectSettings {
  if (preset === 'custom') {
    return {
      mode: base?.mode ?? DEFAULT_AUDIO_EFFECT_SETTINGS.mode,
      preset: 'custom',
      intensity,
      pitchSemitones: base?.pitchSemitones ?? 0,
      formantShift: base?.formantShift ?? 0,
      bitcrushAmount: base?.bitcrushAmount ?? 0,
      ringModFrequency: base?.ringModFrequency,
      lowpassHz: base?.lowpassHz ?? 8000,
      highpassHz: base?.highpassHz ?? 80,
      noiseAmount: base?.noiseAmount ?? 0,
      tremoloDepth: base?.tremoloDepth ?? 0,
      tremoloRate: base?.tremoloRate ?? 5,
      compressorAmount: base?.compressorAmount ?? 0,
      randomizationAmount: base?.randomizationAmount ?? 0,
    }
  }

  const t = Math.min(100, Math.max(0, intensity)) / 100
  const params = PRESET_BASE[preset] ?? {}
  const scale = (v: number | undefined, mul = 1) => (v ?? 0) * (0.35 + t * 0.65) * mul

  return {
    mode: base?.mode ?? DEFAULT_AUDIO_EFFECT_SETTINGS.mode,
    preset,
    intensity,
    pitchSemitones: scale(params.pitchSemitones, 1),
    formantShift: scale(params.formantShift, 1),
    bitcrushAmount: scale(params.bitcrushAmount, 1),
    ringModFrequency: params.ringModFrequency ?? base?.ringModFrequency,
    lowpassHz: params.lowpassHz ?? base?.lowpassHz ?? 8000,
    highpassHz: params.highpassHz ?? base?.highpassHz ?? 80,
    noiseAmount: 0,
    tremoloDepth: scale(params.tremoloDepth, 1),
    tremoloRate: params.tremoloRate ?? base?.tremoloRate ?? 5,
    compressorAmount: scale(params.compressorAmount, 1),
    randomizationAmount: scale(params.randomizationAmount, 1),
  }
}

export const AUDIO_PRESET_LABELS: Record<AudioEffectPreset, string> = {
  maximum_mask: 'Maximum mask',
  heavy_scramble: 'Heavy scramble',
  broken_timing: 'Broken timing',
  custom: 'Custom',
}
