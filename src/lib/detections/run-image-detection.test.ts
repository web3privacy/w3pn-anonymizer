import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  applyFaceConfidenceToConfig,
  formatDetectionSummary,
  usesExtendedPrivacyDetection,
} from './run-image-detection'
import { DEFAULT_DETECTION_CONFIG } from '../detection-config'

describe('run-image-detection helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('applyFaceConfidenceToConfig updates face threshold only', () => {
    const next = applyFaceConfidenceToConfig(DEFAULT_DETECTION_CONFIG, 0.42)
    expect(next.find((c) => c.type === 'face')?.confidenceThreshold).toBe(0.42)
    expect(next.find((c) => c.type === 'person')?.confidenceThreshold).toBe(0.45)
  })

  it('usesExtendedPrivacyDetection when enabled target has ready model', () => {
    const config = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'person' ? { ...c, enabled: true } : c,
    )
    expect(
      usesExtendedPrivacyDetection(config, { 'yolo-coco': 'ready', 'yunet-face': 'ready' }),
    ).toBe(true)
    expect(
      usesExtendedPrivacyDetection(config, { 'yolo-coco': 'missing', 'yunet-face': 'ready' }),
    ).toBe(false)
  })

  it('usesExtendedPrivacyDetection when enabledClasses set and a YOLO model is ready', () => {
    // Face-only config, but raw classes requested.
    expect(
      usesExtendedPrivacyDetection(
        DEFAULT_DETECTION_CONFIG,
        { 'yolo-coco': 'ready', 'yunet-face': 'ready' },
        ['car'],
      ),
    ).toBe(true)
    // No ready object model → falls back to face path.
    expect(
      usesExtendedPrivacyDetection(
        DEFAULT_DETECTION_CONFIG,
        { 'yolo-coco': 'loading', 'yunet-face': 'ready' },
        ['car'],
      ),
    ).toBe(false)
    // Empty classes → face path.
    expect(
      usesExtendedPrivacyDetection(DEFAULT_DETECTION_CONFIG, { 'yolo-coco': 'ready' }, []),
    ).toBe(false)
  })

  it('formatDetectionSummary lists counts', () => {
    const msg = formatDetectionSummary({ face: 2, person: 1 }, 120, true)
    expect(msg).toContain('2 faces')
    expect(msg).toContain('1 person')
    expect(msg).toContain('120 ms')
  })
})
