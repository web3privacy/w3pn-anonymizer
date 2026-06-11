export type AudioPrivacyMode =
  | 'keep_original'
  | 'remove_audio'
  | 'distort_voice'

/** Voice-mask presets focused on strong de-identification via modulation only (no noise bed). */
export type AudioEffectPreset =
  | 'maximum_mask'
  | 'heavy_scramble'
  | 'broken_timing'
  | 'custom'

export type AudioEffectSettings = {
  mode: AudioPrivacyMode
  preset: AudioEffectPreset
  intensity: number
  pitchSemitones?: number
  formantShift?: number
  bitcrushAmount?: number
  ringModFrequency?: number
  lowpassHz?: number
  highpassHz?: number
  noiseAmount?: number
  tremoloDepth?: number
  tremoloRate?: number
  compressorAmount?: number
  randomizationAmount?: number
}

export const AUDIO_PRIVACY_WARNING =
  'Voice distortion can reduce recognizability, but it is not guaranteed to defeat forensic speaker recognition. For strongest privacy, remove audio completely.'
