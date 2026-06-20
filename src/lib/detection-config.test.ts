import { describe, it, expect } from 'vitest'
import {
  DEFAULT_DETECTION_CONFIG,
  DEFAULT_DETECTION_SENSITIVITY,
  effectForDetectionType,
  isLikelyDetection,
  getCategoryConfig,
  sensitivityToConfidenceThreshold,
} from './detection-config'

describe('detection-config', () => {
  it('defaults to faces only; heavier YOLO/OCR targets are opt-in', () => {
    expect(DEFAULT_DETECTION_CONFIG.find((c) => c.type === 'face')?.enabled).toBe(true)
    expect(DEFAULT_DETECTION_CONFIG.filter((c) => c.type !== 'face').every((c) => !c.enabled)).toBe(true)
  })

  it('uses the curated per-target sensitivity defaults', () => {
    expect(DEFAULT_DETECTION_SENSITIVITY).toMatchObject({
      face: 25,
      person: 25,
      license_plate: 50,
      document: 100,
      pii_text: 100,
      object: 10,
    })
    for (const category of DEFAULT_DETECTION_CONFIG) {
      const sensitivity = DEFAULT_DETECTION_SENSITIVITY[
        category.type as keyof typeof DEFAULT_DETECTION_SENSITIVITY
      ]
      expect(category.confidenceThreshold).toBe(sensitivityToConfidenceThreshold(sensitivity))
    }
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
