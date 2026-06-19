import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readPrivacySettings, writePrivacySettings, mergeDetectionConfig } from './privacy-settings-storage'
import { DEFAULT_DETECTION_CONFIG } from './detection-config'

describe('privacy-settings-storage', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v) },
      removeItem: (k: string) => { store.delete(k) },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('roundtrips detection config and audio settings', () => {
    const config = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'person' ? { ...c, enabled: true, confidenceThreshold: 0.5 } : c,
    )
    writePrivacySettings({
      detectionConfig: config,
      showDetectionLabels: true,
      audioSettings: { mode: 'remove_audio', preset: 'heavy_scramble', intensity: 50 },
      enabledClasses: ['car', 'dog'],
    })
    const loaded = readPrivacySettings()
    expect(loaded.showDetectionLabels).toBe(true)
    expect(loaded.audioSettings.mode).toBe('remove_audio')
    expect(loaded.detectionConfig.find((c) => c.type === 'person')?.enabled).toBe(true)
    expect(loaded.enabledClasses).toEqual(['car', 'dog'])
  })

  it('mergeDetectionConfig preserves new default fields', () => {
    const saved = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'face' ? { ...c, enabled: false, confidenceThreshold: 0.4 } : c,
    )
    const merged = mergeDetectionConfig(saved)
    expect(merged.find((c) => c.type === 'face')?.enabled).toBe(true)
    expect(merged.find((c) => c.type === 'face')?.confidenceThreshold).toBe(0.4)
    expect(merged.find((c) => c.type === 'screen')?.label).toBe('Screens / displays')
  })

  it('migrates old (unversioned) settings to faces-only defaults', () => {
    const oldConfig = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type !== 'face' ? { ...c, enabled: true } : c,
    )
    store.set(
      'anonymizer-privacy-settings',
      JSON.stringify({ detectionConfig: oldConfig, showDetectionLabels: false }),
    )
    const loaded = readPrivacySettings()
    expect(loaded.detectionConfig.find((c) => c.type === 'face')?.enabled).toBe(true)
    expect(loaded.detectionConfig.filter((c) => c.type !== 'face').every((c) => !c.enabled)).toBe(true)
  })

  it('migrates v6 settings to faces-only and clears raw classes', () => {
    const oldConfig = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type !== 'face' ? { ...c, enabled: true } : c,
    )
    store.set(
      'anonymizer-privacy-settings',
      JSON.stringify({
        version: 6,
        detectionConfig: oldConfig,
        showDetectionLabels: false,
        audioSettings: { mode: 'keep_original', preset: 'maximum_mask', intensity: 0 },
        enabledClasses: ['car', 'truck'],
      }),
    )
    const loaded = readPrivacySettings()
    expect(loaded.detectionConfig.find((c) => c.type === 'face')?.enabled).toBe(true)
    expect(loaded.detectionConfig.filter((c) => c.type !== 'face').every((c) => !c.enabled)).toBe(true)
    expect(loaded.enabledClasses).toEqual([])
  })

  it('respects user choice to disable License plates on current version', () => {
    const config = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'license_plate' ? { ...c, enabled: false } : c,
    )
    writePrivacySettings({
      detectionConfig: config,
      showDetectionLabels: false,
      audioSettings: { mode: 'keep_original', preset: 'maximum_mask', intensity: 0 },
      enabledClasses: [],
    })
    const loaded = readPrivacySettings()
    expect(loaded.detectionConfig.find((c) => c.type === 'license_plate')?.enabled).toBe(false)
  })
})
