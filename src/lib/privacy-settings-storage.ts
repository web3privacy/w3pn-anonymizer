import {
  cloneDetectionConfig,
  DEFAULT_DETECTION_CONFIG,
} from './detection-config'
import type { DetectionCategoryConfig } from '../types'
import type { AudioEffectSettings } from './audio/audioTypes'
import { DEFAULT_AUDIO_EFFECT_SETTINGS, normalizeAudioPreset } from './audio/audioPresets'

const STORAGE_KEY = 'anonymizer-privacy-settings'
// Bump when default-enabled targets change so existing users pick up new
// defaults (e.g. License plates / SPZ becoming enabled by default in v2,
// Sensitive text / PII in v3). v4 re-baselines the whole enabled set to the
// curated defaults (faces, people, SPZ, documents, sensitive text) and clears
// any extra "All classes" toggles. v6/v7 switch the default back to face-only
// so heavy YOLO/OCR models lazy-load only after a user enables those targets.
const SETTINGS_VERSION = 7
// Types enabled by default per DEFAULT_DETECTION_CONFIG (kept in sync there).
const DEFAULT_ENABLED_TYPES = new Set<DetectionCategoryConfig['type']>(
  DEFAULT_DETECTION_CONFIG.filter((c) => c.enabled).map((c) => c.type),
)

export type PersistedPrivacySettings = {
  detectionConfig: DetectionCategoryConfig[]
  showDetectionLabels: boolean
  audioSettings: AudioEffectSettings
  /** Raw YOLO class names enabled via the "All classes" sheet (generic 'object' detections). */
  enabledClasses: string[]
}

const DEFAULT_SETTINGS: PersistedPrivacySettings = {
  detectionConfig: cloneDetectionConfig(DEFAULT_DETECTION_CONFIG),
  showDetectionLabels: true,
  audioSettings: DEFAULT_AUDIO_EFFECT_SETTINGS,
  enabledClasses: [],
}

function isDetectionConfig(value: unknown): value is DetectionCategoryConfig[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof item.type === 'string' &&
      typeof item.enabled === 'boolean' &&
      typeof item.confidenceThreshold === 'number',
  )
}

/** Re-baseline which targets are enabled to the curated defaults when upgrading. */
function migrateDetectionConfig(
  config: DetectionCategoryConfig[],
  savedVersion: number,
): DetectionCategoryConfig[] {
  let next = config
  if (savedVersion < 4) {
    next = next.map((c) => ({ ...c, enabled: DEFAULT_ENABLED_TYPES.has(c.type) }))
  }
  // v5: document + PII text run at maximum sensitivity (lower threshold).
  if (savedVersion < 5) {
    next = next.map((c) => {
      if (c.type === 'document') return { ...c, confidenceThreshold: 0.22 }
      if (c.type === 'pii_text') return { ...c, confidenceThreshold: 0.22 }
      return c
    })
  }
  if (savedVersion < 7) {
    next = next.map((c) => ({ ...c, enabled: DEFAULT_ENABLED_TYPES.has(c.type) }))
  }
  return next
}

export function readPrivacySettings(): PersistedPrivacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS, detectionConfig: cloneDetectionConfig(DEFAULT_DETECTION_CONFIG) }
    const parsed = JSON.parse(raw) as Partial<PersistedPrivacySettings> & { version?: number }
    const savedVersion = typeof parsed.version === 'number' ? parsed.version : 1
    // Merge over defaults so newly-introduced categories (e.g. pii_text) appear
    // for existing users even if their saved config predates them.
    const baseConfig = isDetectionConfig(parsed.detectionConfig)
      ? mergeDetectionConfig(parsed.detectionConfig)
      : cloneDetectionConfig(DEFAULT_DETECTION_CONFIG)
    return {
      detectionConfig: migrateDetectionConfig(baseConfig, savedVersion),
      // Enable the tiny captions on upgrade; afterwards respect an explicit
      // opt-out only (a missing field keeps the product default of on).
      showDetectionLabels: savedVersion < SETTINGS_VERSION ? true : parsed.showDetectionLabels !== false,
      audioSettings: (() => {
        const raw = parsed.audioSettings && typeof parsed.audioSettings === 'object'
          ? parsed.audioSettings as Partial<import('./audio/audioTypes').AudioEffectSettings>
          : {}
        return {
          ...DEFAULT_AUDIO_EFFECT_SETTINGS,
          ...raw,
          preset: normalizeAudioPreset(String(raw.preset ?? DEFAULT_AUDIO_EFFECT_SETTINGS.preset)),
          noiseAmount: 0,
        }
      })(),
      // v4 re-baselines targets; drop any previously-enabled extra classes so
      // upgrading users land on the curated default set only.
      enabledClasses: savedVersion < SETTINGS_VERSION
        ? []
        : Array.isArray(parsed.enabledClasses)
          ? parsed.enabledClasses.filter((c): c is string => typeof c === 'string')
          : [],
    }
  } catch {
    return { ...DEFAULT_SETTINGS, detectionConfig: cloneDetectionConfig(DEFAULT_DETECTION_CONFIG) }
  }
}

export function writePrivacySettings(settings: PersistedPrivacySettings): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SETTINGS_VERSION,
        detectionConfig: settings.detectionConfig,
        showDetectionLabels: settings.showDetectionLabels,
        audioSettings: settings.audioSettings,
        enabledClasses: settings.enabledClasses,
      }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

export function mergeDetectionConfig(saved: DetectionCategoryConfig[]): DetectionCategoryConfig[] {
  const defaults = cloneDetectionConfig(DEFAULT_DETECTION_CONFIG)
  return defaults.map((def) => {
    const match = saved.find((s) => s.type === def.type)
    if (!match) return def
    return {
      ...def,
      enabled: def.type === 'face' ? true : match.enabled,
      confidenceThreshold: match.confidenceThreshold,
      effectId: match.effectId ?? def.effectId,
    }
  })
}
