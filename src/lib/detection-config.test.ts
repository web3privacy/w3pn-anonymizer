import { describe, it, expect } from 'vitest'
import {
  DEFAULT_DETECTION_CONFIG,
  effectForDetectionType,
  isLikelyDetection,
  getCategoryConfig,
} from './detection-config'

describe('detection-config', () => {
  it('defaults to faces, people, license plates, documents and sensitive text; other targets disabled', () => {
    const enabledByDefault = ['face', 'person', 'license_plate', 'document', 'pii_text']
    for (const type of enabledByDefault) {
      expect(DEFAULT_DETECTION_CONFIG.find((c) => c.type === type)?.enabled).toBe(true)
    }
    const otherDefaultsOff = DEFAULT_DETECTION_CONFIG
      .filter((c) => !enabledByDefault.includes(c.type))
      .every((c) => !c.enabled)
    expect(otherDefaultsOff).toBe(true)
  })

  it('always uses the single global effect for every detection type', () => {
    expect(effectForDetectionType('face', DEFAULT_DETECTION_CONFIG, 'emoji')).toBe('emoji')
    expect(effectForDetectionType('license_plate', DEFAULT_DETECTION_CONFIG, 'pixelate')).toBe('pixelate')
    expect(effectForDetectionType('pii_text', DEFAULT_DETECTION_CONFIG, 'blur')).toBe('blur')
  })

  it('filters plausible video faces', () => {
    const w = 1280
    const h = 720
    expect(isLikelyDetection({ width: 80, height: 90, score: 0.9 }, 'face', w, h)).toBe(true)
    expect(isLikelyDetection({ width: 4, height: 4, score: 0.9 }, 'face', w, h)).toBe(false)
  })

  it('getCategoryConfig returns matching type', () => {
    const face = getCategoryConfig(DEFAULT_DETECTION_CONFIG, 'face')
    expect(face?.label).toBe('Faces')
  })
})
