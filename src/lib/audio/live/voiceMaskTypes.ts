export type VoiceMaskPresetId =
  | 'off'
  | 'maximum_mask'
  | 'heavy_scramble'
  | 'broken_timing'

/** Resolved DSP parameters for the live voice-mask graph. */
export type VoiceMaskParams = {
  /** 0..1 — overall destruction amount (drives the worklet). */
  strength: number
  /** 0..1 — higher keeps words clearer (less destruction). */
  intelligibility: number
  /** Base pitch offset in semitones (randomized per session within a range). */
  pitchBias: number
  /** Pitch-contour randomization 0..1 (time-varying wander). */
  randomization: number
  highpassHz: number
  lowpassHz: number
  /** Additive radio hiss 0..1. */
  noiseAmount: number
  /** Noise-gate threshold (linear amplitude). */
  gateThreshold: number
}

/** User-facing settings persisted as UI prefs (never audio). */
export type VoiceMaskSettings = {
  enabled: boolean
  preset: VoiceMaskPresetId
  /** 0..100 UI slider. */
  strength: number
  /** 0..100 UI slider. */
  intelligibility: number
  /** Monitor the anonymized output through the speakers (default off). */
  monitor: boolean
}

export const DEFAULT_VOICE_MASK_SETTINGS: VoiceMaskSettings = {
  enabled: false,
  preset: 'maximum_mask',
  strength: 75,
  intelligibility: 60,
  monitor: false,
}
