import { describe, it, expect } from 'vitest'
import {
  getDetectionAvailability,
  isDetectionTypeOperational,
  sanitizeDetectionConfig,
} from './detection-availability'
import { DEFAULT_DETECTION_CONFIG } from '../detection-config'

describe('detection-availability', () => {
  const status = {
    'yunet-face': 'ready' as const,
    'yolo-coco': 'missing' as const,
    'yolo-license-plate': 'missing' as const,
    'yolo-privacy-custom': 'missing' as const,
  }

  it('face is ready when YuNet is ready', () => {
    expect(getDetectionAvailability('face', status)).toBe('ready')
    expect(isDetectionTypeOperational('face', status)).toBe(true)
  })

  it('YOLO-backed types are coming soon without ONNX', () => {
    expect(getDetectionAvailability('person', status)).toBe('coming_soon')
    expect(isDetectionTypeOperational('person', status)).toBe(false)
  })

  it('sanitizes enabled flags for unavailable types', () => {
    const dirty = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'person' ? { ...c, enabled: true } : c,
    )
    const clean = sanitizeDetectionConfig(dirty, status)
    expect(clean.find((c) => c.type === 'person')?.enabled).toBe(false)
    expect(clean.find((c) => c.type === 'face')?.enabled).toBe(true)
  })

  it('does NOT disable enabled targets while their model is still loading', () => {
    const loadingStatus = { ...status, 'yolo-license-plate': 'loading' as const }
    const dirty = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'license_plate' ? { ...c, enabled: true } : c,
    )
    const clean = sanitizeDetectionConfig(dirty, loadingStatus)
    expect(clean.find((c) => c.type === 'license_plate')?.enabled).toBe(true)
  })

  it('disables enabled targets once their model is confirmed missing', () => {
    const dirty = DEFAULT_DETECTION_CONFIG.map((c) =>
      c.type === 'license_plate' ? { ...c, enabled: true } : c,
    )
    const clean = sanitizeDetectionConfig(dirty, status)
    expect(clean.find((c) => c.type === 'license_plate')?.enabled).toBe(false)
  })
})
