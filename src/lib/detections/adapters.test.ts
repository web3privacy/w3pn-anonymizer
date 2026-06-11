import { describe, it, expect } from 'vitest'
import {
  faceBoxToPrivacyDetection,
  privacyDetectionToZone,
  privacyDetectionsToZones,
  zoneToManualDetection,
} from './adapters'
import { DEFAULT_DETECTION_CONFIG } from '../detection-config'

describe('detection adapters', () => {
  it('converts face box to privacy detection with normalized bbox', () => {
    const det = faceBoxToPrivacyDetection({ x: 100, y: 50, width: 80, height: 90, score: 0.88 }, 400, 300)
    expect(det.type).toBe('face')
    expect(det.bbox.x).toBeCloseTo(0.25)
    expect(det.confidence).toBe(0.88)
  })

  it('maps privacy detection to zone with face offset', () => {
    const det = faceBoxToPrivacyDetection({ x: 100, y: 50, width: 80, height: 90, score: 0.9 }, 400, 300)
    const zone = privacyDetectionToZone(det, {
      config: DEFAULT_DETECTION_CONFIG,
      globalEffect: 'blur',
      emoji: '😶',
      faceOffsetPercent: 40,
      imageW: 400,
      imageH: 300,
    })
    expect(zone.effect).toBe('blur')
    expect(zone.detectionType).toBe('face')
    expect(zone.width).toBeGreaterThan(det.bbox.width)
  })

  it('assigns unique emojis via privacyDetectionsToZones', () => {
    const dets = [
      faceBoxToPrivacyDetection({ x: 10, y: 10, width: 40, height: 40 }, 200, 200),
      faceBoxToPrivacyDetection({ x: 120, y: 10, width: 40, height: 40 }, 200, 200),
    ]
    const zones = privacyDetectionsToZones(dets, {
      config: DEFAULT_DETECTION_CONFIG,
      globalEffect: 'emoji',
      emojis: ['🎭', '😎'],
      imageW: 200,
      imageH: 200,
    })
    expect(zones).toHaveLength(2)
    expect(zones[0].emoji).toBe('🎭')
    expect(zones[1].emoji).toBe('😎')
  })

  it('round-trips manual zones', () => {
    const det = zoneToManualDetection({
      id: 'z1',
      x: 0.1,
      y: 0.2,
      width: 0.3,
      height: 0.4,
      effect: 'blur',
      emoji: '😶',
      detectionType: 'manual_zone',
    })
    expect(det.type).toBe('manual_zone')
    expect(det.bbox.width).toBe(0.3)
  })
})
