import { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react'
import { cloneDetectionConfig, DEFAULT_DETECTION_CONFIG } from '../lib/detection-config'
import { isDetectionTypeOperational, sanitizeDetectionConfig } from '../lib/detections/detection-availability'
import {
  mergeDetectionConfig,
  readPrivacySettings,
  writePrivacySettings,
  type PersistedPrivacySettings,
} from '../lib/privacy-settings-storage'
import type { DetectionCategoryConfig, ModelAvailabilityStatus, PrivacyDetectionType } from '../types'
import type { AudioEffectSettings } from '../lib/audio/audioTypes'
import { DEFAULT_AUDIO_EFFECT_SETTINGS } from '../lib/audio/audioPresets'

export type ModelStatusMap = Record<string, ModelAvailabilityStatus>

const INITIAL_MODEL_STATUS: ModelStatusMap = {
  'yunet-face': 'loading',
  // 'loading' (not 'missing') until the probe resolves, so a default-on target
  // is not race-disabled by sanitizeDetectionConfig before the model is found.
  'yolo-coco': 'loading',
  'yolo-license-plate': 'loading',
  'yolo-privacy-custom': 'loading',
}

export function usePrivacyDetectionConfig() {
  const [detectionConfig, setDetectionConfigState] = useState<DetectionCategoryConfig[]>(() =>
    mergeDetectionConfig(readPrivacySettings().detectionConfig),
  )
  const [showDetectionLabels, setShowDetectionLabelsState] = useState(
    () => readPrivacySettings().showDetectionLabels,
  )
  const [audioSettings, setAudioSettingsState] = useState<AudioEffectSettings>(
    () => readPrivacySettings().audioSettings ?? DEFAULT_AUDIO_EFFECT_SETTINGS,
  )
  const [lastDetectionCounts, setLastDetectionCounts] = useState<Partial<Record<PrivacyDetectionType, number>>>({})
  const [modelStatus, setModelStatus] = useState<ModelStatusMap>(INITIAL_MODEL_STATUS)
  const [enabledClasses, setEnabledClassesState] = useState<string[]>(
    () => readPrivacySettings().enabledClasses,
  )

  const persist = useCallback((patch: Partial<PersistedPrivacySettings>) => {
    const next: PersistedPrivacySettings = {
      detectionConfig: patch.detectionConfig ?? detectionConfig,
      showDetectionLabels: patch.showDetectionLabels ?? showDetectionLabels,
      audioSettings: patch.audioSettings ?? audioSettings,
      enabledClasses: patch.enabledClasses ?? enabledClasses,
    }
    writePrivacySettings(next)
  }, [detectionConfig, showDetectionLabels, audioSettings, enabledClasses])

  const setDetectionConfig = useCallback((updater: DetectionCategoryConfig[] | ((cur: DetectionCategoryConfig[]) => DetectionCategoryConfig[])) => {
    setDetectionConfigState((cur) => {
      const next = typeof updater === 'function' ? updater(cur) : updater
      persist({ detectionConfig: next })
      return next
    })
  }, [persist])

  const setCategoryEnabled = useCallback((type: PrivacyDetectionType, enabled: boolean) => {
    setDetectionConfig((cur) => {
      if (enabled && !isDetectionTypeOperational(type, modelStatus)) return cur
      return cur.map((c) => (c.type === type ? { ...c, enabled } : c))
    })
  }, [setDetectionConfig, modelStatus])

  const setCategoryThreshold = useCallback((type: PrivacyDetectionType, confidenceThreshold: number) => {
    setDetectionConfig((cur) =>
      cur.map((c) => (c.type === type ? { ...c, confidenceThreshold } : c)),
    )
  }, [setDetectionConfig])

  const resetDetectionConfig = useCallback(() => {
    const fresh = cloneDetectionConfig(DEFAULT_DETECTION_CONFIG)
    setDetectionConfig(fresh)
  }, [setDetectionConfig])

  const setShowDetectionLabels = useCallback((value: SetStateAction<boolean>) => {
    setShowDetectionLabelsState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      persist({ showDetectionLabels: next })
      return next
    })
  }, [persist])

  const setAudioSettings = useCallback((updater: AudioEffectSettings | ((cur: AudioEffectSettings) => AudioEffectSettings)) => {
    setAudioSettingsState((cur) => {
      const next = typeof updater === 'function' ? updater(cur) : updater
      persist({ audioSettings: next })
      return next
    })
  }, [persist])

  const setEnabledClasses = useCallback((updater: string[] | ((cur: string[]) => string[])) => {
    setEnabledClassesState((cur) => {
      const next = typeof updater === 'function' ? updater(cur) : updater
      persist({ enabledClasses: next })
      return next
    })
  }, [persist])

  const toggleDetectionClass = useCallback((className: string, enabled: boolean) => {
    setEnabledClasses((cur) => {
      if (enabled) return cur.includes(className) ? cur : [...cur, className]
      return cur.filter((c) => c !== className)
    })
  }, [setEnabledClasses])

  const enabledCategories = useMemo(
    () => detectionConfig.filter((c) => c.enabled),
    [detectionConfig],
  )

  useEffect(() => {
    setDetectionConfigState((cur) => {
      const next = sanitizeDetectionConfig(cur, modelStatus)
      const changed = next.some((c, i) => c.enabled !== cur[i]?.enabled)
      if (!changed) return cur
      persist({ detectionConfig: next })
      return next
    })
  }, [modelStatus, persist])

  useEffect(() => {
    // Hydrate from storage on mount (SSR-safe noop in browser only once)
    const saved = readPrivacySettings()
    setDetectionConfigState(mergeDetectionConfig(saved.detectionConfig))
    setShowDetectionLabelsState(saved.showDetectionLabels)
    setAudioSettingsState(saved.audioSettings)
    setEnabledClassesState(saved.enabledClasses)
  }, [])

  return {
    detectionConfig,
    setDetectionConfig,
    setCategoryEnabled,
    setCategoryThreshold,
    resetDetectionConfig,
    enabledCategories,
    showDetectionLabels,
    setShowDetectionLabels,
    audioSettings,
    setAudioSettings,
    lastDetectionCounts,
    setLastDetectionCounts,
    modelStatus,
    setModelStatus,
    enabledClasses,
    setEnabledClasses,
    toggleDetectionClass,
  }
}

export type PrivacyDetectionConfigBindings = ReturnType<typeof usePrivacyDetectionConfig>
